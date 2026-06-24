import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';
import { useAuth } from '@/hooks/useAuth';
import { fetchClinicSettings } from '@/api/settings';
import { PLATFORM_OWNER, PRODUCT_NAME } from '@/config/roleNavigation';
import { formatRoleLabel } from '@/utils/roles';
import type { NavItem, UserRole } from '@/types';

const PAGE_TITLES: Record<string, string> = {
  '/super-admin/dashboard': 'Dashboard',
  '/super-admin/onboarding': 'Onboarding',
  '/super-admin/clinics': 'Clinics',
  '/super-admin/users': 'Users',
  '/super-admin/subscriptions': 'Subscriptions',
  '/super-admin/analytics': 'Analytics',
  '/super-admin/audit': 'Audit Log',
  '/super-admin/settings': 'Settings',
  '/admin/dashboard': 'Clinic Dashboard',
  '/admin/users': 'Staff',
  '/admin/patients': 'Patients',
  '/admin/payments': 'Payments',
  '/admin/followups': 'Follow-ups',
  '/admin/billing': 'Billing',
  '/admin/communications': 'Communications',
  '/admin/pharmacy': 'Pharmacy',
  '/admin/audit': 'Audit Log',
  '/admin/analytics': 'Analytics',
  '/admin/settings/clinic': 'Clinic Settings',
  '/reception/dashboard': 'Dashboard',
  '/reception/patients': 'Patients',
  '/reception/appointments': 'Appointments',
  '/reception/payments': 'Payments',
  '/reception/billing': 'Billing',
  '/reception/queue': 'Queue',
  '/reception/queue/tv': 'Queue TV',
  '/reception/followups': 'Follow-ups',
  '/doctor/dashboard': 'Doctor Dashboard',
  '/doctor/queue': 'My Queue',
  '/doctor/schedule': 'Schedule',
  '/doctor/prescriptions': 'Prescriptions',
  '/doctor/labs': 'Labs',
  '/doctor/followups': 'Follow-ups',
};

function resolveTitle(pathname: string, navItems: NavItem[]) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = navItems.find((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  return match?.label ?? PRODUCT_NAME;
}

function userInitials(first?: string | null, last?: string | null) {
  const a = first?.trim()?.[0] ?? '';
  const b = last?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '?';
}

interface AppShellProps {
  navItems: NavItem[];
  role: UserRole;
}

export function AppShell({ navItems, role }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const title = resolveTitle(location.pathname, navItems);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { data: clinic } = useQuery({
    queryKey: ['settings', 'clinic'],
    queryFn: fetchClinicSettings,
    enabled: role === 'client_admin' && !!user?.organizationId,
  });

  const orgLabel =
    role === 'super_admin'
      ? PLATFORM_OWNER
      : clinic?.name || (user?.organizationId ? 'Clinic Workspace' : 'Clinic');

  return (
    <div className="crm-app">
      <Sidebar items={navItems} role={role} orgLabel={orgLabel} />
      <div className="crm-main">
        <header className="crm-topbar">
          <h1>{title}</h1>
          <div className="crm-topbar-meta">
            <span className="crm-topbar-clock">
              {now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              {' · '}
              {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className={`crm-role-pill${role === 'super_admin' ? ' platform' : ''}`}>
              {formatRoleLabel(role)}
            </span>
            <div className="crm-topbar-user">
              <span className="crm-topbar-avatar" title={`${user?.firstName} ${user?.lastName}`}>
                {userInitials(user?.firstName, user?.lastName)}
              </span>
              <span>
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <button
              type="button"
              className="crm-btn crm-btn-secondary"
              style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <div className="crm-content">
          <Outlet />
        </div>
      </div>
      <ChangePasswordDialog />
    </div>
  );
}
