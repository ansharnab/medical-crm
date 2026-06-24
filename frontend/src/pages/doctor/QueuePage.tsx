import { Box, CircularProgress } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { callNextPatient, fetchQueue } from '@/api/queue';
import {
  CrmFigmaCard,
  CrmFigmaGrid2,
  CrmHint,
  CrmKpi,
  CrmPill,
  FigmaGauge,
  FigmaGaugeRow,
  FigmaScreen,
} from '@/components/app';
import { todayDateString } from '@/utils/clinical';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';

export function DoctorQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['queue', 'doctor', todayDateString()],
    queryFn: () => fetchQueue({ date: todayDateString() }),
  });

  const callMutation = useMutation({
    mutationFn: (appointmentId: string) => callNextPatient(appointmentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      showToast('Patient called.');
      navigate(`/doctor/consultations/${result.appointmentId}`);
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to call patient.'), 'error'),
  });

  const myQueue = data?.doctors[0];
  const next = myQueue?.waiting[0];
  const waitingCount = myQueue?.waiting.length ?? 0;
  const doneToday = myQueue ? Math.max(0, myQueue.inConsultation ? 1 : 0) : 0;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FigmaScreen>
      <CrmHint>Call next patient · start consultation · <strong>{data?.date || todayDateString()}</strong></CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Waiting" value={waitingCount} trend="live" icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="In Consult" value={myQueue?.inConsultation ? 1 : 0} icon="🩺" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Next Token" value={next?.tokenNumber ?? '—'} icon="🔢" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Doctors" value={data?.doctors.length ?? 0} icon="📊" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmFigmaGrid2>
        <CrmFigmaCard title="My Queue" badge={<CrmPill label={`${waitingCount} waiting`} variant="a" />}>
          <table className="crm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Wait</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {next ? (
                <tr>
                  <td>1</td>
                  <td>
                    <strong>{next.patientName}</strong>
                  </td>
                  <td>~{Math.max(1, waitingCount)}m</td>
                  <td>
                    <button
                      type="button"
                      className="crm-btn crm-btn-primary"
                      style={{ padding: '5px 12px', fontSize: 11 }}
                      disabled={callMutation.isPending}
                      onClick={() => callMutation.mutate(next.appointmentId)}
                    >
                      Call Next →
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--crm-text-muted)', padding: 20 }}>
                    No patients waiting
                  </td>
                </tr>
              )}
              {myQueue?.inConsultation && (
                <tr>
                  <td>—</td>
                  <td>
                    <strong>{myQueue.inConsultation.patientName}</strong>
                  </td>
                  <td>In consult</td>
                  <td>
                    <button
                      type="button"
                      className="crm-btn crm-btn-ghost"
                      style={{ padding: '5px 12px', fontSize: 11 }}
                      onClick={() => navigate(`/doctor/consultations/${myQueue.inConsultation!.appointmentId}`)}
                    >
                      Open →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CrmFigmaCard>

        <CrmFigmaCard title="Progress">
          <FigmaGaugeRow>
            <FigmaGauge value={doneToday + (next ? 0 : 1)} max={18} label="Done" color="#10b981" />
            <FigmaGauge value={waitingCount} max={8} label="Waiting" color="#f59e0b" />
          </FigmaGaugeRow>
        </CrmFigmaCard>
      </CrmFigmaGrid2>
    </FigmaScreen>
  );
}
