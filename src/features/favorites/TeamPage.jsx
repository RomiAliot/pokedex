import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import EmptyState from '../../components/ui/EmptyState';
import { LinkButton } from '../../components/ui/Button';
import { getHomeTarget } from '../../utils/homeSearch';
import {
  selectFavorites,
  removeFavorite,
  reorderFavorites,
  clearFavorites,
  MAX_TEAM_SIZE,
} from './favoritesSlice';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing(2)};
  }
`;

const Title = styled.h1`
  font-size: 1.6rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
  flex: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex: none;
  }
`;

const Grid = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// Card arrastrable para reordenar (usa el reducer reorderFavorites).
const Card = styled.li`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: grab;
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
`;

// Mismo alto de imagen que en la home (140px).
const SpriteBox = styled.div`
  background: ${({ theme }) => theme.colors.primarySoft};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Sprite = styled.img`
  width: 100%;
  height: 140px;
  object-fit: contain;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const Body = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const Name = styled.span`
  font-weight: 700;
  text-transform: capitalize;
  font-size: 1rem;
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
`;

// flex: none para que nunca se achique ni se corte; si no entra, envuelve.
const Number = styled.span`
  flex: none;
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primarySoft};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 0.8rem;
  line-height: 1;
  cursor: pointer;
  z-index: 2;
`;

const Ghost = styled.button`
  align-self: flex-start;
  background: ${({ theme }) => theme.colors.primarySoft};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.primaryDark};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
  font-weight: 700;
  transition: background 0.15s ease;

  &:hover {
    background: #dce8fd;
  }
`;

function TeamPage() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavorites);

  // Índice del item que se está arrastrando (drag & drop nativo HTML5).
  const [dragIndex, setDragIndex] = useState(null);

  const handleDrop = (toIndex) => {
    if (dragIndex == null || dragIndex === toIndex) return;
    dispatch(reorderFavorites({ fromIndex: dragIndex, toIndex }));
    setDragIndex(null);
  };

  const handleRemove = (p) => {
    dispatch(removeFavorite(p.id));
    toast(`${p.name} salió de tu equipo`, { icon: '👋' });
  };

  const handleClear = () => {
    dispatch(clearFavorites());
    toast('Equipo vaciado', { icon: '🧹' });
  };

  if (favorites.length === 0) {
    return (
      <Section>
        <Title>Mi Equipo</Title>
        <EmptyState
          icon="👥"
          title="Tu equipo está vacío"
          message={`Agregá hasta ${MAX_TEAM_SIZE} Pokémon desde el listado o el detalle.`}
        >
          <LinkButton to={getHomeTarget()}>Ir a buscar Pokémon</LinkButton>
        </EmptyState>
      </Section>
    );
  }

  return (
    <Section>
      <Head>
        <Title>
          Mi Equipo ({favorites.length}/{MAX_TEAM_SIZE})
        </Title>
        <Subtitle>Arrastrá las cartas para reordenar tu equipo.</Subtitle>
        <Ghost type="button" onClick={handleClear}>
          Vaciar equipo
        </Ghost>
      </Head>

      <Grid>
        {favorites.map((p, index) => (
          <Card
            key={p.id}
            $dragging={dragIndex === index}
            // Drag & drop nativo de HTML5, sin librerías.
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
          >
            <RemoveButton
              type="button"
              onClick={() => handleRemove(p)}
              aria-label={`Quitar a ${p.name} del equipo`}
              title="Quitar del equipo"
            >
              ✕
            </RemoveButton>

            <CardLink to={`/pokemon/${p.name}`} draggable={false}>
              <SpriteBox>
                <Sprite src={p.sprite} alt={p.name} draggable={false} />
              </SpriteBox>
              <Body>
                <Name>{p.name}</Name>
                <Number>#{String(p.id).padStart(3, '0')}</Number>
              </Body>
            </CardLink>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}

export default TeamPage;
