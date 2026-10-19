// Lógica pura de los filtros (sin React). Viven en la URL para que el link sea
// compartible y sobreviva al refresh

export const PARAM_KEYS = {
  search: 'q',
  types: 'type',
  generations: 'gen',
};

// "fire,water" => ['fire','water']. Param ausente o vacío significan lo mismo.
function splitList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseListParams(searchParams) {
  return {
    q: searchParams.get(PARAM_KEYS.search) ?? '',
    types: splitList(searchParams.get(PARAM_KEYS.types)),
    generations: splitList(searchParams.get(PARAM_KEYS.generations)),
  };
}

// ¿Hay algo filtrado? Define si mostramos el catálogo completo o paginado.
export function hasActiveFilters({ q, types, generations }) {
  return q.trim() !== '' || types.length > 0 || generations.length > 0;
}

// Serializa los chips a la URL en orden estable (links estables).
export function joinList(list) {
  return [...list].sort().join(',');
}

// Filtra la lista ya cargada. Combina facetas con AND (tipo Y generación Y
// búsqueda) y dentro de cada faceta con OR (fire O water).
export function applyFilters(list, { q, typeSet, generationSet }) {
  const term = q.trim().toLowerCase();

  return list.filter((p) => {
    if (term) {
      // Buscamos por nombre y por número, así "25" encuentra a pikachu.
      const id = String(extractId(p.url) ?? '');
      const matchesName = p.name.includes(term);
      const matchesId = id.includes(term);
      if (!matchesName && !matchesId) return false;
    }
    if (typeSet && !typeSet.has(p.name)) return false;
    if (generationSet && !generationSet.has(p.name)) return false;
    return true;
  });
}

// Copia local para no acoplar este módulo puro a utils.
function extractId(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, '').split('/');
  return Number(parts[parts.length - 1]);
}
