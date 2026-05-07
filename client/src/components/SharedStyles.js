import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease;
`;

export const PageHeader = styled.div`
  margin-bottom: 24px;

  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: ${({ theme }) => theme.gradients.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.9rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${({ theme, color }) => theme.colors[color] || theme.colors.borderLight};
  }
`;

export const StatIcon = styled.div`
  font-size: 1.8rem;
  margin-bottom: 12px;
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
  margin-bottom: 6px;
`;

export const StatLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $type, theme }) => {
    switch($type) {
      case 'pending': return `background: rgba(245, 158, 11, 0.1); color: ${theme.colors.accentAmber};`;
      case 'in_transit': return `background: rgba(59, 130, 246, 0.1); color: ${theme.colors.accentBlue};`;
      case 'delivered': return `background: rgba(16, 185, 129, 0.1); color: ${theme.colors.accentGreen};`;
      case 'high': return `background: rgba(239, 68, 68, 0.1); color: ${theme.colors.accentRed};`;
      default: return `background: ${theme.colors.bgSecondary}; color: ${theme.colors.textSecondary}; border: 1px solid ${theme.colors.borderLight};`;
    }
  }}
`;

export const Button = styled.button`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  ${({ $variant, theme }) => {
    if ($variant === 'primary') {
      return `
        background: ${theme.gradients.primary};
        color: white;
        border: none;
        &:hover:not(:disabled) { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); transform: translateY(-1px); }
      `;
    }
    return `
      background: ${theme.colors.bgHover};
      color: ${theme.colors.textPrimary};
      border: 1px solid ${theme.colors.borderLight};
      &:hover:not(:disabled) { background: ${theme.colors.border}; }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ListItem = styled.div`
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
