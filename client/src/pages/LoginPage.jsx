import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getRoleDefaultRoute } from '../components/Auth/ProtectedRoute';
import {
  LoginPageContainer, ParticlesContainer, Particle, LoginCard, BrandingPanel,
  BrandingContent, BrandingLogo, FeaturesGrid, FeatureItem, FormPanel,
  FormWrapper, FormHeader, DemoLogins, DemoButton, Form, FormGroup,
  RoleSelector, RoleOption, ErrorMsg, SubmitButton, FormSwitch, DemoCredentials
} from './LoginPage.styles';

const ROLE_INFO = {
  customer: { icon: '📦', label: 'Customer', desc: 'Track & create shipments' },
  admin: { icon: '🏢', label: 'Admin', desc: 'See profits from each warehouse' },
  driver: { icon: '🚗', label: 'Driver', desc: 'Routes & delivery tasks' },
  warehouse_manager: { icon: '🏭', label: 'Warehouse Manager', desc: 'Inventory & hub operations' },
};

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (mode === 'login') {
        user = await login(username, password);
      } else {
        user = await register({ username, password, full_name: fullName, role: selectedRole, email });
      }
      navigate(getRoleDefaultRoute(user.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemoCredentials(role) {
    setUsername(`${role}1`);
    setPassword('password123');
    setError('');
  }

  return (
    <LoginPageContainer className="fade-in">
      <ParticlesContainer>
        <Particle $size="400px" $bg="accentBlue" $top="-100px" $left="-100px" $delay="0s" />
        <Particle $size="300px" $bg="accentPurple" $top="50%" $right="-80px" $delay="-3s" />
        <Particle $size="250px" $bg="accentCyan" $bottom="-60px" $left="30%" $delay="-6s" />
        <Particle $size="180px" $bg="accentGreen" $top="20%" $right="25%" $delay="-9s" />
        <Particle $size="220px" $bg="accentPink" $bottom="15%" $left="10%" $delay="-12s" />
      </ParticlesContainer>

      <LoginCard>
        <BrandingPanel>
          <BrandingContent>
            <BrandingLogo>🚛 CargoSync AI</BrandingLogo>
            <h1>AI-Powered<br />Logistics Platform</h1>
            <p>Intelligent supply chain optimization for Bangalore operations with real-time multi-agent decision making.</p>

            <FeaturesGrid>
              <FeatureItem>
                <span className="icon">🤖</span>
                <span>7 AI Agents</span>
              </FeatureItem>
              <FeatureItem>
                <span className="icon">📡</span>
                <span>Real-Time Tracking</span>
              </FeatureItem>
              <FeatureItem>
                <span className="icon">🗺️</span>
                <span>Route Optimization</span>
              </FeatureItem>
              <FeatureItem>
                <span className="icon">⚡</span>
                <span>Dynamic Routing</span>
              </FeatureItem>
            </FeaturesGrid>
          </BrandingContent>
        </BrandingPanel>

        <FormPanel>
          <FormWrapper>
            <FormHeader>
              <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Sign in to your account' : 'Register a new account'}</p>
            </FormHeader>

            {mode === 'login' && (
              <DemoLogins>
                <p className="label">Quick Demo Login</p>
                <div className="grid">
                  {Object.entries(ROLE_INFO).map(([role, info]) => (
                    <DemoButton
                      key={role}
                      type="button"
                      className={username === `${role}1` ? 'active' : ''}
                      onClick={() => fillDemoCredentials(role)}
                    >
                      <span className="icon">{info.icon}</span>
                      <span className="label">{info.label}</span>
                    </DemoButton>
                  ))}
                </div>
              </DemoLogins>
            )}

            <Form onSubmit={handleSubmit}>
              {error && <ErrorMsg>{error}</ErrorMsg>}

              {mode === 'register' && (
                <>
                  <FormGroup>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Select Role</label>
                    <RoleSelector>
                      {Object.entries(ROLE_INFO).map(([role, info]) => (
                        <RoleOption
                          key={role}
                          type="button"
                          className={selectedRole === role ? 'active' : ''}
                          onClick={() => setSelectedRole(role)}
                        >
                          <span className="icon">{info.icon}</span>
                          <span className="name">{info.label}</span>
                          <span className="desc">{info.desc}</span>
                        </RoleOption>
                      ))}
                    </RoleSelector>
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <><span className="btn-spinner"></span> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </SubmitButton>
            </Form>

            <FormSwitch>
              {mode === 'login' ? (
                <p>Don't have an account? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Register</button></p>
              ) : (
                <p>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign In</button></p>
              )}
            </FormSwitch>
          </FormWrapper>
        </FormPanel>
      </LoginCard>
    </LoginPageContainer>
  );
}
