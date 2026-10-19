import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useGetTypesQuery, useGetGenerationsQuery } from '../../services/pokemonApi';
import useDebounce from '../../hooks/useDebounce';
import { getTypeLabel } from '../../utils/pokemon';

// Tipos que la API lista pero no son jugables.
const IGNORED_TYPES = new Set(['unknown', 'shadow']);

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const SelectsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 0.9rem;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const TagsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 5px 6px 5px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
`;

const TagRemove = styled.button`
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  line-height: 1;
  cursor: pointer;
  font-size: 0.7rem;
`;

// Botón "Limpiar": fila propia, estilo suave.
const ClearButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.primarySoft};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.primaryDark};
  font-weight: 700;
  font-size: 0.8rem;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #dce8fd;
  }
`;

// Saca el id de la URL de la generación (".../1/" => "1").
function generationId(gen) {
  const parts = gen.url.replace(/\/$/, '').split('/');
  return parts[parts.length - 1];
}

// Componente presentacional: recibe el estado y los callbacks. Usa un mismo
// layout (dropdowns + tags) en todas las pantallas.
function SearchFilters({ filters, onSearch, onToggleType, onToggleGeneration, onClear }) {
  const { data: typesData } = useGetTypesQuery();
  const { data: gensData } = useGetGenerationsQuery();

  // El input guarda su propio estado local para tipear fluido; recién después
  // de un debounce se refleja en la URL.
  const [text, setText] = useState(filters.q);
  const debouncedText = useDebounce(text, 300);

  const lastEmitted = useRef(filters.q);

  useEffect(() => {
    if (debouncedText === lastEmitted.current) return;
    lastEmitted.current = debouncedText;
    onSearch(debouncedText);
  }, [debouncedText, onSearch]);

  // Si la URL cambia por fuera (ej. "Limpiar"), sincronizamos el input.
  useEffect(() => {
    if (filters.q !== lastEmitted.current) {
      lastEmitted.current = filters.q;
      setText(filters.q);
    }
  }, [filters.q]);

  const types = (typesData?.results ?? []).filter((t) => !IGNORED_TYPES.has(t.name));
  const generations = gensData?.results ?? [];
  const hasFilters =
    filters.q.trim() !== '' || filters.types.length > 0 || filters.generations.length > 0;
  const hasTags = filters.types.length > 0 || filters.generations.length > 0;

  // Los dropdowns solo muestran lo que todavía no está elegido (elegir = agregar).
  const availableTypes = types.filter((t) => !filters.types.includes(t.name));
  const availableGens = generations.filter((g) => !filters.generations.includes(generationId(g)));

  return (
    <Wrapper>
      <SearchInput
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Buscar por nombre o número (ej. pikachu, 25)"
        aria-label="Buscar Pokémon"
      />

      <SelectsRow>
        <Select
          value=""
          aria-label="Agregar filtro por tipo"
          onChange={(e) => e.target.value && onToggleType(e.target.value)}
        >
          <option value="">+ Tipo</option>
          {availableTypes.map((t) => (
            <option key={t.name} value={t.name}>
              {getTypeLabel(t.name)}
            </option>
          ))}
        </Select>

        <Select
          value=""
          aria-label="Agregar filtro por generación"
          onChange={(e) => e.target.value && onToggleGeneration(e.target.value)}
        >
          <option value="">+ Generación</option>
          {availableGens.map((g) => {
            const id = generationId(g);
            return (
              <option key={id} value={id}>
                Gen {id}
              </option>
            );
          })}
        </Select>
      </SelectsRow>

      {hasTags && (
        <TagsRow>
          {filters.types.map((type) => (
            <Tag key={`t-${type}`}>
              {getTypeLabel(type)}
              <TagRemove
                type="button"
                aria-label={`Quitar filtro ${getTypeLabel(type)}`}
                onClick={() => onToggleType(type)}
              >
                ✕
              </TagRemove>
            </Tag>
          ))}
          {filters.generations.map((gen) => (
            <Tag key={`g-${gen}`}>
              Gen {gen}
              <TagRemove
                type="button"
                aria-label={`Quitar filtro generación ${gen}`}
                onClick={() => onToggleGeneration(gen)}
              >
                ✕
              </TagRemove>
            </Tag>
          ))}
        </TagsRow>
      )}

      {hasFilters && (
        <ClearButton type="button" onClick={onClear}>
          Limpiar todo
        </ClearButton>
      )}
    </Wrapper>
  );
}

export default SearchFilters;
