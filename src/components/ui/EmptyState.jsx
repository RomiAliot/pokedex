import styled from 'styled-components';

// Estado vacío reutilizable (sin resultados, equipo vacío, 404...).
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)};
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

// Círculo suave detrás del ícono.
const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  background: ${({ theme }) => theme.colors.primarySoft};
`;

const Title = styled.h2`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 42ch;
`;

// role="status" para que el cambio lo anuncien los lectores de pantalla.
function EmptyState({ icon, title, message, children }) {
  return (
    <Wrapper role="status">
      {icon && <Icon aria-hidden="true">{icon}</Icon>}
      <Title>{title}</Title>
      {message && <Message>{message}</Message>}
      {children}
    </Wrapper>
  );
}

export default EmptyState;
