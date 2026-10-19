import { createSlice, createSelector } from '@reduxjs/toolkit';

const MAX_TEAM = 6; 

const initialState = {
  // Guardamos solo lo mínimo para renderizar la card (id, nombre y sprite).
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Agrega el pokemon si no está ya y hay lugar. La regla de negocio vive en
    // el reducer (fuente de verdad), no solo en la UI.
    addFavorite: {
      reducer(state, action) {
        const alreadyInTeam = state.items.some((p) => p.id === action.payload.id);
        if (!alreadyInTeam && state.items.length < MAX_TEAM) {
          state.items.push(action.payload);
        }
      },
      // prepare normaliza el payload antes de que llegue al reducer.
      prepare({ id, name, sprite }) {
        return { payload: { id, name, sprite } };
      },
    },

    removeFavorite(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },

    // Vacía el equipo de una, en vez de despachar 6 removeFavorite (6 renders).
    clearFavorites(state) {
      state.items = [];
    },

    // Reordena para el drag & drop (fromIndex/toIndex = posiciones del array).
    reorderFavorites(state, action) {
      const { fromIndex, toIndex } = action.payload;
      const [moved] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, moved);
    },
  },
});

export const { addFavorite, removeFavorite, reorderFavorites, clearFavorites } =
  favoritesSlice.actions;

// Selectores: encapsulan cómo se lee el estado
export const selectFavorites = (state) => state.favorites.items;

// createSelector memoriza: devuelve el mismo array mientras `items` no cambie.
export const selectFavoriteIds = createSelector([selectFavorites], (items) =>
  items.map((p) => p.id)
);

export const selectIsFavorite = (id) => (state) =>
  state.favorites.items.some((p) => p.id === id);
export const selectTeamIsFull = (state) => state.favorites.items.length >= MAX_TEAM;
export const MAX_TEAM_SIZE = MAX_TEAM;

export default favoritesSlice.reducer;
