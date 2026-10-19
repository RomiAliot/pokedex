import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import PageFallback from './components/ui/PageFallback';

// Code-splitting por ruta: cada página se baja en su propio chunk,
// así el bundle inicial queda chico.
const HomePage = lazy(() => import('./features/pokemonList/HomePage'));
const DetailPage = lazy(() => import('./features/pokemonDetail/DetailPage'));
const ComparePage = lazy(() => import('./features/compare/ComparePage'));
const TeamPage = lazy(() => import('./features/favorites/TeamPage'));
const NotFoundPage = lazy(() => import('./features/notFound/NotFoundPage'));

function App() {
  return (
    // Fallback mientras carga el chunk de la ruta.
    <Suspense fallback={<PageFallback />}>
      {/* Reset del scroll al cambiar de ruta (SPA). */}
      <ScrollToTop />
      <Routes>
        {/* El Layout aporta header/footer a todas las páginas. */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="pokemon/:id" element={<DetailPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="team" element={<TeamPage />} />
          {/* catch-all para rutas inexistentes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
