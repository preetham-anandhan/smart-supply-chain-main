import styled from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  padding: 6px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const TabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: ${({ theme }) => theme.radii.md};
  flex: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    background: ${({ theme }) => theme.colors.bgCard};
    color: ${({ theme }) => theme.colors.accentBlue};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  .icon {
    font-size: 1.1rem;
  }
`;

export const CustomerInput = styled.input`
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentBlue};
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const FiltersContainer = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 900px) {
    flex-wrap: wrap;
  }
`;

export const FilterBtn = styled.button`
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  &:hover {
    background: ${({ theme }) => theme.colors.bgHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &.active {
    background: ${({ theme }) => theme.colors.accentBlue};
    color: white;
    border-color: ${({ theme }) => theme.colors.accentBlue};
  }
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 14px 20px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  th {
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(255, 255, 255, 0.02);
  }

  td {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  tbody tr {
    transition: background 0.2s;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
`;

export const AlertBox = styled.div`
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;

  &.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: ${({ theme }) => theme.colors.accentGreen};
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: ${({ theme }) => theme.colors.accentRed};
  }
`;

export const FormSection = styled.div`
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

export const FormSectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
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
  
  select {
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

export const SizeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const SizeBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentCyan};
    background: ${({ theme }) => theme.colors.bgHover};
  }

  &.active {
    border-color: ${({ theme }) => theme.colors.accentCyan};
    background: rgba(6, 182, 212, 0.1);
    color: ${({ theme }) => theme.colors.accentCyan};
  }

  span {
    font-size: 0.6rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const PriorityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const PriorityBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.25s;
  position: relative;

  &:hover {
    border-color: ${({ color }) => color};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &.active {
    border-color: ${({ color }) => color};
    background: rgba(255, 255, 255, 0.03);
    color: ${({ theme }) => theme.colors.textPrimary};

    &::after {
      content: '✓';
      position: absolute;
      top: 6px;
      right: 8px;
      font-size: 0.7rem;
      color: ${({ color }) => color};
      font-weight: 700;
    }
  }

  .icon { font-size: 1.5rem; }
  .label { font-size: 0.8rem; font-weight: 700; }
  .sla { font-size: 0.65rem; color: ${({ theme }) => theme.colors.textMuted}; }
  .price { font-size: 0.75rem; font-weight: 600; color: ${({ color }) => color}; }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-bottom: 24px;

  @media (max-width: 900px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h2 { font-size: 1.4rem; font-weight: 700; }
  p { color: ${({ theme }) => theme.colors.textMuted}; font-size: 0.9rem; }
`;

export const SessionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 12px;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;
