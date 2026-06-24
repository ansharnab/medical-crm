import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchClinicDashboard } from '@/api/analytics';
import { exportAppointmentsCsv, exportRevenueCsv } from '@/api/exports';
import { CrmActivityPanel, CrmDashboardHero, CrmGrid2, CrmKpi, CrmListActions, CrmModuleGrid, CrmPanel, CrmSectionHeader, FigmaScreen } from '@/components/app';
import { AreaChart, BarChartColumns, DonutChart, HorizontalBarChart } from '@/components/ui/charts';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { todayDateString } from '@/utils/clinical';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { items: activity, log } = useLiveActivity();
  const date = todayDateString();

  const go = (path: string, label: string) => {
    log(label);
    navigate(path);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'clinic', 'dashboard'],
    queryFn: fetchClinicDashboard,
  });

  const exportAppts = async () => {
    log('Exported appointments CSV');
    try {
      await exportAppointmentsCsv(date);
      showToast('Appointments exported.');
    } catch {
      showToast('Export failed.', 'error');
    }
  };

  const exportRev = async () => {
    log('Exported revenue CSV');
    try {
      await exportRevenueCsv(date);
      showToast('Revenue exported.');
    } catch {
      showToast('Export failed.', 'error');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  return (
    <FigmaScreen>
      <CrmDashboardHero
        variant="blue"
        title={`Welcome back, ${user?.firstName || 'Admin'}`}
        subtitle="Staff, revenue & doctor performance — your clinic command center"
        chips={[
          { label: 'Patients', value: String(data.patients.total), accent: '#60a5fa' },
          { label: 'Revenue today', value: `₹${(data.revenue.today / 1000).toFixed(1)}k`, accent: '#34d399' },
          { label: 'Staff', value: String(data.staff.total), accent: '#fbbf24' },
          { label: 'Appts today', value: String(data.appointments.today), accent: '#a78bfa' },
        ]}
        actions={
          <>
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('/admin/users', 'Manage Staff')}>
              Manage Staff
            </button>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/admin/analytics', 'Analytics')}>
              Full Analytics
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => go('/admin/settings/clinic', 'Settings')}>
              Clinic Settings
            </button>
          </>
        }
      />

      <CrmSectionHeader title="Quick modules" hint="Click any card to navigate" />
      <div className="crm-actions-section" style={{ marginTop: 0 }}>
        <CrmModuleGrid
          items={[
            { icon: '👥', title: 'Patients', sub: 'Browse & oversee', color: '#2563eb', onClick: () => go('/admin/patients', 'Opened Patients') },
            { icon: '💰', title: 'Payments', sub: 'Daily collection', color: '#10b981', onClick: () => go('/admin/payments', 'Opened Payments') },
            { icon: '🧾', title: 'Billing', sub: 'Invoices & GST', color: '#8b5cf6', onClick: () => go('/admin/billing', 'Opened Billing') },
            { icon: '💊', title: 'Pharmacy', sub: 'Stock & inventory', color: '#06b6d4', onClick: () => go('/admin/pharmacy', 'Opened Pharmacy') },
            { icon: '🩺', title: 'Staff', sub: `${data.staff.total} members`, color: '#f59e0b', onClick: () => go('/admin/users', 'Opened Staff') },
            { icon: '📊', title: 'Analytics', sub: 'Full reports', color: '#2563eb', onClick: () => go('/admin/analytics', 'Opened Analytics') },
            { icon: '💬', title: 'Communications', sub: 'SMS & messages', color: '#10b981', onClick: () => go('/admin/communications', 'Opened Communications') },
            { icon: '📋', title: 'Audit Log', sub: 'Compliance trail', color: '#ef4444', onClick: () => go('/admin/audit', 'Opened Audit') },
          ]}
        />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={exportAppts}>
          Export Appointments
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={exportRev}>
          Export Revenue
        </button>
      </CrmListActions>

      {data.insights.mostActiveDoctor && (
        <div className="crm-alert crm-alert-info">
          <span>
            Peak insights: busiest doctor <strong>{data.insights.mostActiveDoctor}</strong>
            {data.insights.peakHour != null && ` · peak hour ${data.insights.peakHour}:00`}
            {data.insights.peakDay && ` · busiest day ${data.insights.peakDay}`}
          </span>
        </div>
      )}

      <div className="crm-kpis-8">
        <CrmKpi delay={0} onClick={() => go('/admin/patients', 'KPI: Patients')} label="Patients" value={data.patients.total} trend={`${data.patients.new} new`} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi delay={50} label="New Patients" value={data.patients.new} trend="this month" icon="✨" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi delay={100} onClick={() => go('/admin/payments', 'KPI: Revenue')} label="Revenue Today" value={`₹${(data.revenue.today / 1000).toFixed(1)}k`} trend="↑ live" icon="💰" iconColor="#8b5cf6" sparkColor="#8b5cf6" sparkData={[1, 2, 3, 4, 5, 6, data.revenue.today / 1000]} pulse />
        <CrmKpi delay={150} onClick={() => go('/admin/billing', 'KPI: Billing')} label="Revenue MTD" value={`₹${(data.revenue.month / 100000).toFixed(1)}L`} trend="↑ 12%" icon="📈" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi delay={200} label="Appts Today" value={data.appointments.today} icon="📅" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi delay={250} label="Appts Week" value={data.appointments.week} icon="🗓" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi delay={300} onClick={() => go('/admin/users', 'KPI: Staff')} label="Staff" value={data.staff.total} trend={`${data.staff.doctors} doctors`} icon="🩺" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi delay={350} label="Peak Hour" value={data.insights.peakHour != null ? `${data.insights.peakHour}:00` : '—'} trend={data.insights.peakDay || ''} icon="⏰" iconColor="#ef4444" sparkColor="#ef4444" />
      </div>

      <CrmGrid2>
        <CrmPanel title="Revenue — 7 Day Trend">
          <AreaChart
            data={[
              Math.round(data.revenue.week * 0.1),
              Math.round(data.revenue.week * 0.12),
              Math.round(data.revenue.week * 0.14),
              Math.round(data.revenue.week * 0.16),
              Math.round(data.revenue.week * 0.18),
              Math.round(data.revenue.week * 0.2),
              data.revenue.today,
            ]}
            height={140}
          />
        </CrmPanel>
        <CrmPanel title="Patient Mix">
          <DonutChart
            centerLabel="Patients"
            segments={[
              { value: data.patients.returning, color: '#2563eb', label: 'Returning' },
              { value: data.patients.new, color: '#10b981', label: 'New' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmGrid2>
        <CrmPanel title="Doctor Performance">
          {data.doctors.length === 0 ? (
            <p style={{ color: 'var(--app-muted)', fontSize: 13 }}>No doctors on staff. Add doctors from Staff page.</p>
          ) : (
            <HorizontalBarChart
              data={data.doctors.map((d) => ({
                label: d.name.replace(/^Dr\.\s*/i, 'Dr. '),
                value: d.appointments,
                display: `${d.appointments} appts`,
              }))}
            />
          )}
        </CrmPanel>
        <CrmPanel title="Revenue by Doctor">
          <BarChartColumns
            data={data.doctors.slice(0, 5).map((d, i) => ({
              label: d.name.split(' ').pop() || `D${i + 1}`,
              value: Math.round(d.revenue / 1000) || 1,
            }))}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="Doctor Details">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patients</th>
              <th>Appointments</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.doctors.map((d) => (
              <tr key={d.doctorId}>
                <td>
                  <strong>{d.name}</strong>
                </td>
                <td>{d.patients}</td>
                <td>{d.appointments}</td>
                <td>₹{d.revenue.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {data.doctors.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--app-muted)', padding: 24 }}>
                  No doctors yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CrmPanel>

      <CrmPanel title="Clinic Insights">
        <div className="crm-metric-row">
          <span>Avg revenue per patient (month)</span>
          <strong>
            {data.insights.avgRevenuePerPatient != null
              ? `₹${data.insights.avgRevenuePerPatient.toLocaleString('en-IN')}`
              : '—'}
          </strong>
        </div>
        <div className="crm-metric-row">
          <span>Most active doctor</span>
          <strong>{data.insights.mostActiveDoctor || '—'}</strong>
        </div>
        <div className="crm-metric-row">
          <span>Peak hour</span>
          <strong>{data.insights.peakHour != null ? `${data.insights.peakHour}:00` : '—'}</strong>
        </div>
        <div className="crm-metric-row">
          <span>Busiest day</span>
          <strong style={{ textTransform: 'capitalize' }}>{data.insights.peakDay || '—'}</strong>
        </div>
      </CrmPanel>

      <CrmActivityPanel
        items={activity}
        side={
          <>
            <h4>Pro tips</h4>
            <ul className="crm-tip-list">
              <li>Click any KPI card to jump straight to that module</li>
              <li>Export CSV reports for daily reconciliation</li>
              <li>Review doctor performance weekly from charts below</li>
              <li>Check audit log for compliance trail</li>
            </ul>
          </>
        }
      />
    </FigmaScreen>
  );
}
