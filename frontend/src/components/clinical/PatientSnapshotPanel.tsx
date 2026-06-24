import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPatientSnapshot } from '@/api/patients';
import { formatDateTime } from '@/utils/formatDate';

interface PatientSnapshotPanelProps {
  patientId: string;
}

export function PatientSnapshotPanel({ patientId }: PatientSnapshotPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', patientId, 'snapshot'],
    queryFn: () => fetchPatientSnapshot(patientId),
    enabled: Boolean(patientId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent>
          <Typography color="text.secondary">Unable to load patient snapshot.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h3">Patient Snapshot</Typography>
          {data.pendingFollowupsCount > 0 && (
            <Chip
              label={`${data.pendingFollowupsCount} pending follow-up${data.pendingFollowupsCount > 1 ? 's' : ''}`}
              color="warning"
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Total Visits
            </Typography>
            <Typography fontWeight={700}>{data.totalVisits}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Last Visit
            </Typography>
            <Typography fontWeight={600}>{formatDateTime(data.lastVisitDate)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Last Doctor
            </Typography>
            <Typography>{data.lastDoctorName || '—'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Last Diagnosis
            </Typography>
            <Typography>{data.lastDiagnosis || '—'}</Typography>
          </Box>
        </Box>

        {data.recentConsultations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recent Consultations
            </Typography>
            <List dense disablePadding>
              {data.recentConsultations.map((c) => (
                <ListItem key={c.id} disableGutters sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                  <ListItemText
                    primary={c.diagnosis || 'Consultation'}
                    secondary={`${c.doctorName || 'Doctor'} · ${formatDateTime(c.completedAt)}`}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                  {c.notes && (
                    <Typography variant="caption" color="text.secondary">
                      {c.notes}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}
