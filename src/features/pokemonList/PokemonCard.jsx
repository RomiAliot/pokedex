import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useGetPokemonDetailQuery } from '../../services/pokemonApi';
import Skeleton from '../../components/ui/Skeleton';
import ProgressiveImage from '../../components/ui/ProgressiveImage';
import FavoriteButton from '../favorites/FavoriteButton';
import { getArtworkUrl, getTypeLabel } from '../../utils/pokemon';

// Es un <div> y no un <Link> para poder poner el botón de favorito como hermano
// del link (un <button> dentro de un <a> es HTML inválido). 
const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

// Botón flotante arriba a la derecha, por encima del link.
const FavButton = styled(FavoriteButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  z-index: 2;
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// Nombre + número. Con flex-wrap, si el nombre es muy largo el número baja a otra fila.
const NameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const Name = styled.h3`
  font-size: 1rem;
  text-transform: capitalize; /* la API devuelve "pikachu" */
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
`;

// Número como pill. `flex: none` para que nunca se achique ni se corte.
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

const Badges = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

// Badge con el color oficial del tipo (fallback al azul de la app).
const TypeBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $type, theme }) => theme.colors.type[$type] ?? theme.colors.primary};
`;

    // Cada card pide su detalle: RTK Query cachea por id y deduplica, así que
    // volver del detalle se sirve instantáneo desde cache.
function PokemonCard({ name }) {
  const { data: pokemon, isLoading, isError, refetch } =
    useGetPokemonDetailQuery(name);

  // Artwork en alta resolución: el sprite 96x96 se ve pixelado al agrandarlo.
  const artwork = getArtworkUrl(pokemon?.sprites);

  return (
    <Card>
      {/* El skeleton tiene las mismas dimensiones que el contenido final. */}
      {isLoading && (
        <>
          <Skeleton height="140px" />
          <Body>
            <Skeleton width="60%" height="18px" />
            <Skeleton width="40%" height="14px" />
          </Body>
        </>
      )}

      {isError && (
        <Body>
          <p style={{ fontSize: '0.85rem' }}>No se pudo cargar</p>
          <button type="button" onClick={() => refetch()}>
            Reintentar
          </button>
        </Body>
      )}

      {pokemon && (
        <>
          <CardLink to={`/pokemon/${name}`} aria-label={`Ver detalle de ${name}`}>
            <ProgressiveImage src={artwork} alt={pokemon.name} />
            <Body>
              <NameRow>
                <Name>{pokemon.name}</Name>
                <Number>#{String(pokemon.id).padStart(3, '0')}</Number>
              </NameRow>
              <Badges>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} $type={t.type.name}>
                    {getTypeLabel(t.type.name)}
                  </TypeBadge>
                ))}
              </Badges>
            </Body>
          </CardLink>

          <FavButton
            pokemon={{ id: pokemon.id, name: pokemon.name, sprite: artwork }}
          />
        </>
      )}
    </Card>
  );
}

export default PokemonCard;
