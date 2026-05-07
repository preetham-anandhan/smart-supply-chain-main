import styled from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

export const Sidebar = styled.aside`
  width: 250px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    position: absolute;
    z-index: 100;
    height: 100%;
    transform: translateX(-100%);
    &.open {
      transform: translateX(0);
    }
  }
`;

export const SidebarLogo = styled.div`
  padding: 24px 20px;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  flex-direction: column;

  span {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.accentBlue};
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 4px;
    font-weight: 700;
  }
`;

export const SidebarNav = styled.ul`
  list-style: none;
  padding: 20px 12px;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    margin: 0;
  }

  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    border-radius: ${({ theme }) => theme.radii.md};
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
      color: ${({ theme }) => theme.colors.textPrimary};
    }

    &.active {
      background: ${({ theme }) => theme.gradients.primary};
      color: white;
      box-shadow: ${({ theme }) => theme.shadows.sm};
    }

    span {
      flex: 1;
    }
  }
`;

export const SidebarUser = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
`;

export const SidebarUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SidebarUserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.success};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
`;

export const SidebarUserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SidebarUserName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

export const SidebarUserRole = styled.div`
  margin-top: 4px;
`;

export const SidebarLogoutBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s;
  font-size: 1.1rem;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: ${({ theme }) => theme.colors.accentRed};
  }
`;

export const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.accentBlue};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;
