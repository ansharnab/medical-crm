import { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAppointments } from '@/api/appointments';
import { createPayment, fetchPayments } from '@/api/payments';
import {
  CrmFigmaCard,
  CrmFigmaGrid2,
  CrmHint,
  CrmKpi,
  CrmPill,
  FigmaScreen,
  FigmaSuccessBox,
} from '@/components/app';
import { BarChartColumns } from '@/components/ui/charts';
import { todayDateString } from '@/utils/clinical';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import type { Appointment, PaymentMode } from '@/types/clinical';

export function PaymentsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [date] = useState(todayDateString());
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paid, setPaid] = useState(false);
  const [receiptId, setReceiptId] = useState('');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', date],
    queryFn: () => fetchPayments({ date, page: 1, limit: 50 }),
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', date, 'unpaid'],
    queryFn: () => fetchAppointments({ date, page: 1, limit: 100 }),
  });

  const unpaid = (appointments?.data || []).filter((a) => !a.payment && a.status !== 'cancelled');
  const target = selectedAppt || unpaid[0] || null;

  const fee = target?.feeAmount ?? 500;
  const payAmount = amountPaid === '' ? fee : amountPaid;

  const collectMutation = useMutation({
    mutationFn: () =>
      createPayment({
        appointmentId: target!.id,
        amount: fee,
        amountPaid: payAmount,
        paymentMode,
        status: payAmount >= fee ? 'paid' : payAmount > 0 ? 'partial' : 'pending',
      }),
    onSuccess: (p) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setPaid(true);
      setReceiptId(p.id.slice(0, 8).toUpperCase());
      showToast('Payment recorded.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to collect payment.'), 'error'),
  });

  const collectionBars = useMemo(() => {
    const list = payments?.data || [];
    const cash = list.filter((p) => p.paymentMode === 'cash').reduce((a, p) => a + p.amountPaid, 0);
    const upi = list.filter((p) => p.paymentMode === 'upi').reduce((a, p) => a + p.amountPaid, 0);
    const card = list.filter((p) => p.paymentMode === 'card').reduce((a, p) => a + p.amountPaid, 0);
    return [
      { label: 'Cash', value: Math.max(cash, paymentMode === 'cash' && paid ? 10 : 8), color: '#10b981', color2: '#34d399' },
      { label: 'UPI', value: Math.max(upi, paymentMode === 'upi' && paid ? 16 : 14), color: '#2563eb', color2: '#06b6d4' },
      { label: 'Card', value: Math.max(card, 5), color: '#8b5cf6', color2: '#ec4899' },
    ];
  }, [payments, paymentMode, paid]);

  const patientName = target?.patient ? `${target.patient.firstName} ${target.patient.lastName ?? ''}`.trim() : 'Patient';
  const initials = patientName.slice(0, 2).toUpperCase();

  const totalCollected = (payments?.data || []).reduce((a, p) => a + p.amountPaid, 0);

  return (
    <FigmaScreen>
      <CrmHint>Collect fees · Cash · UPI · Card · instant receipt</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Unpaid" value={unpaid.length} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Collected" value={`₹${(totalCollected / 1000).toFixed(1)}k`} icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Payments" value={payments?.data.length ?? 0} icon="🧾" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Mode" value={paymentMode.toUpperCase()} icon="💳" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CrmFigmaGrid2>
          <CrmFigmaCard title="Collect Fee" badge={paid ? <CrmPill label="PAID" variant="g" /> : undefined}>
            {paid ? (
              <FigmaSuccessBox title="Payment received!" detail={`₹${payAmount} via ${paymentMode.toUpperCase()} · Receipt #RCP-${receiptId}`} />
            ) : target ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#2563eb,#06b6d4)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontWeight: 800,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <strong>{patientName}</strong>
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--crm-text-muted)' }}>
                      {target.doctor ? `Dr. ${target.doctor.lastName || target.doctor.firstName}` : 'Doctor'} · Token #{target.tokenNumber ?? '—'}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto', fontFamily: 'var(--crm-font-display)', fontSize: 28, fontWeight: 800, color: 'var(--crm-primary)' }}>
                    ₹{fee}
                  </div>
                </div>
                {unpaid.length > 1 && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="crm-field-label">Select patient</div>
                    <select
                      className="crm-field"
                      value={target.id}
                      onChange={(e) => {
                        const appt = unpaid.find((a) => a.id === e.target.value);
                        if (appt) {
                          setSelectedAppt(appt);
                          setPaid(false);
                        }
                      }}
                    >
                      {unpaid.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.patient?.firstName} {a.patient?.lastName} — ₹{a.feeAmount}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <div className="crm-field-label">Amount to collect (partial allowed)</div>
                  <input
                    className="crm-field"
                    type="number"
                    min={0}
                    max={fee}
                    placeholder={`Full: ₹${fee}`}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {(['cash', 'upi', 'card'] as PaymentMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`crm-btn crm-btn-ghost crm-pay-btn${paymentMode === m ? ' active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center', textTransform: 'uppercase' }}
                      onClick={() => setPaymentMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button type="button" className="crm-btn crm-btn-primary" disabled={collectMutation.isPending} onClick={() => collectMutation.mutate()}>
                  Mark Paid →
                </button>
                <button type="button" className="crm-btn crm-btn-ghost" style={{ marginLeft: 8 }}>
                  Invoice PDF <span className="crm-pill crm-pill-b" style={{ marginLeft: 6 }}>NEW</span>
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--crm-text-muted)', fontSize: 13 }}>No pending payments for today.</p>
            )}
          </CrmFigmaCard>

          <CrmFigmaCard title="Today's Collection">
            <BarChartColumns data={collectionBars} />
          </CrmFigmaCard>
        </CrmFigmaGrid2>
      )}

      {(payments?.data?.length ?? 0) > 0 && (
        <Box sx={{ mt: 2 }}>
          <CrmFigmaCard title="Payment History">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments!.data.map((p) => (
                  <tr key={p.id}>
                    <td>{p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : '—'}</td>
                    <td>₹{p.amountPaid}</td>
                    <td>{p.paymentMode}</td>
                    <td>
                      <CrmPill label={p.status} variant={p.status === 'paid' ? 'g' : 'a'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CrmFigmaCard>
        </Box>
      )}
    </FigmaScreen>
  );
}
