import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReceptionDashboard } from '@/api/analytics';
import { fetchAppointments } from '@/api/appointments';
import { CrmActivityPanel, CrmBadge, CrmDashboardHero, CrmGrid2, CrmKpi, CrmListActions, CrmModuleGrid, CrmPanel, CrmSearch, CrmSectionHeader, FigmaScreen } from '@/components/app';
import { BarChartColumns, DonutChart } from '@/components/ui/charts';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { todayDateString } from '@/utils/clinical';

export function ReceptionDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: activity, log } = useLiveActivity();
  const [search, setSearch] = useState('');
  const date = todayDateString();

  const go = (path: string, label: string) => {
    log(label);
    navigate(path);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['reception-dashboard'],
    queryFn: fetchReceptionDashboard,
  });

  const { data: appointments, isLoading: apptsLoading } = useQuery({
    queryKey: ['appointments', 'dashboard', date],
    queryFn: () => fetchAppointments({ date, page: 1, limit: 20 }),
  });

  if (isLoading || !data || apptsLoading) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  const apptList = appointments?.data ?? [];
  const filtered = apptList.filter((a) => {
    const name = `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.toLowerCase();
    return !search || name.includes(search.toLowerCase());
  });

  const waiting = data.waitingCount;
  const done = Math.max(0, data.patientsToday - waiting - data.pendingAppointments);
  const completedAppts = apptList.filter((a) => a.status === 'completed').length;

  const statusVariant = (s: string): 'success' | 'warning' | 'info' | 'danger' => {
    if (s === 'completed') return 'success';
    if (s === 'waiting' || s === 'in_consultation') return 'warning';
    if (s === 'cancelled' || s === 'no_show') return 'danger';
    return 'info';
  };

  return (
    <FigmaScreen>
      <CrmDashboardHero
        variant="teal"
        title={`Front desk — ${user?.firstName || 'Reception'}`}
        subtitle="Patients, appointments, payments & live queue at your fingertips"
        chips={[
          { label: 'Patients', value: String(data.patientsToday), accent: '#22d3ee' },
          { label: 'Waiting', value: String(data.waitingCount), accent: '#fbbf24' },
          { label: 'Revenue', value: `₹${(data.revenueToday / 1000).toFixed(1)}k`, accent: '#34d399' },
          { label: 'Follow-ups', value: String(data.pendingFollowups), accent: '#a78bfa' },
        ]}
        actions={
          <>
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('/reception/patients', '+ Add Patient')}>
              + Add Patient
            </button>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/reception/appointments', 'Book')}>
              Book Appointment
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => go('/reception/queue/tv', 'Queue TV')}>
              Queue TV
            </button>
          </>
        }
      />

      <CrmSectionHeader title="Front desk shortcuts" hint="One-click access" />
      <div className="crm-actions-section" style={{ marginTop: 0 }}>
        <CrmModuleGrid
          items={[
            { icon: '➕', title: 'Register Patient', sub: 'New walk-in', color: '#2563eb', onClick: () => go('/reception/patients', 'Register Patient') },
            { icon: '📅', title: 'Book Slot', sub: 'Live availability', color: '#10b981', onClick: () => go('/reception/appointments', 'Book Appointment') },
            { icon: '💳', title: 'Collect Fee', sub: 'Partial pay OK', color: '#8b5cf6', onClick: () => go('/reception/payments', 'Collect Payment') },
            { icon: '🧾', title: 'Billing', sub: 'Invoices', color: '#06b6d4', onClick: () => go('/reception/billing', 'Billing') },
            { icon: '📋', title: 'Queue Board', sub: `${data.waitingCount} waiting`, color: '#f59e0b', onClick: () => go('/reception/queue', 'Queue Board'), },
            { icon: '📺', title: 'Queue TV', sub: 'Waiting room', color: '#ef4444', onClick: () => go('/reception/queue/tv', 'Queue TV') },
            { icon: '🔔', title: 'Follow-ups', sub: `${data.pendingFollowups} pending`, color: '#8b5cf6', onClick: () => go('/reception/followups', 'Follow-ups') },
            { icon: '👥', title: 'All Patients', sub: 'Search & edit', color: '#2563eb', onClick: () => go('/reception/patients', 'All Patients') },
          ]}
        />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/reception/payments', 'Collect Payment')}>
          Collect Payment
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/reception/queue', 'View Queue')}>
          View Queue
        </button>
      </CrmListActions>

      <div className="crm-kpis-8">
        <CrmKpi delay={0} onClick={() => go('/reception/patients', 'KPI: Patients')} label="Patients Today" value={data.patientsToday} trend="↑ live" icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi delay={50} onClick={() => go('/reception/payments', 'KPI: Revenue')} label="Revenue Today" value={`₹${(data.revenueToday / 1000).toFixed(1)}k`} trend="↑ 8%" icon="💰" iconColor="#10b981" sparkColor="#10b981" sparkData={[2, 3, 4, 5, 6, 7, data.revenueToday / 1000]} pulse />
        <CrmKpi delay={100} onClick={() => go('/reception/queue', 'KPI: Waiting')} label="Waiting" value={data.waitingCount} trend="queue" icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" pulse={data.waitingCount > 0} />
        <CrmKpi delay={150} onClick={() => go('/reception/appointments', 'KPI: Appts')} label="Pending Appts" value={data.pendingAppointments} icon="📅" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi delay={200} onClick={() => go('/reception/followups', 'KPI: Follow-ups')} label="Follow-ups" value={data.pendingFollowups} icon="📋" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi delay={250} label="Completed" value={completedAppts} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi delay={300} label="Scheduled" value={apptList.length} trend="today" icon="🗓" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi delay={350} label="Queue Load" value={waiting + data.pendingAppointments} icon="📊" iconColor="#ef4444" sparkColor="#ef4444" />
      </div>

      <CrmSearch value={search} onChange={setSearch} placeholder="Search patient name…" />

      <CrmGrid2>
        <CrmPanel title="Hourly Traffic">
          <BarChartColumns
            data={[
              { label: '9', value: 4 + Math.min(waiting, 3) },
              { label: '10', value: 9 },
              { label: '11', value: 14 },
              { label: '12', value: 7 },
              { label: '1', value: 11 },
              { label: '2', value: 8 },
            ]}
          />
        </CrmPanel>
        <CrmPanel title="Status Breakdown">
          <DonutChart
            centerLabel="Today"
            segments={[
              { value: done, color: '#10b981', label: 'Done' },
              { value: waiting, color: '#f59e0b', label: 'Waiting' },
              { value: data.pendingAppointments, color: '#2563eb', label: 'Scheduled' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="Today's Appointments" badge={<span style={{ fontSize: 12, color: 'var(--app-muted)' }}>{filtered.length} shown</span>}>
        <table className="crm-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--app-muted)', padding: 24 }}>
                  No appointments today
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  className="clickable"
                  onClick={() => {
                    if (a.patientId) {
                      log(`Opened patient ${a.patient?.firstName || ''}`);
                      navigate(`/reception/patients/${a.patientId}`);
                    }
                  }}
                >
                  <td>
                    <strong>{a.patient ? `${a.patient.firstName} ${a.patient.lastName ?? ''}`.trim() : '—'}</strong>
                  </td>
                  <td>{a.doctor ? `Dr. ${a.doctor.lastName || a.doctor.firstName}` : '—'}</td>
                  <td>{new Date(a.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <CrmBadge label={a.status.replace('_', ' ')} variant={statusVariant(a.status)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CrmPanel>

      <CrmActivityPanel
        items={activity}
        side={
          <>
            <h4>Quick tips</h4>
            <ul className="crm-tip-list">
              <li>Use Queue TV for the waiting room display</li>
              <li>Partial payments are supported at checkout</li>
              <li>Book slots with live doctor availability</li>
              <li>Click table rows to open patient records</li>
            </ul>
          </>
        }
      />
    </FigmaScreen>
  );
}
