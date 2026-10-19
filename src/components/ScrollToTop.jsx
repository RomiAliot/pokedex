import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de ruta sube el scroll al top: React Router no lo hace solo y sin
// esto queda pegado el scroll de la página anterior.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
