import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createLabOrder, fetchLabOrders, saveLabResult } from '@/api/modules';
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

const PAGE_SIZE = 10;

export function LabsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [form, setForm] = useState({ patientId: '', testName: 'CBC', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['lab-orders', page],
    queryFn: () => fetchLabOrders({ page, limit: PAGE_SIZE }),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-labs'],
    queryFn: () => fetchPatients({ page: 1, limit: 100 }),
    enabled: showOrder,
  });

  const createMutation = useMutation({
    mutationFn: () => createLabOrder(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      setShowOrder(false);
      showToast('Lab order created.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Failed to create order.'), 'error'),
  });

  const resultMutation = useMutation({
    mutationFn: (id: string) => saveLabResult(id, { resultText: 'Results within normal limits.' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      showToast('Result saved.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Failed to save result.'), 'error'),
  });

  const orders = data?.data ?? [];

  return (
    <FigmaScreen>
      <CrmHint>Lab orders — order tests · record results</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Orders" value={data?.meta.total ?? 0} icon="🔬" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Pending" value={orders.filter((o) => o.status !== 'completed').length} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Done" value={orders.filter((o) => o.status === 'completed').length} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
      </div>
      <CrmPanel title="Lab Orders">
        <div style={{ marginBottom: 12 }}>
          <button type="button" className="crm-btn crm-btn-primary" onClick={() => setShowOrder(!showOrder)}>+ Order</button>
        </div>
        {showOrder && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <select className="crm-input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Patient</option>
              {(patients?.data || []).map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
            <input className="crm-input" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
            <button type="button" className="crm-btn crm-btn-primary" disabled={!form.patientId || createMutation.isPending} onClick={() => createMutation.mutate()}>Create</button>
          </div>
        )}
        {isLoading ? <CrmListLoading /> : orders.length === 0 ? <CrmEmpty message="No lab orders." /> : (
          <table className="crm-table">
            <thead><tr><th>Patient</th><th>Test</th><th>Status</th><th>Result</th><th /></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.patient ? `${o.patient.firstName} ${o.patient.lastName}` : '—'}</td>
                  <td>{o.testName}</td>
                  <td><CrmBadge label={o.status} variant={o.status === 'completed' ? 'success' : 'info'} /></td>
                  <td style={{ maxWidth: 200 }}>{o.result?.resultText || '—'}</td>
                  <td>
                    {o.status !== 'completed' && (
                      <button type="button" className="crm-btn crm-btn-secondary" onClick={() => resultMutation.mutate(o.id)}>Add Result</button>
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
