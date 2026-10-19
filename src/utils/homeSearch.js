const KEY = 'pokedex:homeSearch';

// Guarda el último estado de filtros del inicio (query string) para que los
// links de vuelta (Volver al listado, Inicio, logo) no los borren al salir
// de otra pantalla. Vive en sessionStorage: cada pestaña arranca limpia.
export function rememberHomeSearch(search) {
  try {
    sessionStorage.setItem(KEY, search);
  } catch {
    /* storage no disponible (modo privado u otros) */
  }
}

export function getHomeTarget() {
  try {
    return { pathname: '/', search: sessionStorage.getItem(KEY) ?? '' };
  } catch {
    return { pathname: '/', search: '' };
  }
}
