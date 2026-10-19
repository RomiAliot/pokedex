import { useState } from 'react';
import styled from 'styled-components';

// Placeholder mientras descarga y fade al terminar. El contenedor ya tiene el
// alto final, así que la grilla no salta al aparecer (mejora el CLS).
const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $loaded }) => ($loaded ? 'transparent' : '#eef3fa')};
  overflow: hidden;
`;

const Img = styled.img`
  width: 90%;
  height: 90%;
  object-fit: contain;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.25s ease;
`;

function ProgressiveImage({ src, alt, ...imgProps }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Frame $loaded={loaded}>
      <Img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        $loaded={loaded}
        onLoad={() => setLoaded(true)}
        // Si falla igual quitamos el skeleton.
        onError={() => setLoaded(true)}
        {...imgProps}
      />
    </Frame>
  );
}

export default ProgressiveImage;
