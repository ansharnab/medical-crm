import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { fetchAppointments } from '@/api/appointments';
import { CrmEmpty, CrmHint, CrmKpi, CrmListLoading, CrmPanel, FigmaScreen } from '@/components/app';
import { todayDateString } from '@/utils/clinical';

export function DoctorPrescriptionsListPage() {
  const date = todayDateString();

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-rx-list', date],
    queryFn: () => fetchAppointments({ date, page: 1, limit: 50, status: 'completed' }),
  });

  const appts = (data?.data ?? []).filter((a) => a.status === 'completed' || a.status === 'in_consultation');

  return (
    <FigmaScreen>
      <CrmHint>E-prescriptions — open from today&apos;s consultations</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <CrmKpi label="Consultations" value={appts.length} icon="💊" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Date" value={date} icon="📅" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>
      <CrmPanel title="Write Prescription">
        {isLoading ? <CrmListLoading /> : appts.length === 0 ? <CrmEmpty message="No consultations yet today." /> : (
          <table className="crm-table">
            <thead><tr><th>Patient</th><th>Status</th><th /></tr></thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}</td>
                  <td>{a.status}</td>
                  <td>
                    <RouterLink to={`/doctor/consultations/${a.id}/prescription`} className="crm-link">Open Rx</RouterLink>
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
