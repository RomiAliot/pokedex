import * as Yup from 'yup';
import { STAT_META } from '../pokemonDetail/detailConfig';

// Esquema declarativo de Yup: se lee como una especificación y Formik lo
// conecta solo con validationSchema.
export const compareSchema = Yup.object({
  left: Yup.string().trim().required('Elegí el primer Pokémon'),
  right: Yup.string()
    .trim()
    .required('Elegí el segundo Pokémon')
    // Yup.ref('left') compara contra el otro campo en tiempo real.
    .notOneOf([Yup.ref('left')], 'Los dos Pokémon tienen que ser distintos'),
});

// Orden clásico de las stats (el mismo del detalle).
export const STAT_ORDER = Object.keys(STAT_META);

// Transforma los dos pokemon en filas para el gráfico:
// [{ stat: 'HP', left: 45, right: 60 }, ...] — una fila por categoría con 2 barras.
export function buildCompareData(left, right) {
  return STAT_ORDER.map((name) => {
    const l = left.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
    const r = right.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
    return { stat: STAT_META[name].label, left: l, right: r };
  });
}

// Suma de stats base: el "poder total" para desempatar.
export function totalStats(pokemon) {
  return pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);
}
