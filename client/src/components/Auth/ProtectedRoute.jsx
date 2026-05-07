import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import styled from 'styled-components';
import { Badge } from '../SharedStyles';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.accentBlue};
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const ForbiddenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  text-align: center;
`;

const ForbiddenIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 8px;
`;

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Verifying access...</p>
      </LoadingContainer>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <ForbiddenContainer>
        <ForbiddenIcon>🔒</ForbiddenIcon>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <p>Your role: <Badge $type={user.role}>{user.role}</Badge></p>
        {/* We use a timeout to show the message before redirecting, or just redirect immediately.
            For better UX, we could provide a button to go back. But for now, returning Navigate works. */}
        <Navigate to={getRoleDefaultRoute(user.role)} replace />
      </ForbiddenContainer>
    );
  }

  return children;
}

export function getRoleDefaultRoute(role) {
  switch (role) {
    case 'admin': return '/';
    case 'driver': return '/driver';
    case 'customer': return '/customer';
    case 'warehouse_manager': return '/';
    default: return '/';
  }
}
