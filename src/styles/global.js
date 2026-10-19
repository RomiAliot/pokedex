import { createGlobalStyle } from 'styled-components';

// Estilos globales (reset, layout base, header, badges). Todo lo demás vive
// en cada componente con styled-components.

// Design system: azul como color primario, fondo claro, cards blancas
// redondeadas con sombra suave y acentos monocromáticos.
export const theme = {
  colors: {
    primary: '#5B8DEF',
    primaryDark: '#3F6FD1',
    primarySoft: '#EAF1FE', // fondos de pills / hover / tracks suaves
    background: '#EEF3FA',
    surface: '#FFFFFF',
    text: '#2E3A59',
    textMuted: '#8A9BB4',
    border: '#E7ECF3',
    track: '#E9EEF6', // riel de las barras de stats
    danger: '#E5484D',
    success: '#2E9E6B',
    warning: '#C98A00',
    // Mapa de colores por tipo. Hoy la UI es monocroma; queda por si se quiere volver a color.
    type: {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD',
    },
  },
  // Escala de espaciado: `spacing(n)` devuelve n * 4px.
  spacing: (n) => `${n * 4}px`,
  radii: {
    sm: '10px',
    md: '16px',
    lg: '24px',
    pill: '9999px',
  },
  // Sombras suaves y azuladas.
  shadows: {
    sm: '0 1px 2px rgba(46, 58, 89, 0.06)',
    md: '0 8px 24px rgba(46, 58, 89, 0.10)',
    lg: '0 16px 40px rgba(46, 58, 89, 0.14)',
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-font-smoothing: antialiased;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${({ theme }) => theme.colors.text};
    background: linear-gradient(180deg, #f3f7fd 0%, #e8eef8 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  /* --- Layout base --- */
  .header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 1.3rem;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.primary};
  }

  /* Icono del logo: reusa el mismo archivo que el favicon. */
  .logo-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
    flex: none;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1)};
    margin-left: auto;
  }

  .nav a {
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
    border-radius: ${({ theme }) => theme.radii.pill};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    transition: background 0.15s ease, color 0.15s ease;
  }

  .nav a:hover {
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryDark};
  }

  /* Hamburguesa: solo en mobile. */
  .menu-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.sm};
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text};
  }

  /* --- Responsive: mobile (< 768px) --- */
  @media (max-width: 767px) {
    .menu-toggle {
      display: inline-flex;
      margin-left: auto;
    }

    /* En mobile el nav pasa a ser un panel desplegable debajo del header. */
    .nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      margin-left: 0;
      padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
      background: ${({ theme }) => theme.colors.surface};
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      box-shadow: ${({ theme }) => theme.shadows.md};
      display: none;
    }

    .nav--open {
      display: flex;
    }

    .nav a {
      padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
      border-radius: ${({ theme }) => theme.radii.sm};
    }

    /* El badge de conexión estorba en pantallas chicas. */
    .header .badge {
      display: none;
    }
  }

  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};
  }

  /* Badge de conexión (online / offline / sincronizando). */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    padding: 5px 12px;
    border-radius: ${({ theme }) => theme.radii.pill};
    font-weight: 700;
  }
  .badge--online {
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
  .badge--offline {
    background: #fdeaea;
    color: ${({ theme }) => theme.colors.danger};
  }
  .badge--syncing {
    background: #fff4e0;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

export default GlobalStyle;
