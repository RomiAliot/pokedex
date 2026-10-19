// Helpers de Pokemon: funciones puras, sin React (fáciles de testear y reusar).

// El listado solo trae la URL del pokemon, no el id; lo sacamos del último segmento.
export function extractIdFromUrl(url) {
  if (!url) return null;
  const parts = url.replace(/\/$/, '').split('/');
  return Number(parts[parts.length - 1]);
}

// URL del sprite en el CDN oficial (se arma con el id, sin pegarle a la API).
export function getSpriteUrl(id, variant = 'default') {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  if (variant === 'artwork') return `${base}/other/official-artwork/${id}.png`;
  if (variant === 'shiny') return `${base}/shiny/${id}.png`;
  return `${base}/${id}.png`;
}

// Buscamos el artwork en alta resolución: los sprites front_default son 96x96
// y al agrandarlos se ven pixelados.
export function getArtworkUrl(sprites = {}) {
  return (
    sprites.other?.['official-artwork']?.front_default ??
    sprites.other?.home?.front_default ??
    sprites.front_default ??
    null
  );
}

// Nombres de tipo de la API => etiqueta en español.
export const TYPE_LABELS = {
  normal: 'Normal', 
  fire: 'Fuego', 
  water: 'Agua', 
  electric: 'Eléctrico',
  grass: 'Planta', 
  ice: 'Hielo', 
  fighting: 'Lucha', 
  poison: 'Veneno',
  ground: 'Tierra', 
  flying: 'Volador', 
  psychic: 'Psíquico', 
  bug: 'Bicho',
  rock: 'Roca', 
  ghost: 'Fantasma', 
  dragon: 'Dragón', 
  dark: 'Siniestro',
  steel: 'Acero', 
  fairy: 'Hada',
};

// El color lo define el theme; acá solo traducimos el nombre del tipo.
export function getTypeLabel(typeName) {
  return TYPE_LABELS[typeName] ?? typeName;
}
