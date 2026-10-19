import { useEffect, useState } from 'react';
import {
  useLazyGetTypeDetailQuery,
  useLazyGetGenerationDetailQuery,
} from '../../services/pokemonApi';

// Traduce los filtros elegidos (tipos/generaciones) a Sets de nombres, que es
// lo que consume applyFilters. isReady avisa si los Sets corresponden a la selección.
function useFacetSets(types, generations) {
  const typesKey = [...types].sort().join(',');
  const gensKey = [...generations].sort().join(',');
  const selectionKey = `${typesKey}|${gensKey}`;

  const [result, setResult] = useState({ key: '', typeSet: null, generationSet: null });

  const [fetchType] = useLazyGetTypeDetailQuery();
  const [fetchGeneration] = useLazyGetGenerationDetailQuery();

  // Sin facetas elegidas no hay nada que pedir (lo resolvemos en el render).
  const isEmpty = typesKey === '' && gensKey === '';

  useEffect(() => {
    // Reconstruimos los arrays desde los keys (strings estables) para no depender
    // de la identidad de los arrays en las deps.
    const typeNames = typesKey ? typesKey.split(',') : [];
    const genIds = gensKey ? gensKey.split(',') : [];

    if (typeNames.length === 0 && genIds.length === 0) return;

    let cancelled = false;

    Promise.all([
      Promise.all(typeNames.map((t) => fetchType(t).unwrap())),
      Promise.all(genIds.map((g) => fetchGeneration(g).unwrap())),
    ])
      .then(([typeData, genData]) => {
        if (cancelled) return;
        const typeSet =
          typeNames.length > 0
            ? new Set(typeData.flatMap((d) => (d?.pokemon ?? []).map((p) => p.pokemon.name)))
            : null;
        const generationSet =
          genIds.length > 0
            ? new Set(genData.flatMap((d) => (d?.pokemon_species ?? []).map((s) => s.name)))
            : null;
        setResult({ key: selectionKey, typeSet, generationSet });
      })
      .catch(() => {
        // Si falla una faceta dejamos el set vacío (0 resultados) en vez de romper.
        if (!cancelled) {
          setResult({
            key: selectionKey,
            typeSet: typeNames.length > 0 ? new Set() : null,
            generationSet: genIds.length > 0 ? new Set() : null,
          });
        }
      });

    return () => {
      cancelled = true; // evita setState tras desmontar o cambiar los filtros
    };
  }, [selectionKey, typesKey, gensKey, fetchType, fetchGeneration]);

  return {
    typeSet: isEmpty ? null : result.typeSet,
    generationSet: isEmpty ? null : result.generationSet,
    isReady: isEmpty || result.key === selectionKey,
  };
}

export default useFacetSets;
