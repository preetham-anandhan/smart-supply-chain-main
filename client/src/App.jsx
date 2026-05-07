import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';
import { AuthProvider, useAuth } from './store/AuthContext';
import ProtectedRoute, { getRoleDefaultRoute } from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CustomerPage from './pages/CustomerPage';
import DriverPage from './pages/DriverPage';
import ManagerPage from './pages/ManagerPage';
import { Badge } from './components/SharedStyles';
import { 
  AppContainer, Sidebar, SidebarLogo, SidebarNav, 
  SidebarUser, SidebarUserInfo, SidebarUserAvatar, 
  SidebarUserDetails, SidebarUserName, SidebarUserRole, 
  SidebarLogoutBtn, MainContent, LoadingContainer, Spinner 
} from './App.styles';

/**
 * Sidebar navigation items per role.
 */
const NAV_ITEMS = {
  admin: [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/manager', icon: '🏢', label: 'Operations' },
    { to: '/driver', icon: '🚗', label: 'Fleet' },
    { to: '/customer', icon: '📦', label: 'Orders' },
  ],
  driver: [
    { to: '/driver', icon: '🚗', label: 'My Route' },
  ],
  customer: [
    { to: '/customer', icon: '📦', label: 'My Shipments' },
  ],
  warehouse_manager: [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/manager', icon: '🏢', label: 'Operations' },
  ],
};

function AppLayout() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.customer;

  return (
    <AppContainer>
      {/* Sidebar Navigation */}
      <Sidebar>
        <SidebarLogo>
          🚛 SmartChain
          <span>AI Logistics Platform</span>
        </SidebarLogo>
        <SidebarNav>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => isActive ? 'active' : ''} end={item.to === '/'}>
                {item.icon} <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </SidebarNav>

        {/* User Profile in Sidebar */}
        <SidebarUser>
          <SidebarUserInfo>
            <SidebarUserAvatar>
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </SidebarUserAvatar>
            <SidebarUserDetails>
              <SidebarUserName>{user.full_name || user.username}</SidebarUserName>
              <SidebarUserRole>
                <Badge $type={user.role}>{user.role}</Badge>
              </SidebarUserRole>
            </SidebarUserDetails>
          </SidebarUserInfo>
          <SidebarLogoutBtn onClick={logout} title="Sign Out">
            🚪
          </SidebarLogoutBtn>
        </SidebarUser>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <Routes>
          {/* Dashboard — admins and warehouse managers */}
          <Route path="/" element={
            <ProtectedRoute roles={['admin', 'warehouse_manager']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* Operations Page */}
          <Route path="/manager" element={
            <ProtectedRoute roles={['admin', 'warehouse_manager']}>
              <ManagerPage />
            </ProtectedRoute>
          } />

          {/* Driver Page */}
          <Route path="/driver" element={
            <ProtectedRoute roles={['admin', 'driver']}>
              <DriverPage />
            </ProtectedRoute>
          } />

          {/* Customer Page */}
          <Route path="/customer" element={
            <ProtectedRoute roles={['admin', 'driver', 'customer']}>
              <CustomerPage />
            </ProtectedRoute>
          } />

          {/* Catch-all redirect to role default */}
          <Route path="*" element={<Navigate to={getRoleDefaultRoute(user.role)} replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public route — Login */}
            <Route path="/login" element={<LoginPageWrapper />} />

            {/* All other routes — protected */}
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

/**
 * Wrapper to redirect authenticated users away from login page.
 */
function LoginPageWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading...</p>
      </LoadingContainer>
    );
  }

  if (user) {
    return <Navigate to={getRoleDefaultRoute(user.role)} replace />;
  }

  return <LoginPage />;
}

export default App;
