import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useGetPokemonListQuery } from '../../services/pokemonApi';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import useListParams from '../../hooks/useListParams';
import useFacetSets from './useFacetSets';
import { applyFilters, hasActiveFilters } from './filterParams';
import SearchFilters from './SearchFilters';
import PokemonCard from './PokemonCard';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const PAGE_SIZE = 24; // múltiplo de 2/3/4 => grilla pareja en cualquier ancho

// Con filtros activos traemos el catálogo completo (la API es liviana) y
// filtramos en el cliente; sin filtros, paginamos de a poco.
const ALL_POKEMON = 100000;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* mobile-first */
  gap: ${({ theme }) => theme.spacing(4)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const Title = styled.h1`
  font-size: 1.6rem;
`;

const Count = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

// Placeholders con la misma forma que la grilla real.
function SkeletonGrid() {
  return (
    <Grid aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(46, 58, 89, 0.06)',
          }}
        >
          <Skeleton height="140px" />
          <div style={{ padding: 12, display: 'grid', gap: 8 }}>
            <Skeleton width="60%" height="18px" />
            <Skeleton width="40%" height="14px" />
          </div>
        </div>
      ))}
    </Grid>
  );
}

function HomePage() {
  // Los filtros viven en la URL (fuente de verdad) y este hook los expone.
  const { filters, setSearch, toggleType, toggleGeneration, clearAll } = useListParams();
  const filtersActive = hasActiveFilters(filters);

  // Cuántos items mostramos: crece de a PAGE_SIZE con el infinite scroll.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const limit = filtersActive ? ALL_POKEMON : visibleCount;

  const { data, isLoading, isFetching, isError, refetch } = useGetPokemonListQuery(
    { offset: 0, limit },
    {
      // Mantiene la data anterior mientras llega la nueva => la lista no parpadea.
      placeholderData: (previousData) => previousData,
    }
  );

  // Sets de nombres para filtrar por tipo/generación (se piden solo si se usan).
  const { typeSet, generationSet, isReady: facetsReady } = useFacetSets(
    filters.types,
    filters.generations
  );

  // Memoizado para no crear un array nuevo en cada render y romper los memo de abajo.
  const base = useMemo(() => data?.results ?? [], [data]);

  const filtered = useMemo(() => {
    if (!filtersActive) return base;
    return applyFilters(base, { q: filters.q, typeSet, generationSet });
  }, [filtersActive, base, filters.q, typeSet, generationSet]);

  // Al cambiar un filtro volvemos a la primera página. Ajustamos el estado
  // durante el render (comparando la firma anterior) en vez de con un useEffect.
  const filterSignature = `${filters.q}|${filters.types.join(',')}|${filters.generations.join(',')}`;
  const [prevSignature, setPrevSignature] = useState(filterSignature);
  if (prevSignature !== filterSignature) {
    setPrevSignature(filterSignature);
    setVisibleCount(PAGE_SIZE);
  }

  // Si todavía no resolvieron los Sets de tipo/gen no podemos filtrar bien.
  const pendingFacets = filtersActive && !facetsReady;
  const showSkeleton = isLoading || pendingFacets;

  // Con filtros recortamos el resultado ya filtrado; sin filtros lo que trajo el fetch.
  const visible = filtersActive ? filtered.slice(0, visibleCount) : base;

  const hasMore = filtersActive
    ? visibleCount < filtered.length
    : base.length < (data?.count ?? 0);

  const loadMore = () => setVisibleCount((c) => c + PAGE_SIZE);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isFetching && !pendingFacets);

  if (isError) {
    return (
      <ErrorState
        icon="📡"
        title="Listado de Pokémon"
        message="No se pudo conectar con la PokeAPI. Revisá tu conexión e intentá de nuevo."
        actionLabel="Reintentar"
        onAction={refetch}
      />
    );
  }

  const noResults = filtersActive && !pendingFacets && filtered.length === 0;

  return (
    <Section>
      <Title>Listado de Pokémons</Title>

      <SearchFilters
        filters={filters}
        onSearch={setSearch}
        onToggleType={toggleType}
        onToggleGeneration={toggleGeneration}
        onClear={clearAll}
      />

      {filtersActive && !showSkeleton && !noResults && (
        <Count role="status">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
        </Count>
      )}

      {/* Estados: loading / vacío / error (arriba) / ok (grilla) */}
      {showSkeleton && <SkeletonGrid />}

      {noResults && (
        <EmptyState
          icon="🔍"
          title="Sin resultados"
          message="Ningún Pokémon coincide con la búsqueda y los filtros elegidos."
        >
          <Button type="button" onClick={clearAll}>
            Limpiar filtros
          </Button>
        </EmptyState>
      )}

      {!showSkeleton && !noResults && (
        <Grid>
          {visible.map((p) => (
            // La URL es única y estable como key (no conviene usar el index).
            <PokemonCard key={p.url} name={p.name} />
          ))}
        </Grid>
      )}

      {/* Centinela: dispara "cargar más" cuando entra al viewport. */}
      <Footer ref={sentinelRef}>
        {isFetching && !isLoading && !pendingFacets && (
          <p role="status">Cargando más Pokémon...</p>
        )}
        {!hasMore && !noResults && visible.length > 0 && (
          <p>¡Llegaste al final!</p>
        )}
      </Footer>
    </Section>
  );
}

export default HomePage;
