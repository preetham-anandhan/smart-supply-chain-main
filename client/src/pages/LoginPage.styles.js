import styled, { keyframes } from 'styled-components';

const float = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 30px) scale(1.02); }
`;

export const LoginPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bgPrimary};
  position: relative;
  overflow: hidden;
`;

export const ParticlesContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`;

export const Particle = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  animation: ${float} 15s infinite ease-in-out;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  background: ${({ $bg, theme }) => theme.colors[$bg] || $bg};
  top: ${({ $top }) => $top || 'auto'};
  left: ${({ $left }) => $left || 'auto'};
  bottom: ${({ $bottom }) => $bottom || 'auto'};
  right: ${({ $right }) => $right || 'auto'};
  animation-delay: ${({ $delay }) => $delay || '0s'};
`;

export const LoginCard = styled.div`
  display: flex;
  width: 960px;
  max-width: 95vw;
  min-height: 600px;
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg}, 0 0 60px rgba(59, 130, 246, 0.08);
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 420px;
  }
`;

export const BrandingPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #1a1d3a 0%, #0d1025 50%, #1a1040 100%);
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  }

  @media (max-width: 900px) {
    padding: 28px 24px;
  }
`;

export const BrandingContent = styled.div`
  position: relative;
  z-index: 1;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colors.textPrimary};

    @media (max-width: 900px) {
      font-size: 1.4rem;
    }
  }

  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    margin-bottom: 32px;
  }
`;

export const BrandingLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 24px;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 1.1rem;
  }
`;

export const FormPanel = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bgSecondary};

  @media (max-width: 900px) {
    padding: 24px;
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  max-width: 360px;
`;

export const FormHeader = styled.div`
  margin-bottom: 28px;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.85rem;
  }
`;

export const DemoLogins = styled.div`
  margin-bottom: 24px;

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${({ theme }) => theme.colors.textMuted};
    margin-bottom: 10px;
    font-weight: 600;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

export const DemoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &.active {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    color: ${({ theme }) => theme.colors.accentBlue};
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  input {
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid ${({ theme }) => theme.colors.borderLight};
    border-radius: ${({ theme }) => theme.radii.md};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 0.95rem;
    transition: all 0.2s;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accentBlue};
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
  }
`;

export const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const RoleOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;

  .icon { font-size: 1.2rem; margin-bottom: 4px; }
  .name { font-weight: 600; font-size: 0.85rem; color: ${({ theme }) => theme.colors.textPrimary}; margin-bottom: 2px; }
  .desc { font-size: 0.7rem; color: ${({ theme }) => theme.colors.textMuted}; line-height: 1.3; }

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    border-color: ${({ theme }) => theme.colors.textMuted};
  }

  &.active {
    background: rgba(59, 130, 246, 0.08);
    border-color: ${({ theme }) => theme.colors.accentBlue};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accentBlue};
  }
`;

export const ErrorMsg = styled.div`
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.accentRed};
  font-size: 0.8rem;
  animation: fadeIn 0.3s ease;
`;

export const SubmitButton = styled.button`
  padding: 12px 20px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const FormSwitch = styled.div`
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};

  button {
    background: none;
    color: ${({ theme }) => theme.colors.accentBlue};
    font-weight: 600;
    font-size: 0.8rem;
    text-decoration: underline;
    padding: 0;

    &:hover { color: ${({ theme }) => theme.colors.accentPurple}; }
  }
`;

export const DemoCredentials = styled.div`
  text-align: center;
  margin-top: 16px;
  padding: 10px;
  background: rgba(59, 130, 246, 0.06);
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(59, 130, 246, 0.1);

  p { font-size: 0.72rem; color: ${({ theme }) => theme.colors.textMuted}; }
  code { background: ${({ theme }) => theme.colors.bgCard}; padding: 2px 6px; border-radius: 4px; color: ${({ theme }) => theme.colors.accentBlue}; font-weight: bold; margin-left: 4px; }
`;
