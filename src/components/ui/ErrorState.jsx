import styled from 'styled-components';
import Button from './Button';

// Estado de error reutilizable con una acción de salida, para no dejar al
// usuario en un callejón sin salida.
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

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  background: #fdeaea;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  max-width: 42ch;
`;

// role="alert" se anuncia al instante (role="status" espera al hueco libre).
function ErrorState({ icon = '⚠️', title, message, actionLabel, onAction }) {
  return (
    <Wrapper role="alert">
      <Icon aria-hidden="true">{icon}</Icon>
      <Title>{title}</Title>
      {message && <Message>{message}</Message>}
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Wrapper>
  );
}

export default ErrorState;
