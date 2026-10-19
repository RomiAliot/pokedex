import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { pokemonApi } from '../services/pokemonApi';
import favoritesReducer from '../features/favorites/favoritesSlice';

// Adapter de storage para redux-persist. El import clásico
// (redux-persist/lib/storage) es CommonJS y rompe con Vite/ESM.
// Ojo: nunca puede tirar de forma síncrona (una escritura llena rompería el
// setInterval de redux-persist); rechazamos la Promise y la librería la atrapa.
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* sin storage no hay nada que limpiar */
    }
    return Promise.resolve();
  },
};

// Versiones anteriores guardaban todo en 'persist:root' (un JSON de ~2.6MB que
// acoplaba el cache con favoritos); la clave vieja ahora solo ocupa cuota.
try {
  localStorage.removeItem('persist:root');
} catch {
  /* storage no disponible (modo privado u otros) */
}

// Campos de un detalle de pokemon que la app NUNCA lee (moves, sprites de todos
// los juegos, etc.): el JSON crudo de unos 80 detalles llega a ~6MB y supera los
// ~5MB de cuota de localStorage. Sin recortar, la escritura del cache falla.
const UNUSED_DETAIL_FIELDS = [
  'moves',
  'game_indices',
  'cries',
  'forms',
  'held_items',
  'past_abilities',
  'past_stats',
  'order',
  'base_experience',
  'location_area_encounters',
];

const SPLIT_SPRITES = ['front_default', 'back_default', 'front_shiny', 'back_shiny'];

// Devuelve una copia liviana de `queries` para guardar. Nunca muta el estado vivo
// (los objetos de RTK Query están congelados en dev). Idempotente: sirve tanto
// para guardar (in) como para leer (out).
function trimQueriesForStorage(queries) {
  const result = {};
  for (const [key, entry] of Object.entries(queries)) {
    // Solo viaja lo que resolvió. Una entrada 'pending' o 'error' rehidratada
    // queda muerta: RTK Query la trata como "request en vuelo" (buildThunks:
    // 'Don't retry a request that's currently in-flight') y jamás reintenta,
    // así que el badge de sincronización se cuelga para siempre.
    if (entry?.status !== 'fulfilled') continue;
    const data = entry?.data;
    // Listas (arrays de {name,url}) y entradas sin data son chicas: se guardan tal cual.
    if (!data || Array.isArray(data) || typeof data !== 'object') {
      result[key] = entry;
      continue;
    }
    const lightData = { ...data };
    for (const field of UNUSED_DETAIL_FIELDS) delete lightData[field];
    if (lightData.sprites) {
      const s = data.sprites;
      lightData.sprites = {
        ...Object.fromEntries(SPLIT_SPRITES.map((f) => [f, s[f]])),
        other: {
          'official-artwork': s.other?.['official-artwork'],
          home: s.other?.home,
        },
      };
    }
    result[key] = { ...entry, data: lightData };
  }
  return result;
}

// redux-persist llama in() al guardar y out() al leer. El mismo filtro corre en
// ambas puntas: lo que quedó envenenado en el storage (versiones anteriores) se
// descarta al rehidratar y nunca entra al store.
const cacheTransform = {
  in: (subState, key) => (key === 'queries' ? trimQueriesForStorage(subState) : subState),
  out: (subState, key) => (key === 'queries' ? trimQueriesForStorage(subState) : subState),
};

// Cada slice persiste en su CLAVE propia. Así un fallo de escritura del cache
// (localStorage lleno) no puede pisar a favoritos, que son datos del usuario.
const favoritesPersist = persistReducer(
  {
    key: 'favorites',
    storage,
    whitelist: ['items'],
  },
  favoritesReducer,
);

const apiPersist = persistReducer(
  {
    key: 'pokemonApi',
    storage,
    // Solo lo que sirve después de recargar: queries con datos resueltos.
    // Las mutations son efímeras y provisions se reconstruye al montar.
    whitelist: ['queries'],
    transforms: [cacheTransform],
    // Agrupa escrituras: el cache cambia bastante seguido al navegar.
    throttle: 500,
    writeFailHandler: (err) =>
      console.warn('[persist] no se pudo guardar el cache de la API:', err?.name),
  },
  pokemonApi.reducer,
);

const rootReducer = combineReducers({
  [pokemonApi.reducerPath]: apiPersist,
  favorites: favoritesPersist,
});

export const store = configureStore({
  reducer: rootReducer,

  // RTK Query necesita su middleware para el cache, el dedupe, el polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // redux-persist despacha acciones no serializables (REHYDRATE, etc.): las excluimos del chequeo.
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(pokemonApi.middleware),
});

export const persistor = persistStore(store);
