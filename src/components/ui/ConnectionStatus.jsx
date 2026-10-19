import { useEffect, useState } from 'react';
import { useAppSelector } from '../../app/hooks';

// Escucha los eventos de red del navegador. Ojo: navigator.onLine solo dice
// si hay red, no si la API responde.
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}

// Badge con 3 estados: offline (datos cacheados), sincronizando (hay un fetch
// en vuelo) y en línea. El "sincronizando" sale del propio state de RTK Query.
export default function ConnectionStatus() {
  const isOnline = useOnlineStatus();

  const isSyncing = useAppSelector((state) =>
    Object.values(state.pokemonApi.queries).some(
      (q) => q?.status === 'pending'
    )
  );

  let className = 'badge badge--online';
  let text = '● En línea';
  let title = 'Conectado · datos al día';

  if (!isOnline) {
    className = 'badge badge--offline';
    text = '● Offline';
    title = 'Sin conexión · mostrando datos cacheados';
  } else if (isSyncing) {
    className = 'badge badge--syncing';
    text = '● Sincronizando…';
    title = 'Pidiendo datos frescos a la API';
  }

  return (
    <span className={className} title={title} role="status">
      {text}
    </span>
  );
}
