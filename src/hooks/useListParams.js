import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PARAM_KEYS, parseListParams, joinList } from '../features/pokemonList/filterParams';
import { rememberHomeSearch } from '../utils/homeSearch';

// Lee y escribe los filtros en la query string. El componente no toca
// useSearchParams directo: todo pasa por acá (una sola puerta de entrada a la URL).
function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Memoizado: parseListParams arma arrays nuevos y si cambiara de identidad
  // en cada render rompería las deps de cualquier efecto que use `filters`.
  const filters = useMemo(() => parseListParams(searchParams), [searchParams]);

  // Este hook vive solo en HomePage, así que el search actual SIEMPRE es el del
  // inicio: lo recordamos para que "Volver", "Inicio" y el logo no lo borren.
  useEffect(() => {
    const search = searchParams.toString();
    rememberHomeSearch(search ? `?${search}` : '');
  }, [searchParams]);

  const setParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const empty =
            value == null || value === '' || (Array.isArray(value) && value.length === 0);
          if (empty) {
            next.delete(key); // sin valor => sacamos el param para dejar la URL limpia
          } else {
            next.set(key, Array.isArray(value) ? joinList(value) : value);
          }
          return next;
        },
        // replace: no apilamos una entrada de historial por cada tecla.
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setSearch = useCallback((q) => setParam(PARAM_KEYS.search, q), [setParam]);

  const toggleType = useCallback(
    (type) => {
      const next = filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type];
      setParam(PARAM_KEYS.types, next);
    },
    [filters.types, setParam]
  );

  const toggleGeneration = useCallback(
    (gen) => {
      const next = filters.generations.includes(String(gen))
        ? filters.generations.filter((g) => g !== String(gen))
        : [...filters.generations, String(gen)];
      setParam(PARAM_KEYS.generations, next);
    },
    [filters.generations, setParam]
  );

  const clearAll = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { filters, setSearch, toggleType, toggleGeneration, clearAll };
}

export default useListParams;
