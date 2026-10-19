import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectFavorites } from '../features/favorites/favoritesSlice';
import ConnectionStatus from './ui/ConnectionStatus';
import { getHomeTarget } from '../utils/homeSearch';

// <Outlet/> de React Router renderiza la ruta hija activa: el header y el
// main se mantienen montados, así no parpadean al navegar.
function Layout() {
  const favorites = useAppSelector(selectFavorites);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        {/* Al inicio se vuelve con los últimos filtros vigentes (ver utils/homeSearch) */}
        <Link to={getHomeTarget()} className="logo">
          <img className="logo-icon" src="/favicon.svg" alt="" aria-hidden="true" />
          Pokedex
        </Link>

        {/* Hamburguesa: solo visible en mobile (CSS). Toggle del panel de nav. */}
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
        </button>

        {/* onClick en el nav: cualquier click en un link lo cierra (mobile) */}
        <nav
          id="main-nav"
          className={`nav ${menuOpen ? 'nav--open' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          <Link to={getHomeTarget()}>Inicio</Link>
          <Link to="/team">Mi Equipo ({favorites.length}/6)</Link>
          <Link to="/compare">Comparar</Link>
        </nav>

        {/* Indicador de conexión (offline/online + cache vs fresco) */}
        <ConnectionStatus />
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
