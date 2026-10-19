import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { STAT_META, MAX_STAT } from './detailConfig';

// Layout: ETIQUETA | VALOR | BARRA
const Row = styled.div`
  display: grid;
  grid-template-columns: 74px 34px 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Label = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Track = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.track};
  border-radius: ${({ theme }) => theme.radii.pill};
  overflow: hidden;
`;

// La barra se llena con una transición de width: arranca en 0 y recién en el
// siguiente frame pasa al valor real, así el navegador interpola la animación.
const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primaryDark}
  );
  border-radius: ${({ theme }) => theme.radii.pill};
  transition: width 0.7s ease;
`;

const Value = styled.span`
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryDark};
`;

function StatBar({ stat }) {
  const statName = stat.stat?.name;
  const meta = STAT_META[statName] ?? { label: statName };
  const pct = Math.min((stat.base_stat / MAX_STAT) * 100, 100);

  // mounted arranca en false (width 0) para disparar la animación de llenado.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // En el próximo frame del navegador
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Row>
      <Label>{meta.label}</Label>
      <Value>{stat.base_stat}</Value>
      <Track
        role="progressbar"
        aria-valuenow={stat.base_stat}
        aria-valuemin={0}
        aria-valuemax={MAX_STAT}
        aria-label={meta.label}
      >
        <Fill $pct={mounted ? pct : 0} />
      </Track>
    </Row>
  );
}

export default StatBar;
