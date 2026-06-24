import { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PLATFORM_OWNER, PRODUCT_NAME, ROLE_DESCRIPTIONS } from '@/config/roleNavigation';
import { getRoleHomePath, formatRoleLabel } from '@/utils/roles';
import { getApiErrorMessage } from '@/utils/apiError';
import type { ClinicLoginOption, UserRole } from '@/types';

export function LoginPage() {
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicOptions, setClinicOptions] = useState<ClinicLoginOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');

  if (authLoading) {
    return (
      <div className="crm-loading" style={{ minHeight: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  const showClinicSelection = clinicOptions.length > 0;

  const handleSignIn = async (organizationId?: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      const outcome = await login(email, password, organizationId);
      if (outcome.status === 'select_clinic') {
        setClinicOptions(outcome.clinics);
        setSelectedOrganizationId(outcome.clinics[0]?.organizationId || '');
        return;
      }
      navigate(getRoleHomePath(outcome.user.role));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showClinicSelection) {
      if (!selectedOrganizationId) {
        setError('Please select a clinic.');
        return;
      }
      await handleSignIn(selectedOrganizationId);
      return;
    }
    await handleSignIn();
  };

  const demoAccounts: { role: UserRole; email: string; password: string }[] = [
    { role: 'super_admin', email: 'admin@doctorcrm.com', password: 'Admin@123456' },
    { role: 'client_admin', email: 'admin@democlinic.com', password: 'Demo@123456' },
    { role: 'doctor', email: 'doctor@democlinic.com', password: 'Demo@123456' },
    { role: 'receptionist', email: 'reception@democlinic.com', password: 'Demo@123456' },
  ];

  return (
    <div className="crm-login-wrap">
      <div className="crm-login-brand">
        <h1>
          {PRODUCT_NAME}
          <br />
          Clinic Management Platform
        </h1>
        <p>
          Multi-tenant SaaS for appointments, consultations, billing, queue management and analytics — built
          for clinics across India.
        </p>
        <p className="owner">Powered by {PLATFORM_OWNER}</p>
        <div className="crm-login-stats">
          <div className="crm-login-stat">
            <strong>4</strong>
            <span>Role portals</span>
          </div>
          <div className="crm-login-stat">
            <strong>Live</strong>
            <span>Queue & billing</span>
          </div>
          <div className="crm-login-stat">
            <strong>24/7</strong>
            <span>Cloud access</span>
          </div>
        </div>
      </div>

      <div className="crm-login-form-wrap crm-login-scene">
        <div className="crm-login-card">
          <h2>Sign in</h2>
          <p className="sub">Use your role-specific account. Access is enforced by permissions.</p>

          {error && <div className="crm-login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!showClinicSelection ? (
              <>
                <div className="crm-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="crm-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="crm-field">
                <label htmlFor="clinic">Select clinic</label>
                <select
                  id="clinic"
                  required
                  value={selectedOrganizationId}
                  onChange={(e) => setSelectedOrganizationId(e.target.value)}
                >
                  {clinicOptions.map((c) => (
                    <option key={c.organizationId} value={c.organizationId}>
                      {c.name}
                      {c.city ? ` · ${c.city}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="crm-btn crm-btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : showClinicSelection ? 'Continue' : 'Sign in'}
            </button>
          </form>

          {!showClinicSelection && (
            <RouterLink to="/forgot-password" style={{ display: 'block', marginTop: 16, fontSize: 13, color: '#2563eb' }}>
              Forgot password?
            </RouterLink>
          )}

          <RouterLink to="/portal" style={{ display: 'block', marginTop: 12, fontSize: 13, color: '#06b6d4' }}>
            Patient Portal →
          </RouterLink>

          <p style={{ marginTop: 16, fontSize: 11, color: 'var(--app-muted)', textAlign: 'center' }}>
            Support: <a href="tel:9211611187">9211611187</a> ·{' '}
            <a href="mailto:info@maatridev.com">info@maatridev.com</a>
          </p>

          <div className="crm-login-roles">
            <h3>Demo accounts (development)</h3>
            {demoAccounts.map((a) => (
              <p key={a.email}>
                <strong>{formatRoleLabel(a.role)}:</strong> {a.email} / {a.password}
              </p>
            ))}
            <p style={{ marginTop: 8, fontFamily: 'inherit' }}>{ROLE_DESCRIPTIONS.super_admin}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
