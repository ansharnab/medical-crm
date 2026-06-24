import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAppointment } from '@/api/appointments';
import {
  completeConsultation,
  startConsultation,
  updateConsultation,
} from '@/api/consultations';
import { createFollowup } from '@/api/followups';
import { PatientSnapshotPanel } from '@/components/clinical/PatientSnapshotPanel';
import { PageHeader } from '@/components/ui';
import { FigmaCard, FigmaGauge, FigmaGaugeRow, FigmaScreen } from '@/components/figma';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { AppointmentStatusBadge } from '@/utils/clinical';
import { formatDateTime } from '@/utils/formatDate';
import type { Consultation } from '@/types/clinical';

export function ConsultationPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [followupOpen, setFollowupOpen] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  const [started, setStarted] = useState(false);
  const [vitals, setVitals] = useState({ bpSystolic: 120, bpDiastolic: 80, spo2: 98, weightKg: 72 });

  const { data: appointment, isLoading: apptLoading } = useQuery({
    queryKey: ['appointments', appointmentId],
    queryFn: () => fetchAppointment(appointmentId!),
    enabled: Boolean(appointmentId),
  });

  const startMutation = useMutation({
    mutationFn: () => startConsultation(appointmentId!),
    onSuccess: (c) => {
      setConsultation(c);
      setSymptoms(c.symptoms || '');
      setDiagnosis(c.diagnosis || '');
      setNotes(c.notes || '');
      setRecommendations(c.recommendations || '');
      setVitals({
        bpSystolic: c.bpSystolic ?? 120,
        bpDiastolic: c.bpDiastolic ?? 80,
        spo2: c.spo2 ?? 98,
        weightKg: c.weightKg ?? 72,
      });
      showToast('Consultation started.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to start consultation.'), 'error'),
  });

  useEffect(() => {
    if (!appointment || consultation || started || startMutation.isPending || !appointmentId) return;
    if (
      appointment.status === 'in_consultation' ||
      appointment.status === 'waiting' ||
      appointment.status === 'confirmed' ||
      appointment.status === 'scheduled'
    ) {
      setStarted(true);
      startMutation.mutate();
    }
  }, [appointment, consultation, started, appointmentId, startMutation.isPending]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateConsultation(consultation!.id, {
        symptoms,
        diagnosis,
        notes,
        recommendations,
        bpSystolic: vitals.bpSystolic,
        bpDiastolic: vitals.bpDiastolic,
        spo2: vitals.spo2,
        weightKg: vitals.weightKg,
      }),
    onSuccess: (c) => {
      setConsultation(c);
      showToast('Consultation saved.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to save consultation.'), 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeConsultation(consultation!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'doctor'] });
      showToast('Consultation completed.');
      navigate('/doctor/queue');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to complete consultation.'), 'error'),
  });

  const followupMutation = useMutation({
    mutationFn: () =>
      createFollowup({
        consultationId: consultation!.id,
        dueDate: followupDate,
        notes: followupNotes || undefined,
      }),
    onSuccess: () => {
      setFollowupOpen(false);
      setFollowupDate('');
      setFollowupNotes('');
      showToast('Follow-up scheduled.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to schedule follow-up.'), 'error'),
  });

  if (apptLoading || !appointment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (appointment.status === 'completed') {
    return (
      <Box>
        <Typography>This consultation is already completed.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/doctor/queue')}>
          Back to Queue
        </Button>
      </Box>
    );
  }

  return (
    <FigmaScreen>
      <PageHeader
        hero={{ title: 'Consultation', subtitle: 'Vitals · notes · prescription · follow-up' }}
        title={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
        subtitle={formatDateTime(appointment.scheduledAt)}
        actions={
          <>
            <Button
              variant="outlined"
              onClick={() => navigate(`/doctor/consultations/${appointmentId}/prescription`)}
            >
              E-Prescription
            </Button>
            <Button variant="outlined" onClick={() => setFollowupOpen(true)} disabled={!consultation}>
              Schedule Follow-up
            </Button>
            <Button
              variant="contained"
              onClick={() => completeMutation.mutate()}
              disabled={!consultation || completeMutation.isPending}
            >
              Complete Consultation
            </Button>
          </>
        }
      />

      <FigmaCard
        title={`Snapshot — ${appointment.patient?.firstName} ${appointment.patient?.lastName}`}
      >
        <FigmaGaugeRow>
          <FigmaGauge value={12} max={20} label="Visits" color="#2563eb" />
          <FigmaGauge value={vitals.bpSystolic} max={180} label="BP Sys" color="#f59e0b" />
          <FigmaGauge value={vitals.spo2} max={100} label="SpO2" color="#10b981" />
          <FigmaGauge value={vitals.weightKg} max={100} label="Kg" color="#8b5cf6" />
        </FigmaGaugeRow>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 11, fontWeight: 600 }}>
            BP Sys{' '}
            <input className="crm-vitals-input" type="number" value={vitals.bpSystolic} onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 600 }}>
            BP Dia{' '}
            <input className="crm-vitals-input" type="number" value={vitals.bpDiastolic} onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 600 }}>
            SpO2{' '}
            <input className="crm-vitals-input" type="number" value={vitals.spo2} onChange={(e) => setVitals({ ...vitals, spo2: Number(e.target.value) })} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 600 }}>
            Kg{' '}
            <input className="crm-vitals-input" type="number" value={vitals.weightKg} onChange={(e) => setVitals({ ...vitals, weightKg: Number(e.target.value) })} />
          </label>
        </Box>
      </FigmaCard>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, mt: 2, alignItems: 'center' }}>
        <AppointmentStatusBadge status={appointment.status} />
        {appointment.tokenNumber != null && (
          <Typography variant="body2" color="text.secondary">
            Token #{appointment.tokenNumber}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' }, gap: 3 }}>
        <Card>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!consultation && startMutation.isPending && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}
            <TextField
              label="Symptoms"
              multiline
              minRows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={!consultation}
            />
            <TextField
              label="Diagnosis"
              multiline
              minRows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={!consultation}
            />
            <TextField
              label="Clinical Notes"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!consultation}
            />
            <TextField
              label="Recommendations"
              multiline
              minRows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              disabled={!consultation}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => saveMutation.mutate()}
                disabled={!consultation || saveMutation.isPending}
              >
                Save Draft
              </Button>
            </Box>
          </CardContent>
        </Card>

        {appointment.patientId && <PatientSnapshotPanel patientId={appointment.patientId} />}
      </Box>

      <Dialog open={followupOpen} onClose={() => setFollowupOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Follow-up</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Due Date"
            type="date"
            value={followupDate}
            onChange={(e) => setFollowupDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Notes"
            multiline
            minRows={2}
            value={followupNotes}
            onChange={(e) => setFollowupNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFollowupOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => followupMutation.mutate()}
            disabled={followupMutation.isPending || !followupDate}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </FigmaScreen>
  );
}
