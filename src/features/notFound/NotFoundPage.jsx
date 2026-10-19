import EmptyState from '../../components/ui/EmptyState';
import { LinkButton } from '../../components/ui/Button';
import { getHomeTarget } from '../../utils/homeSearch';

// 404: reutiliza EmptyState para mantener el mismo look que los demás estados.
function NotFoundPage() {
  return (
    <EmptyState
      icon="🧭"
      title="404 - Página no encontrada"
      message="La ruta que buscás no existe en la Pokedex. Puede que el link esté roto o mal escrito."
    >
      <LinkButton to={getHomeTarget()}>Volver al listado</LinkButton>
    </EmptyState>
  );
}

export default NotFoundPage;
