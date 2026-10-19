// Config y helpers del detalle. Vive separado del componente para que el JSX
// quede limpio y estos datos se puedan reusar/testear.

// Etiqueta en español de cada stat. Centralizado por si cambia una etiqueta.
export const STAT_META = {
  hp: { label: 'HP'},
  attack: { label: 'Ataque' },
  defense: { label: 'Defensa' },
  'special-attack': { label: 'At. Esp.'},
  'special-defense': { label: 'Def. Esp.' },
  speed: { label: 'Velocidad' },
};

// El tope de una stat en los juegos: normalizamos contra eso 
export const MAX_STAT = 255;

// PokeAPI: height viene en decímetros (10 dm = 1 m)
// y weight en hectogramos (10 hg = 1 kg).
export function formatHeight(dm) {
  if (dm == null) return '—';
  return `${(dm / 10).toFixed(1)} m`;
}

export function formatWeight(hg) {
  if (hg == null) return '—';
  return `${(hg / 10).toFixed(1)} kg`;
}

// Sprites alternativos para la galería. La estructura varía entre especies
// (algunas no tienen back_shiny), así que filtramos los nulos.
export function getSpriteGallery(sprites = {}) {
  const list = [
    { key: 'front_default', src: sprites.front_default, label: 'Normal' },
    { key: 'back_default', src: sprites.back_default, label: 'Espalda' },
    { key: 'front_shiny', src: sprites.front_shiny, label: 'Shiny' },
    { key: 'back_shiny', src: sprites.back_shiny, label: 'Shiny espalda' },
  ];
  return list.filter((s) => s.src);
}

// Artwork oficial (imagen grande del detalle).
export function getMainArtwork(sprites = {}) {
  return (
    sprites.other?.['official-artwork']?.front_default ??
    sprites.other?.home?.front_default ??
    sprites.front_default ??
    null
  );
}
