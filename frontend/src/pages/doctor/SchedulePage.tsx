import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { fetchAppointments } from '@/api/appointments';
import { CrmBadge, CrmEmpty, CrmHint, CrmKpi, CrmListLoading, CrmPanel, FigmaScreen } from '@/components/app';
import { todayDateString } from '@/utils/clinical';
import { formatDateTime } from '@/utils/formatDate';

export function DoctorSchedulePage() {
  const date = todayDateString();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-schedule', date],
    queryFn: () => fetchAppointments({ date, page: 1, limit: 50 }),
  });

  const appts = data?.data ?? [];
  const completed = appts.filter((a) => a.status === 'completed').length;

  return (
    <FigmaScreen>
      <CrmHint>Today&apos;s appointments — your schedule</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Today" value={appts.length} icon="📅" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Completed" value={completed} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Waiting" value={appts.filter((a) => a.status === 'waiting').length} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
      </div>
      <CrmPanel title={`Schedule — ${date}`}>
        {isLoading ? <CrmListLoading /> : appts.length === 0 ? <CrmEmpty message="No appointments today." /> : (
          <table className="crm-table">
            <thead><tr><th>Time</th><th>Patient</th><th>Token</th><th>Status</th><th /></tr></thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td>{formatDateTime(a.scheduledAt)}</td>
                  <td>{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}</td>
                  <td>#{a.tokenNumber ?? '—'}</td>
                  <td><CrmBadge label={a.status} variant={a.status === 'completed' ? 'success' : 'info'} /></td>
                  <td>
                    {(a.status === 'waiting' || a.status === 'in_consultation') && (
                      <RouterLink to={`/doctor/consultations/${a.id}`} className="crm-link">Consult</RouterLink>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CrmPanel>
    </FigmaScreen>
  );
}
