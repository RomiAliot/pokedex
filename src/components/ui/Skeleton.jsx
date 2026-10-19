import styled, { keyframes } from 'styled-components';

// Animación de brillo.
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Box = styled.div`
  display: block;
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '20px'};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(90deg, #e7edf7 25%, #f4f8fd 50%, #e7edf7 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s linear infinite;
`;

// Props $w/$h: con el prefijo $ quedan fuera del DOM (styled-components).
function Skeleton({ width, height }) {
  return <Box $w={width} $h={height} aria-hidden="true" />;
}

export default Skeleton;
