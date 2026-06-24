import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchPayments } from '@/api/payments';
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
import { todayDateString } from '@/utils/clinical';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 10;

export function AdminPaymentsPage() {
  const [date, setDate] = useState(todayDateString());
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', date, page],
    queryFn: () => fetchPayments({ date, page, limit: PAGE_SIZE }),
  });

  const payments = data?.data ?? [];
  const total = payments.reduce((a, p) => a + p.amountPaid, 0);

  return (
    <FigmaScreen>
      <CrmHint>Daily payment reconciliation — cash · UPI · card</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Collected" value={`₹${total.toLocaleString('en-IN')}`} icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Payments" value={data?.meta.total ?? 0} icon="🧾" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Paid" value={payments.filter((p) => p.status === 'paid').length} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Partial" value={payments.filter((p) => p.status === 'partial').length} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
      </div>
      <CrmPanel title="Payments">
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} className="crm-input" style={{ width: 160 }} />
        </div>
        {isLoading ? <CrmListLoading /> : payments.length === 0 ? <CrmEmpty message="No payments for this date." /> : (
          <table className="crm-table">
            <thead><tr><th>Patient</th><th>Amount</th><th>Mode</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : '—'}</td>
                  <td>₹{p.amountPaid}</td>
                  <td>{(p.paymentMode || '—').toUpperCase()}</td>
                  <td><CrmBadge label={p.status} variant={p.status === 'paid' ? 'success' : 'warning'} /></td>
                  <td>{formatDateTime(p.paidAt || p.createdAt)}</td>
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
