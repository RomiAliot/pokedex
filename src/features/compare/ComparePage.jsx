import { useState } from 'react';
import styled from 'styled-components';
import { Formik, Form } from 'formik';
import {
  useGetPokemonListQuery,
  useGetPokemonDetailQuery,
} from '../../services/pokemonApi';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import CompareChart from './CompareChart';
import {
  compareSchema,
  buildCompareData,
  totalStats,
  STAT_ORDER,
} from './compareConfig';
import { STAT_META } from '../pokemonDetail/detailConfig';
import { getArtworkUrl } from '../../utils/pokemon';

const Page = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const Title = styled.h1`
  font-size: 1.6rem;
`;

const Lead = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
`;

// min-width: 0 para que la card no crezca más allá de su columna.
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing(4)};
  min-width: 0;
`;

const FormGrid = styled(Form)`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: start;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border: 1px solid
    ${({ $invalid, theme }) => ($invalid ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  height: 46px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8rem;
`;

const SubmitButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  align-self: end;
  height: 46px;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: start;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: ${({ theme }) => theme.spacing(2)};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    /* Los nombres largos deben poder partirse; si no, la tabla impone un ancho
       mínimo y rompe el layout en mobile. */
    overflow-wrap: anywhere;
  }

  th {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Winner = styled.td`
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
`;

const Swap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  span {
    min-width: 0;
  }

  img {
    width: 88px;
    height: 88px;
    object-fit: contain;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    img {
      width: 120px;
      height: 120px;
    }
  }
`;

const Name = styled.span`
  font-weight: 800;
  text-transform: capitalize;
  overflow-wrap: anywhere;
`;

function ResultSkeleton() {
  return (
    <Card aria-hidden="true">
      <Skeleton height="360px" />
    </Card>
  );
}

// Artwork hi-res para las cabeceras del resultado.
const spriteOf = (p) => getArtworkUrl(p.sprites) ?? null;

function ComparePage() {
  // `pair` = los dos pokemon ya enviados. null = todavía no comparamos.
  const [pair, setPair] = useState(null);

  // Catálogo completo para el datalist. Comparte cache con el listado del Home.
  const { data: catalog } = useGetPokemonListQuery({ offset: 0, limit: 100000 });
  const names = catalog?.results ?? [];

  const leftQ = useGetPokemonDetailQuery(pair?.left ?? '', { skip: !pair });
  const rightQ = useGetPokemonDetailQuery(pair?.right ?? '', { skip: !pair });

  const ready = leftQ.data && rightQ.data;
  const isLoading = pair && (leftQ.isLoading || rightQ.isLoading);
  const isError = pair && (leftQ.isError || rightQ.isError);

  const left = leftQ.data;
  const right = rightQ.data;

  const chartData = ready ? buildCompareData(left, right) : [];
  const leftSprite = ready ? spriteOf(left) : null;
  const rightSprite = ready ? spriteOf(right) : null;

  return (
    <Page>
      <Title>Comparar Pokémon</Title>
      <Lead>
        Elegí dos Pokémon distintos y compará sus estadísticas base.
      </Lead>

      <Card>
        <Formik
          initialValues={{ left: '', right: '' }}
          validationSchema={compareSchema}
          onSubmit={(values) =>
            setPair({
              left: values.left.trim().toLowerCase(),
              right: values.right.trim().toLowerCase(),
            })
          }
        >
          {({ getFieldProps, errors, touched }) => (
            <FormGrid>
              <FieldWrap>
                <Label htmlFor="left">Pokémon A</Label>
                {/* list => datalist: input con autocompletado. */}
                <Input
                  id="left"
                  list="pokemon-names"
                  placeholder="ej. pikachu"
                  autoComplete="off"
                  $invalid={touched.left && errors.left}
                  {...getFieldProps('left')}
                />
                {touched.left && errors.left && <ErrorText>{errors.left}</ErrorText>}
              </FieldWrap>

              <FieldWrap>
                <Label htmlFor="right">Pokémon B</Label>
                <Input
                  id="right"
                  list="pokemon-names"
                  placeholder="ej. charizard"
                  autoComplete="off"
                  $invalid={touched.right && errors.right}
                  {...getFieldProps('right')}
                />
                {touched.right && errors.right && <ErrorText>{errors.right}</ErrorText>}
              </FieldWrap>

              <SubmitButton type="submit">Comparar</SubmitButton>

              {/* Datalist compartido por los dos inputs. */}
              <datalist id="pokemon-names">
                {names.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </FormGrid>
          )}
        </Formik>
      </Card>

      {!pair && (
        <EmptyState
          icon="📊"
          title="Todavía no comparaste nada"
          message='Completá los dos campos y presioná "Comparar".'
        />
      )}

      {isLoading && <ResultSkeleton />}

      {isError && (
        <ErrorState
          icon="🔎"
          title="No se encontró alguno de los Pokémon"
          message="Revisá los nombres o reintentá la búsqueda."
          actionLabel="Reintentar"
          onAction={() => {
            // Reintenta ambas queries (pudo fallar cualquiera).
            leftQ.refetch();
            rightQ.refetch();
          }}
        />
      )}

      {ready && (
        <ResultGrid>
          <Card>
            <Swap>
              <span>
                <Name>{left.name}</Name>
                {leftSprite && <img src={leftSprite} alt={left.name} />}
              </span>
              <strong>VS</strong>
              <span>
                <Name>{right.name}</Name>
                {rightSprite && <img src={rightSprite} alt={right.name} />}
              </span>
            </Swap>

            <CompareChart
              data={chartData}
              leftName={left.name}
              rightName={right.name}
            />
          </Card>

          <Card>
            <Table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>{left.name}</th>
                  <th>{right.name}</th>
                </tr>
              </thead>
              <tbody>
                {STAT_ORDER.map((name) => {
                  const l = left.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
                  const r = right.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
                  return (
                    <tr key={name}>
                      <td>{STAT_META[name].label}</td>
                      {/* Resaltamos la stat más alta de cada fila. */}
                      {l > r ? <Winner>{l}</Winner> : <td>{l}</td>}
                      {r > l ? <Winner>{r}</Winner> : <td>{r}</td>}
                    </tr>
                  );
                })}
                <tr>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{totalStats(left)}</strong>
                  </td>
                  <td>
                    <strong>{totalStats(right)}</strong>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </ResultGrid>
      )}
    </Page>
  );
}

export default ComparePage;
