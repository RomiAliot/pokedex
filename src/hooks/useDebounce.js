import { useEffect, useState } from 'react';

// Retrasa un valor que cambia rápido (buscador). Cada cambio cancela el timer
// anterior, así que solo sobrevive el último valor.
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
