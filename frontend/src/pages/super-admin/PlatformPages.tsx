import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchPlatformAnalytics } from '@/api/analytics';
import { fetchClinicsOverview } from '@/api/platform';
import { fetchOrganizations } from '@/api/organizations';
import { CrmActivityPanel, CrmBadge, CrmDashboardHero, CrmGrid2, CrmKpi, CrmListActions, CrmModuleGrid, CrmPanel, CrmSectionHeader, FigmaScreen } from '@/components/app';
import { AreaChart, BarChartColumns, DonutChart, HorizontalBarChart } from '@/components/ui/charts';
import { formatDateTime } from '@/utils/formatDate';
import { formatRoleLabel } from '@/utils/roles';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import type { UserRole } from '@/types';

function roleLabel(role: string) {
  return formatRoleLabel(role as UserRole);
}

function PlatformKpis({
  data,
  go,
}: {
  data: NonNullable<Awaited<ReturnType<typeof fetchPlatformAnalytics>>>;
  go: (path: string, label: string) => void;
}) {
  const mrr = Math.round(data.clinics.active * 17500);
  const clientAdmins = data.users.byRole.client_admin ?? 0;
  const doctors = data.users.byRole.doctor ?? 0;

  return (
    <div className="crm-kpis-8">
      <CrmKpi delay={0} onClick={() => go('/super-admin/clinics', 'KPI: Clinics')} label="Total Clinics" value={data.clinics.total} trend={`${data.clinics.active} active`} icon="🏥" iconColor="#2563eb" sparkColor="#2563eb" />
      <CrmKpi delay={50} onClick={() => go('/super-admin/clinics?status=active', 'KPI: Active')} label="Active Clinics" value={data.clinics.active} trend="↑ live" icon="✓" iconColor="#10b981" sparkColor="#10b981" sparkData={[2, 3, 4, 5, 6, 7, data.clinics.active]} pulse />
      <CrmKpi delay={100} onClick={() => go('/super-admin/onboarding', 'KPI: Pending')} label="Pending" value={data.clinics.pending} trend={data.clinics.pending ? 'needs review' : 'clear'} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" pulse={data.clinics.pending > 0} />
      <CrmKpi delay={150} label="Suspended" value={data.clinics.suspended} icon="⛔" iconColor="#ef4444" sparkColor="#ef4444" />
      <CrmKpi delay={200} onClick={() => go('/super-admin/subscriptions', 'KPI: MRR')} label="Est. MRR" value={`₹${(mrr / 100000).toFixed(1)}L`} trend="↑ 12%" icon="💰" iconColor="#8b5cf6" sparkColor="#8b5cf6" sparkData={[1, 2, 3, 4, 5, 6, mrr / 10000]} />
      <CrmKpi delay={250} onClick={() => go('/super-admin/users', 'KPI: Users')} label="Platform Users" value={data.users.total} trend={`${clientAdmins} admins`} icon="👥" iconColor="#06b6d4" sparkColor="#06b6d4" />
      <CrmKpi delay={300} label="Doctors" value={doctors} icon="🩺" iconColor="#2563eb" sparkColor="#2563eb" />
      <CrmKpi delay={350} onClick={() => go('/super-admin/analytics', 'KPI: Appts')} label="Appts Today" value={data.appointments.today} trend={`${data.appointments.total} total`} icon="📅" iconColor="#10b981" sparkColor="#10b981" />
    </div>
  );
}

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: activity, log } = useLiveActivity();

  const go = (path: string, label: string) => {
    log(label);
    navigate(path);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: fetchPlatformAnalytics,
  });

  const { data: pendingClinics } = useQuery({
    queryKey: ['organizations', 'pending', 1],
    queryFn: () => fetchOrganizations({ status: 'pending', page: 1, limit: 5 }),
  });

  if (isLoading || !data) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  const userRoles = Object.entries(data.users.byRole);
  const maxRoleCount = Math.max(...userRoles.map(([, c]) => c), 1);

  return (
    <FigmaScreen>
      <CrmDashboardHero
        variant="purple"
        title={`Platform — ${user?.firstName || 'Admin'}`}
        subtitle="MaatriDev Technologies · manage clinics, users & platform analytics"
        chips={[
          { label: 'Clinics', value: String(data.clinics.total), accent: '#a78bfa' },
          { label: 'Active', value: String(data.clinics.active), accent: '#34d399' },
          { label: 'Pending', value: String(data.clinics.pending), accent: '#fbbf24' },
          { label: 'Users', value: String(data.users.total), accent: '#60a5fa' },
        ]}
        actions={
          <>
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('/super-admin/clinics/new', 'Create Clinic')}>
              + Create Clinic
            </button>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/super-admin/onboarding', 'Onboarding')}>
              Onboarding Queue
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => go('/super-admin/analytics', 'Analytics')}>
              Analytics
            </button>
          </>
        }
      />

      <CrmSectionHeader title="Platform control center" hint="All modules one tap away" />
      <div className="crm-actions-section" style={{ marginTop: 0 }}>
        <CrmModuleGrid
          items={[
            { icon: '🏥', title: 'Onboarding', sub: `${data.clinics.pending} pending`, color: '#f59e0b', onClick: () => go('/super-admin/onboarding', 'Onboarding') },
            { icon: '🏢', title: 'Clinics', sub: `${data.clinics.total} total`, color: '#2563eb', onClick: () => go('/super-admin/clinics', 'Clinics') },
            { icon: '➕', title: 'New Clinic', sub: 'Provision tenant', color: '#10b981', onClick: () => go('/super-admin/clinics/new', 'New Clinic') },
            { icon: '👥', title: 'Users', sub: `${data.users.total} platform`, color: '#06b6d4', onClick: () => go('/super-admin/users', 'Users') },
            { icon: '💳', title: 'Subscriptions', sub: 'Plans & MRR', color: '#8b5cf6', onClick: () => go('/super-admin/subscriptions', 'Subscriptions') },
            { icon: '📊', title: 'Analytics', sub: 'Platform KPIs', color: '#2563eb', onClick: () => go('/super-admin/analytics', 'Analytics') },
            { icon: '📋', title: 'Audit Log', sub: 'Compliance', color: '#ef4444', onClick: () => go('/super-admin/audit', 'Audit') },
            { icon: '⚙️', title: 'Settings', sub: 'Branding & flags', color: '#64748b', onClick: () => go('/super-admin/settings', 'Settings') },
          ]}
        />
      </div>

      {data.clinics.pending > 0 && (
        <div className="crm-alert crm-alert-warning">
          <span>
            <strong>{data.clinics.pending}</strong> clinic{data.clinics.pending > 1 ? 's' : ''} awaiting email verification
            or activation
          </span>
          <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/super-admin/clinics?status=pending', 'Review pending')}>
            Review pending
          </button>
        </div>
      )}

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/super-admin/clinics', 'All Clinics')}>
          All Clinics ({data.clinics.total})
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/super-admin/users', 'Users')}>
          Platform Users
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/super-admin/audit', 'Audit')}>
          Audit Log
        </button>
      </CrmListActions>

      <PlatformKpis data={data} go={go} />

      <CrmGrid2>
        <CrmPanel title="Clinic Status Distribution">
          <DonutChart
            centerLabel="Clinics"
            segments={[
              { value: data.clinics.active, color: '#10b981', label: 'Active' },
              { value: data.clinics.pending, color: '#f59e0b', label: 'Pending' },
              { value: data.clinics.suspended, color: '#ef4444', label: 'Suspended' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
        <CrmPanel title="Users by Role">
          {userRoles.length === 0 ? (
            <p style={{ color: 'var(--app-muted)', fontSize: 13 }}>No users yet</p>
          ) : (
            userRoles.map(([role, count]) => (
              <div key={role} style={{ marginBottom: 14 }}>
                <div className="crm-metric-row">
                  <span>{roleLabel(role)}</span>
                  <strong>{count}</strong>
                </div>
                <div className="crm-progress">
                  <div className="crm-progress-fill" style={{ width: `${(count / maxRoleCount) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </CrmPanel>
      </CrmGrid2>

      <CrmGrid2>
        <CrmPanel title="Platform Growth (clinics)">
          <AreaChart
            data={[1, 2, 3, Math.max(4, data.clinics.total - 2), data.clinics.total - 1, data.clinics.total]}
            height={140}
          />
        </CrmPanel>
        <CrmPanel title="Appointment Volume">
          <BarChartColumns
            data={[
              { label: 'Today', value: data.appointments.today },
              { label: 'Total', value: Math.min(data.appointments.total, 100) },
            ]}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="Recently Onboarded Clinics">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Clinic</th>
              <th>City</th>
              <th>Status</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.recentClinics.map((c) => (
              <tr key={c.id} className="clickable" onClick={() => navigate(`/super-admin/clinics/${c.id}`)}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.city || '—'}</td>
                <td>
                  <CrmBadge
                    label={c.status}
                    variant={c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}
                  />
                </td>
                <td>{formatDateTime(c.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="crm-btn crm-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      go(`/super-admin/clinics/${c.id}`, `Manage ${c.name}`);
                    }}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CrmPanel>

      {(pendingClinics?.data.length ?? 0) > 0 && (
        <CrmPanel title="Needs Attention — Pending Clinics" badge={<CrmBadge label={String(pendingClinics?.meta.total ?? 0)} variant="warning" />}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pendingClinics?.data.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.email}</td>
                  <td>{formatDateTime(c.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="crm-btn crm-btn-primary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => go(`/super-admin/clinics/${c.id}`, `Verify ${c.name}`)}
                    >
                      Verify & Setup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CrmPanel>
      )}

      <CrmActivityPanel
        items={activity}
        side={
          <>
            <h4>Platform ops</h4>
            <ul className="crm-tip-list">
              <li>Review pending clinics from onboarding queue</li>
              <li>Click KPIs to jump to clinics, users or billing</li>
              <li>Monitor MRR from subscriptions module</li>
              <li>Audit log tracks all platform actions</li>
            </ul>
          </>
        }
      />
    </FigmaScreen>
  );
}

export function PlatformAnalyticsPage() {
  const navigate = useNavigate();
  const { log } = useLiveActivity();
  const go = (path: string, label: string) => {
    log(label);
    navigate(path);
  };
  const { data, isLoading } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: fetchPlatformAnalytics,
  });

  const { data: allClinics } = useQuery({
    queryKey: ['clinics-overview'],
    queryFn: fetchClinicsOverview,
  });

  if (isLoading || !data) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  const userRoles = Object.entries(data.users.byRole);

  return (
    <>
      <CrmSectionHeader title="Platform analytics" hint="All clinics & user distribution" />
      <PlatformKpis data={data} go={go} />

      <CrmGrid2>
        <CrmPanel title="User Distribution">
          <HorizontalBarChart
            data={userRoles.map(([role, count]) => ({
              label: roleLabel(role),
              value: count,
              display: String(count),
            }))}
          />
        </CrmPanel>
        <CrmPanel title="Clinic Health">
          <DonutChart
            segments={[
              { value: data.clinics.active, color: '#10b981', label: 'Active' },
              { value: data.clinics.pending, color: '#f59e0b', label: 'Pending' },
              { value: data.clinics.suspended, color: '#ef4444', label: 'Suspended' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="All Clinics Overview">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Clinic</th>
              <th>City</th>
              <th>Status</th>
              <th>Users</th>
              <th>Patients</th>
              <th>Plan</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {(allClinics ?? []).map((c) => (
              <tr key={c.id} className="clickable" onClick={() => navigate(`/super-admin/clinics/${c.id}`)}>
                <td>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 11, color: 'var(--app-muted)' }}>{c.city || '—'}</div>
                </td>
                <td>{c.city || '—'}</td>
                <td>
                  <CrmBadge
                    label={c.status}
                    variant={c.status === 'active' ? 'success' : c.status === 'pending' ? 'warning' : 'danger'}
                  />
                </td>
                <td>{c.users}</td>
                <td>{c.patients}</td>
                <td><CrmBadge label={c.subscriptionPlan} variant="info" /></td>
                <td>{formatDateTime(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CrmPanel>
    </>
  );
}
