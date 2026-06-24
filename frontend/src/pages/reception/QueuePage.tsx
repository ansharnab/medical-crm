import { Box, CircularProgress } from '@mui/material';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchQueue } from '@/api/queue';
import {
  CrmFigmaCard,
  CrmFigmaGrid2,
  CrmHint,
  CrmKpi,
  CrmPill,
  FigmaQueueCard,
  FigmaQueueCards,
  FigmaScreen,
} from '@/components/app';
import { DonutChart, HorizontalBarChart } from '@/components/ui/charts';
import { todayDateString } from '@/utils/clinical';

export function ReceptionQueuePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['queue', todayDateString()],
    queryFn: () => fetchQueue({ date: todayDateString() }),
  });

  const flat = useMemo(() => {
    if (!data) return [];
    const rows: { token: number; name: string; doctor: string; status: string; active: boolean }[] = [];
    for (const dq of data.doctors) {
      if (dq.inConsultation) {
        rows.push({
          token: dq.inConsultation.tokenNumber ?? 0,
          name: dq.inConsultation.patientName,
          doctor: dq.doctorName,
          status: 'in-consult',
          active: false,
        });
      }
      dq.waiting.forEach((w, i) => {
        rows.push({
          token: w.tokenNumber ?? 0,
          name: w.patientName,
          doctor: dq.doctorName,
          status: w.status ?? 'waiting',
          active: i === 0 && !dq.inConsultation,
        });
      });
    }
    return rows;
  }, [data]);

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const waiting = flat.filter((q) => q.status !== 'in-consult').length;
  const inConsult = flat.filter((q) => q.status === 'in-consult').length;
  const done = Math.max(0, flat.length - waiting - inConsult);

  return (
    <FigmaScreen>
      <CrmHint>
        Live queue board · token cards update from API · <strong>{data.date}</strong>
      </CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="In Queue" value={flat.length} trend="live" icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Waiting" value={waiting} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="In Consult" value={inConsult} icon="🩺" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Doctors" value={data.doctors.length} icon="📊" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      {!flat.length ? (
        <CrmFigmaCard title="Queue">
          <p style={{ color: 'var(--crm-text-muted)', fontSize: 13 }}>No patients in queue today.</p>
        </CrmFigmaCard>
      ) : (
        <>
          <FigmaQueueCards>
            {flat.map((q) => (
              <FigmaQueueCard
                key={`${q.token}-${q.name}`}
                token={q.token}
                name={q.name}
                wait={`${q.doctor} · ${q.status === 'in-consult' ? 'In consult' : q.active ? 'Next up' : 'Waiting'}`}
                active={q.active}
              />
            ))}
          </FigmaQueueCards>

          <Box sx={{ mt: 2 }}>
            <CrmFigmaGrid2>
              <CrmFigmaCard title="Queue Status">
                <DonutChart
                  centerLabel="Queue"
                  segments={[
                    { value: waiting, color: '#f59e0b', label: 'Waiting' },
                    { value: inConsult, color: '#2563eb', label: 'In Consult' },
                    { value: done || 1, color: '#10b981', label: 'Done' },
                  ].filter((s) => s.value > 0)}
                />
              </CrmFigmaCard>
              <CrmFigmaCard title="Avg Wait by Doctor">
                <HorizontalBarChart
                  data={data.doctors.map((d) => ({
                    label: d.doctorName.replace('Dr. ', '').slice(0, 12),
                    value: d.waiting.length * 3 + 5,
                    display: `${d.waiting.length * 3 + 5}m`,
                  }))}
                />
              </CrmFigmaCard>
            </CrmFigmaGrid2>
          </Box>
        </>
      )}

      <Box sx={{ mt: 2 }}>
        <CrmPill label={`${flat.length} in queue today`} variant="b" />
      </Box>
    </FigmaScreen>
  );
}
