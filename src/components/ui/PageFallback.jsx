import styled, { keyframes } from 'styled-components';

// Fallback de <Suspense>: spinner mientras se descarga el chunk de una ruta.
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(10)} 0;
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

function PageFallback() {
  return (
    <Wrap role="status" aria-label="Cargando">
      <Spinner />
    </Wrap>
  );
}

export default PageFallback;
