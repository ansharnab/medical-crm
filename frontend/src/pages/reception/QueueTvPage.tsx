import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import { fetchQueue } from '@/api/queue';
import { colors } from '@/theme/tokens';
import { todayDateString } from '@/utils/clinical';

export function QueueTvPage() {
  const [clock, setClock] = useState(new Date());
  const date = todayDateString();

  const { data } = useQuery({
    queryKey: ['queue-tv', date],
    queryFn: () => fetchQueue({ date }),
    refetchInterval: 5000,
  });

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const serving = data?.doctors
    .flatMap((d) => (d.inConsultation ? [{ ...d.inConsultation, doctorName: d.doctorName }] : []))
    .find(Boolean);

  const waiting = data?.doctors.flatMap((d) =>
    d.waiting.map((w) => ({ ...w, doctorName: d.doctorName }))
  ) ?? [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0c1222', color: '#fff', p: 4, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 24, md: 36 } }}>
          Clinic Queue Display
        </Typography>
        <Typography sx={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>
          {clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Typography sx={{ fontSize: 18, color: colors.primary.light, mb: 2 }}>NOW SERVING</Typography>
        <Typography sx={{ fontSize: { xs: 80, md: 120 }, fontWeight: 800, lineHeight: 1 }}>
          #{serving?.tokenNumber ?? '—'}
        </Typography>
        <Typography sx={{ fontSize: 28, mt: 2, fontWeight: 600 }}>{serving?.patientName ?? '—'}</Typography>
        <Typography sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', mt: 1 }}>{serving?.doctorName ?? ''}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        {waiting.slice(0, 6).map((q) => (
          <Box key={q.appointmentId} sx={{ px: 3, py: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)', minWidth: 140, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>WAITING</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 700 }}>#{q.tokenNumber ?? '—'}</Typography>
            <Typography sx={{ fontSize: 14 }}>{q.patientName}</Typography>
          </Box>
        ))}
      </Box>

      <Typography component={RouterLink} to="/reception/queue" sx={{ mt: 4, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
        Exit TV mode
      </Typography>
    </Box>
  );
}
