import styled from 'styled-components';
import toast from 'react-hot-toast';
import useFavorite from './useFavorite';

// Usa aria-disabled (no disabled) para poder mostrar un toast cuando el equipo
// está lleno y así seguir capturando el click.
const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};

  /* Variante grande, solo en el detalle. */
  ${({ $large }) =>
    $large &&
    `
    gap: 6px;
    font-size: 0.9rem;
    padding: 10px 20px;
  `}
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.primarySoft};
  color: ${({ $active }) => ($active ? '#fff' : '#3F6FD1')};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover:not([aria-disabled='true']) {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.primaryDark : '#DCE8FD'};
  }

  &[aria-disabled='true'] {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

// Recibe solo lo mínimo del pokemon ({ id, name, sprite }).
function FavoriteButton({ pokemon, className, large }) {
  const { isFavorite, isFull, toggle } = useFavorite(pokemon);
  const blocked = !isFavorite && isFull;

  const label = isFavorite
    ? `Quitar a ${pokemon.name} del equipo`
    : blocked
      ? 'Tu equipo está lleno (máximo 6)'
      : `Agregar a ${pokemon.name} al equipo`;

  const handleClick = (e) => {
    // Si el botón vive dentro de una card-link, evitamos que navegue.
    e.preventDefault();
    e.stopPropagation();

    if (blocked) {
      // Avisamos del límite (regla de negocio) sin romper la acción.
      toast.error('Tu equipo está lleno (máximo 6)');
      return;
    }

    toggle();
    if (isFavorite) {
      toast(`${pokemon.name} salió de tu equipo`, { icon: '👋' });
    } else {
      toast.success(`${pokemon.name} se sumó a tu equipo`);
    }
  };

  return (
    <Btn
      type="button"
      className={className}
      $active={isFavorite}
      $large={large}
      aria-disabled={blocked}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
      {isFavorite ? 'En equipo' : 'Agregar'}
    </Btn>
  );
}

export default FavoriteButton;
