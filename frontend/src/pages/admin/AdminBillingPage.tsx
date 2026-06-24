import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createInvoice, fetchDailyClosing, fetchInvoices, payInvoice } from '@/api/modules';
import { fetchPatients } from '@/api/patients';
import {
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  FigmaScreen,
} from '@/components/app';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { todayDateString } from '@/utils/clinical';

const PAGE_SIZE = 10;

export function AdminBillingPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [date] = useState(todayDateString());
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '500', gstRate: '0' });

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page],
    queryFn: () => fetchInvoices({ page, limit: PAGE_SIZE }),
  });

  const { data: closing } = useQuery({
    queryKey: ['daily-closing', date],
    queryFn: () => fetchDailyClosing(date),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-billing'],
    queryFn: () => fetchPatients({ page: 1, limit: 100 }),
    enabled: showCreate,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createInvoice({
        patientId: form.patientId,
        amount: Number(form.amount),
        gstRate: Number(form.gstRate),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowCreate(false);
      showToast('Invoice created.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Failed to create invoice.'), 'error'),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => payInvoice(id, { amount: 100, paymentMode: 'cash' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      showToast('Payment recorded.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Payment failed.'), 'error'),
  });

  const invoices = data?.data ?? [];

  return (
    <FigmaScreen>
      <CrmHint>GST invoices · partial payments · daily closing</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Billed Today" value={`₹${(closing?.totalBilled ?? 0).toLocaleString('en-IN')}`} icon="🧾" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Collected" value={`₹${(closing?.totalPaid ?? 0).toLocaleString('en-IN')}`} icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Pending" value={closing?.pendingCount ?? 0} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Paid" value={closing?.paidCount ?? 0} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
      </div>
      <CrmPanel title="Invoices">
        <div style={{ marginBottom: 12 }}>
          <button type="button" className="crm-btn crm-btn-primary" onClick={() => setShowCreate(!showCreate)}>+ Invoice</button>
        </div>
        {showCreate && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <select className="crm-input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient</option>
              {(patients?.data || []).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
            <input className="crm-input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" style={{ width: 100 }} />
            <button type="button" className="crm-btn crm-btn-primary" disabled={!form.patientId || createMutation.isPending} onClick={() => createMutation.mutate()}>Create</button>
          </div>
        )}
        {isLoading ? <CrmListLoading /> : invoices.length === 0 ? <CrmEmpty message="No invoices yet." /> : (
          <table className="crm-table">
            <thead><tr><th>Patient</th><th>Total</th><th>Paid</th><th>Status</th><th /></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : '—'}</td>
                  <td>₹{inv.total}</td>
                  <td>₹{inv.paidAmount}</td>
                  <td><CrmBadge label={inv.status} variant={inv.status === 'paid' ? 'success' : 'warning'} /></td>
                  <td>
                    {inv.status !== 'paid' && (
                      <button type="button" className="crm-btn crm-btn-secondary" onClick={() => payMutation.mutate(inv.id)}>Collect</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data?.meta && <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
      </CrmPanel>
    </FigmaScreen>
  );
}
