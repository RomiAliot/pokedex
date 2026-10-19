import { useEffect, useLayoutEffect, useRef } from 'react';

// Observa un elemento centinela y avisa cuando entra en pantalla. Usamos
// IntersectionObserver en vez de 'scroll' porque no dispara trabajo por frame.
function useInfiniteScroll(callback, enabled = true) {
  const sentinelRef = useRef(null);
  // Guardamos la callback en un ref para no recrear el observer en cada render.
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Si no hay más páginas, no observamos nada.
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callbackRef.current();
      },
      {
        // Margen para disparar antes de llegar al final: la próxima página
        // carga mientras todavía hay contenido en pantalla.
        rootMargin: '300px 0px',
      }
    );

    observer.observe(el);

    // Desconectar al desmontar evita leaks y llamadas duplicadas.
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}

export default useInfiniteScroll;
