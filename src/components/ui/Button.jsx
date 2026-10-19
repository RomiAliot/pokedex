import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

// Base con el look del botón primario. 
const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-weight: 700;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Botón de acción. LinkButton es igual pero navega (para CTAs).
const Button = styled.button`
  ${base}
`;

export const LinkButton = styled(Link)`
  ${base}
`;

export default Button;
