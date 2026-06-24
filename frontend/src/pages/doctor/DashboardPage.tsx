import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchDoctorDashboard } from '@/api/analytics';
import { CrmActivityPanel, CrmDashboardHero, CrmGrid2, CrmKpi, CrmListActions, CrmModuleGrid, CrmPanel, CrmSectionHeader, FigmaScreen } from '@/components/app';
import { DonutChart } from '@/components/ui/charts';
import { useAuth } from '@/hooks/useAuth';
import { useLiveActivity } from '@/hooks/useLiveActivity';

export function DoctorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: activity, log } = useLiveActivity();
  const { data, isLoading } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: fetchDoctorDashboard,
  });

  if (isLoading || !data) {
    return (
      <div className="crm-loading">
        <CircularProgress />
      </div>
    );
  }

  const scheduled = Math.max(0, data.appointmentsToday - data.completed - data.waiting - data.inConsultation);
  const completionRate = data.appointmentsToday > 0 ? Math.round((data.completed / data.appointmentsToday) * 100) : 0;

  const go = (path: string, label: string) => {
    log(label);
    navigate(path);
  };

  return (
    <FigmaScreen>
      <CrmDashboardHero
        variant="amber"
        title={`Dr. ${user?.lastName || user?.firstName || 'Doctor'}`}
        subtitle="Queue, consultations, prescriptions & follow-ups — your clinical workspace"
        chips={[
          { label: 'Appts', value: String(data.appointmentsToday), accent: '#60a5fa' },
          { label: 'Waiting', value: String(data.waiting), accent: '#fbbf24' },
          { label: 'In consult', value: String(data.inConsultation), accent: '#a78bfa' },
          { label: 'Done', value: String(data.completed), accent: '#34d399' },
        ]}
        actions={
          <>
            <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('/doctor/queue', 'Open Queue')}>
              Open Queue
            </button>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/doctor/prescriptions', 'E-Rx')}>
              Write Prescription
            </button>
            <button type="button" className="crm-btn crm-btn-ghost" onClick={() => go('/doctor/followups', 'Follow-ups')}>
              Follow-ups ({data.pendingFollowups})
            </button>
          </>
        }
      />

      <CrmSectionHeader title="Clinical shortcuts" hint="Tap to navigate" />
      <div className="crm-actions-section" style={{ marginTop: 0 }}>
        <CrmModuleGrid
          items={[
            { icon: '📋', title: 'My Queue', sub: `${data.waiting} waiting`, color: '#f59e0b', onClick: () => go('/doctor/queue', 'My Queue') },
            { icon: '📅', title: 'Schedule', sub: 'Today\'s list', color: '#2563eb', onClick: () => go('/doctor/schedule', 'Schedule') },
            { icon: '💊', title: 'Prescriptions', sub: 'E-Rx builder', color: '#10b981', onClick: () => go('/doctor/prescriptions', 'Prescriptions') },
            { icon: '🔬', title: 'Lab Orders', sub: 'Order & results', color: '#8b5cf6', onClick: () => go('/doctor/labs', 'Labs') },
            { icon: '🔔', title: 'Follow-ups', sub: `${data.pendingFollowups} due`, color: '#ef4444', onClick: () => go('/doctor/followups', 'Follow-ups') },
            { icon: '🩺', title: 'Start Consult', sub: 'Call next patient', color: '#06b6d4', onClick: () => go('/doctor/queue', 'Start Consult') },
          ]}
        />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/doctor/schedule', 'Schedule')}>
          Today&apos;s Schedule
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => go('/doctor/labs', 'Labs')}>
          Lab Orders
        </button>
      </CrmListActions>

      {data.waiting > 0 && (
        <div className="crm-alert crm-alert-warning">
          <span>
            <strong>{data.waiting}</strong> patient{data.waiting > 1 ? 's' : ''} waiting in your queue
          </span>
          <button type="button" className="crm-btn crm-btn-primary" onClick={() => go('/doctor/queue', 'Go to Queue')}>
            Go to Queue
          </button>
        </div>
      )}

      <div className="crm-kpis-8">
        <CrmKpi delay={0} onClick={() => go('/doctor/schedule', 'KPI: Appts')} label="Appts Today" value={data.appointmentsToday} icon="📅" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi delay={50} onClick={() => go('/doctor/queue', 'KPI: Waiting')} label="Waiting" value={data.waiting} trend="live" icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" pulse={data.waiting > 0} />
        <CrmKpi delay={100} label="In Consult" value={data.inConsultation} icon="🩺" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi delay={150} label="Completed" value={data.completed} trend={`${completionRate}%`} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi delay={200} label="Scheduled" value={scheduled} icon="🗓" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi delay={250} onClick={() => go('/doctor/followups', 'KPI: Follow-ups')} label="Follow-ups" value={data.pendingFollowups} trend="due" icon="📋" iconColor="#ef4444" sparkColor="#ef4444" />
        <CrmKpi delay={300} label="Completion" value={`${completionRate}%`} icon="📈" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi delay={350} label="Date" value={data.date.slice(5)} icon="📆" iconColor="#64748b" sparkColor="#64748b" />
      </div>

      <CrmGrid2>
        <CrmPanel title="Today's Schedule Breakdown">
          <DonutChart
            centerLabel="Today"
            segments={[
              { value: data.completed, color: '#10b981', label: 'Done' },
              { value: data.inConsultation, color: '#8b5cf6', label: 'In consult' },
              { value: data.waiting, color: '#f59e0b', label: 'Waiting' },
              { value: scheduled, color: '#2563eb', label: 'Scheduled' },
            ].filter((s) => s.value > 0)}
          />
        </CrmPanel>
        <CrmPanel title="Quick Stats">
          <div className="crm-metric-row">
            <span>Completion rate</span>
            <strong>{completionRate > 0 ? `${completionRate}%` : '—'}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Currently consulting</span>
            <strong>{data.inConsultation}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Pending follow-ups</span>
            <strong>{data.pendingFollowups}</strong>
          </div>
          <div className="crm-metric-row">
            <span>Date</span>
            <strong>{data.date}</strong>
          </div>
        </CrmPanel>
      </CrmGrid2>

      <CrmActivityPanel
        items={activity}
        side={
          <>
            <h4>Clinical tips</h4>
            <ul className="crm-tip-list">
              <li>Call next patient from My Queue</li>
              <li>Save vitals during consultation</li>
              <li>E-Rx builder supports multi-drug prescriptions</li>
              <li>Order labs and track results in one place</li>
            </ul>
          </>
        }
      />
    </FigmaScreen>
  );
}
