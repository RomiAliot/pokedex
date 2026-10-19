import styled from 'styled-components';
import { useState } from 'react';
import Skeleton from '../../components/ui/Skeleton';
import { getSpriteGallery } from './detailConfig';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* mobile 2x2 */
  gap: ${({ theme }) => theme.spacing(2)};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Cell = styled.figure`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

// La imagen siempre tiene caja (nunca display:none)
const Box = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SkeletonLayer = styled.div`
  position: absolute;
  inset: 0;
`;

const CellImg = styled.img`
  width: 95%;
  height: 95%;
  object-fit: contain;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const Missing = styled.span`
  width: 95%;
  height: 95%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
`;

const Caption = styled.figcaption`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

// 3 estados por sprite: cargando, cargado y error. 
function SpriteItem({ src, label }) {
  const [status, setStatus] = useState('loading');

  if (status === 'error') {
    return (
      <Cell>
        <Missing>N/D</Missing>
        <Caption>{label}</Caption>
      </Cell>
    );
  }

  return (
    <Cell>
      <Box>
        {status === 'loading' && (
          <SkeletonLayer>
            <Skeleton width="95%" height="100%" />
          </SkeletonLayer>
        )}
        <CellImg
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          $loaded={status === 'loaded'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      </Box>
      <Caption>{label}</Caption>
    </Cell>
  );
}

// Galería de variantes (normal, espalda, shiny...). getSpriteGallery descarta
// los que vienen null; los que fallan en red los maneja SpriteItem.
function SpriteGallery({ sprites }) {
  const gallery = getSpriteGallery(sprites);
  if (gallery.length === 0) return null;

  return (
    <Grid>
      {gallery.map((s) => (
        <SpriteItem key={s.key} src={s.src} label={s.label} />
      ))}
    </Grid>
  );
}

export default SpriteGallery;
