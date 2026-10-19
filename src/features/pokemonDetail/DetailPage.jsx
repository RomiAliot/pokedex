import { useState } from 'react';
import styled from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetPokemonDetailQuery } from '../../services/pokemonApi';
import Skeleton from '../../components/ui/Skeleton';
import ProgressiveImage from '../../components/ui/ProgressiveImage';
import ErrorState from '../../components/ui/ErrorState';
import StatBar from './StatBar';
import SpriteGallery from './SpriteGallery';
import {
  formatHeight,
  formatWeight,
  getMainArtwork,
  STAT_META,
} from './detailConfig';
import FavoriteButton from '../favorites/FavoriteButton';
import { getTypeLabel } from '../../utils/pokemon';
import { getHomeTarget } from '../../utils/homeSearch';

const Page = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const BackLink = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  align-self: flex-start;
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(3)};
`;

// Empuja el favorito al extremo derecho; en mobile ocupa su propia fila.
const FavWrap = styled.div`
  margin-left: auto;

  @media (max-width: 767px) {
    width: 100%;
    margin-left: 0;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  text-transform: capitalize;
`;

const Number = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.primaryDark};
  background: ${({ theme }) => theme.colors.primarySoft};
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
`;

const TypeBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $type, theme }) => theme.colors.type[$type] ?? theme.colors.primary};
`;

// Mobile-first: 1 columna, 2 en desktop.
const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

// En mobile usamos tabs; en desktop, la grilla.
const MobileOnly = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const DesktopOnly = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

// Tabs (segmented control) solo en mobile.
const Segmented = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

const Segment = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => ($active ? '#fff' : theme.colors.primaryDark)};
  font-weight: 700;
  font-size: 0.8rem;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.pill};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const ArtBox = styled.div`
  background: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StatsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// Título de sección. Lleva margen arriba para separarlo del bloque previo,
// salvo cuando es el primero de la Card (ahí el padding ya alcanza).
const SectionTitle = styled.h2`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing(3)};

  ${({ $first }) => $first && `margin-top: 0;`}
`;

// Descripción breve debajo de un título de sección.
const Hint = styled.p`
  font-size: 0.82rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InfoGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
  margin: 0;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const InfoLabel = styled.dt`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InfoValue = styled.dd`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
`;

const AbilityList = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Ability = styled.li`
  padding: 5px 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.85rem;
  text-transform: capitalize;

  /* La habilidad oculta se destaca. */
  ${({ $hidden, theme }) =>
    $hidden &&
    `
    background: ${theme.colors.primarySoft};
    color: ${theme.colors.primaryDark};
    font-weight: 700;
  `}
`;

function DetailSkeleton() {
  return (
    <Page aria-hidden="true">
      <Skeleton width="140px" height="16px" />
      <Skeleton width="240px" height="36px" />
      <Layout>
        <Card>
          <Skeleton height="260px" />
          <Skeleton width="60%" height="18px" />
        </Card>
        <Card>
          <Skeleton height="180px" />
          <Skeleton height="80px" />
        </Card>
      </Layout>
    </Page>
  );
}

// Piezas compartidas por mobile (tabs) y desktop (grilla).
function StatList({ pokemon }) {
  // Barras en el orden clásico de los juegos.
  return (
    <StatsBox>
      {Object.keys(STAT_META)
        .map((name) => pokemon.stats.find((s) => s.stat.name === name))
        .filter(Boolean)
        .map((stat) => (
          <StatBar key={stat.stat.name} stat={stat} />
        ))}
    </StatsBox>
  );
}

function Abilities({ pokemon }) {
  return (
    <AbilityList>
      {pokemon.abilities.map((a) => (
        <Ability key={a.ability.name} $hidden={a.is_hidden}>
          {a.ability.name}
          {a.is_hidden && ' ★ oculta'}
        </Ability>
      ))}
    </AbilityList>
  );
}

function PhysicalInfo({ pokemon }) {
  return (
    <InfoGrid>
      <InfoItem>
        <InfoLabel>Altura</InfoLabel>
        <InfoValue>{formatHeight(pokemon.height)}</InfoValue>
      </InfoItem>
      <InfoItem>
        <InfoLabel>Peso</InfoLabel>
        <InfoValue>{formatWeight(pokemon.weight)}</InfoValue>
      </InfoItem>
    </InfoGrid>
  );
}

function DetailPage() {
  // La PokeAPI acepta nombre o número: /pokemon/25 == /pokemon/pikachu.
  const { id } = useParams();
  const navigate = useNavigate();

  // Tab activa en mobile ("stats" | "abilities" | "sprites").
  const [tab, setTab] = useState('stats');

  const {
    data: pokemon,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPokemonDetailQuery(id);

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    // Distinguimos un 404 (no existe) de un error de red.
    const notFound = error?.status === 404;
    return notFound ? (
      <ErrorState
        icon="🔎"
        title="Pokémon no encontrado"
        message={`No existe "${id}" en la Pokedex.`}
        actionLabel="Volver al listado"
        onAction={() => navigate(getHomeTarget())}
      />
    ) : (
      <ErrorState
        icon="📡"
        title="Error de conexión"
        message="No se pudo contactar con la PokeAPI."
        actionLabel="Reintentar"
        onAction={refetch}
      />
    );
  }

  if (!pokemon) return null;

  const artwork = getMainArtwork(pokemon.sprites);

  return (
    <Page>
      <BackLink to={getHomeTarget()}>← Volver al listado</BackLink>

      <Header>
        <Title>{pokemon.name}</Title>
        <Number>#{String(pokemon.id).padStart(3, '0')}</Number>
        {pokemon.types.map((t) => (
          <TypeBadge key={t.type.name} $type={t.type.name}>
            {getTypeLabel(t.type.name)}
          </TypeBadge>
        ))}

        <FavWrap>
          <FavoriteButton
            large
            pokemon={{
              id: pokemon.id,
              name: pokemon.name,
              sprite: artwork ?? pokemon.sprites.front_default,
            }}
          />
        </FavWrap>
      </Header>

      {/* ---------- MOBILE: imagen + tabs ---------- */}
      <MobileOnly>
        <Card>
          <ArtBox>
            <ProgressiveImage src={artwork} alt={pokemon.name} />
          </ArtBox>
          <PhysicalInfo pokemon={pokemon} />
        </Card>

        <Segmented role="tablist" aria-label="Secciones del Pokémon">
          <Segment
            type="button"
            role="tab"
            aria-selected={tab === 'stats'}
            $active={tab === 'stats'}
            onClick={() => setTab('stats')}
          >
            Stats
          </Segment>
          <Segment
            type="button"
            role="tab"
            aria-selected={tab === 'abilities'}
            $active={tab === 'abilities'}
            onClick={() => setTab('abilities')}
          >
            Habilidades
          </Segment>
          <Segment
            type="button"
            role="tab"
            aria-selected={tab === 'sprites'}
            $active={tab === 'sprites'}
            onClick={() => setTab('sprites')}
          >
            Sprites
          </Segment>
        </Segmented>

        <Card>
          {tab === 'stats' && (
            <>
              <SectionTitle $first>Estadísticas base</SectionTitle>
              <StatList pokemon={pokemon} />
            </>
          )}
          {tab === 'abilities' && (
            <>
              <SectionTitle $first>Habilidades</SectionTitle>
              <Abilities pokemon={pokemon} />
            </>
          )}
          {tab === 'sprites' && (
            <>
              <SectionTitle $first>Sprites alternativos</SectionTitle>
              <Hint>
                Las distintas vistas del Pokémon: frontal, de espaldas y sus
                versiones <strong>shiny</strong> (color alternativo).
              </Hint>
              <SpriteGallery sprites={pokemon.sprites} />
            </>
          )}
        </Card>
      </MobileOnly>

      {/* ---------- DESKTOP: grilla de 2 columnas ---------- */}
      <DesktopOnly>
        <Layout>
          <Card>
            <ArtBox>
              <ProgressiveImage src={artwork} alt={pokemon.name} />
            </ArtBox>
            <PhysicalInfo pokemon={pokemon} />
            <SectionTitle>Habilidades</SectionTitle>
            <Abilities pokemon={pokemon} />
          </Card>

          <Card>
            <SectionTitle $first>Estadísticas base</SectionTitle>
            <StatList pokemon={pokemon} />
            <SectionTitle>Sprites alternativos</SectionTitle>
            <Hint>
              Las distintas vistas del Pokémon: frontal, de espaldas y sus
              versiones <strong>shiny</strong> (color alternativo).
            </Hint>
            <SpriteGallery sprites={pokemon.sprites} />
          </Card>
        </Layout>
      </DesktopOnly>
    </Page>
  );
}

export default DetailPage;
