import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { cancelAppointment, createAppointment, fetchAppointmentSlots, fetchAppointments } from '@/api/appointments';
import { sendMessage } from '@/api/modules';
import { fetchPatients } from '@/api/patients';
import { fetchStaffUsers } from '@/api/users';
import {
  CrmBadge,
  CrmEmpty,
  CrmFigmaCard,
  CrmFigmaGrid2,
  CrmHint,
  CrmKpi,
  CrmListActions,
  CrmListFilters,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  FigmaScreen,
  FigmaSlotGrid,
  FigmaSuccessBox,
} from '@/components/app';
import { BarChartColumns } from '@/components/ui/charts';
import { todayDateString } from '@/utils/clinical';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 10;

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [date, setDate] = useState(todayDateString());
  const [page, setPage] = useState(1);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookForm, setBookForm] = useState({ patientId: '', doctorId: '', scheduledAt: '', notes: '' });
  const [selectedSlot, setSelectedSlot] = useState('10:00');
  const [smsOn, setSmsOn] = useState(true);
  const [booked, setBooked] = useState(false);

  const { data: slotsData } = useQuery({
    queryKey: ['slots', date, bookForm.doctorId],
    queryFn: () => fetchAppointmentSlots({ doctorId: bookForm.doctorId, date }),
    enabled: Boolean(bookForm.doctorId) && bookOpen,
  });

  const SLOTS = (slotsData?.slots || []).map((s) => s.time);
  const FULL_SLOTS = (slotsData?.slots || []).filter((s) => !s.available).map((s) => s.time);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', date, page],
    queryFn: () => fetchAppointments({ date, page, limit: PAGE_SIZE }),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => fetchPatients({ page: 1, limit: 100 }),
  });

  const { data: doctors } = useQuery({
    queryKey: ['staff-users', 'doctors'],
    queryFn: () => fetchStaffUsers({ role: 'doctor', status: 'active', page: 1, limit: 100 }),
  });

  const bookMutation = useMutation({
    mutationFn: async (scheduledAt: string) => {
      const appt = await createAppointment({
        patientId: bookForm.patientId,
        doctorId: bookForm.doctorId,
        scheduledAt,
        notes: bookForm.notes || undefined,
      });
      if (smsOn) {
        const patient = patients?.data?.find((p) => p.id === bookForm.patientId);
        if (patient?.phone) {
          await sendMessage({
            patientId: patient.id,
            channel: 'sms',
            recipient: patient.phone,
            body: `Appointment confirmed for ${selectedSlot} on ${date}.`,
          }).catch(() => undefined);
        }
      }
      return appt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBooked(true);
      showToast('Appointment booked.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to book appointment.'), 'error'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      showToast('Appointment cancelled.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to cancel.'), 'error'),
  });

  const appts = data?.data ?? [];
  const completed = appts.filter((a) => a.status === 'completed').length;
  const cancelled = appts.filter((a) => a.status === 'cancelled').length;

  const statusVariant = (s: string): 'success' | 'warning' | 'info' | 'danger' => {
    if (s === 'completed') return 'success';
    if (s === 'waiting' || s === 'in_consultation') return 'warning';
    if (s === 'cancelled' || s === 'no_show') return 'danger';
    return 'info';
  };

  return (
    <FigmaScreen>
      <CrmHint>Book · manage · cancel daily appointments</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Total Today" value={data?.meta.total ?? appts.length} icon="📅" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="On Page" value={appts.length} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Completed" value={completed} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Cancelled" value={cancelled} icon="✕" iconColor="#ef4444" sparkColor="#ef4444" />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-primary" onClick={() => setBookOpen(true)}>
          + Book Appointment
        </button>
      </CrmListActions>

      <CrmListFilters>
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
      </CrmListFilters>

      <CrmPanel title={`Schedule — ${date}`} badge={<CrmBadge label={`${data?.meta.total ?? 0} appts`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.tokenNumber ?? '—'}</td>
                    <td><strong>{a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '—'}</strong></td>
                    <td>{a.doctor ? `Dr. ${a.doctor.lastName}` : '—'}</td>
                    <td>{formatDateTime(a.scheduledAt)}</td>
                    <td><CrmBadge label={a.status.replace('_', ' ')} variant={statusVariant(a.status)} /></td>
                    <td>
                      {a.status !== 'cancelled' && a.status !== 'completed' && (
                        <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, color: '#ef4444' }} onClick={() => cancelMutation.mutate(a.id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!appts.length && <CrmEmpty message="No appointments for this date." />}
              </tbody>
            </table>
            {data?.meta && (
              <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </CrmPanel>

      <Dialog open={bookOpen} onClose={() => { setBookOpen(false); setBooked(false); }} maxWidth="md" fullWidth>
        <DialogTitle>Book Appointment</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <CrmFigmaGrid2>
            <div>
              <TextField select label="Patient" fullWidth size="small" value={bookForm.patientId} onChange={(e) => setBookForm({ ...bookForm, patientId: e.target.value })} sx={{ mb: 2 }} required>
                {(patients?.data || []).map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Doctor" fullWidth size="small" value={bookForm.doctorId} onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })} sx={{ mb: 2 }} required>
                {(doctors?.data || []).map((d) => (
                  <MenuItem key={d.id} value={d.id}>Dr. {d.lastName}</MenuItem>
                ))}
              </TextField>
              <div className="crm-field-label">Pick a slot</div>
              <FigmaSlotGrid slots={SLOTS} fullSlots={FULL_SLOTS} selected={selectedSlot} onSelect={setSelectedSlot} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0', fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={smsOn} onChange={(e) => setSmsOn(e.target.checked)} /> Send SMS reminder
              </label>
              {booked ? (
                <FigmaSuccessBox title="Appointment confirmed!" detail={`Slot ${selectedSlot} · SMS ${smsOn ? 'sent' : 'skipped'}`} />
              ) : (
                <button
                  type="button"
                  className="crm-btn crm-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={bookMutation.isPending || !bookForm.patientId || !bookForm.doctorId}
                  onClick={() => {
                    const [h, m] = selectedSlot.split(':');
                    const d = new Date(`${date}T${h.padStart(2, '0')}:${m || '00'}:00`);
                    bookMutation.mutate(d.toISOString());
                  }}
                >
                  Confirm Booking →
                </button>
              )}
            </div>
            <CrmFigmaCard title="Dr. Availability">
              <BarChartColumns data={SLOTS.map((s) => ({ label: s.split(':')[0], value: FULL_SLOTS.includes(s) ? 10 : s === '11:00' ? 6 : 3, color: FULL_SLOTS.includes(s) ? '#ef4444' : '#10b981', color2: FULL_SLOTS.includes(s) ? '#f87171' : '#34d399' }))} />
            </CrmFigmaCard>
          </CrmFigmaGrid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBookOpen(false); setBooked(false); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </FigmaScreen>
  );
}
