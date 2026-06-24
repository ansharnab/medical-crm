import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { fetchPatient } from '@/api/patients';
import { PatientSnapshotPanel } from '@/components/clinical/PatientSnapshotPanel';
import { PageHeader } from '@/components/ui';
import { formatDateTime } from '@/utils/formatDate';

interface PatientDetailPageProps {
  backPath: string;
}

export function PatientDetailPage({ backPath }: PatientDetailPageProps) {
  const { id } = useParams();
  const patientId = id || '';

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: Boolean(patientId),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !patient) {
    return (
      <Box>
        <Typography color="error">Patient not found.</Typography>
        <Button component={RouterLink} to={backPath} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        subtitle={patient.phone}
        actions={
          <Button component={RouterLink} to={backPath} variant="outlined">
            Back to Patients
          </Button>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Contact
          </Typography>
          <Typography>{patient.email || 'No email'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
            Date of Birth
          </Typography>
          <Typography>{patient.dateOfBirth || '—'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
            Gender
          </Typography>
          <Typography sx={{ textTransform: 'capitalize' }}>{patient.gender || '—'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
            Address
          </Typography>
          <Typography>{patient.address || '—'}</Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
            Registered
          </Typography>
          <Typography>{formatDateTime(patient.createdAt)}</Typography>
          {patient.notes && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                Notes
              </Typography>
              <Typography>{patient.notes}</Typography>
            </>
          )}
        </Box>
        <PatientSnapshotPanel patientId={patient.id} />
      </Box>
    </Box>
  );
}
