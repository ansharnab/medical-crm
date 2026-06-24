import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPharmacyItem, fetchPharmacyItems, updatePharmacyItem } from '@/api/modules';
import {
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmSearch,
  FigmaScreen,
} from '@/components/app';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';

const PAGE_SIZE = 10;

export function AdminPharmacyPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pharmacy', search, page],
    queryFn: () => fetchPharmacyItems({ search: search || undefined, page, limit: PAGE_SIZE }),
  });

  const createMutation = useMutation({
    mutationFn: () => createPharmacyItem({ name, quantity: 50, reorderLevel: 10, unit: 'units', price: 100 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      setName('');
      showToast('Item added.');
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Failed to add item.'), 'error'),
  });

  const restockMutation = useMutation({
    mutationFn: (id: string) => updatePharmacyItem(id, { quantity: 100 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy'] });
      showToast('Stock updated.');
    },
  });

  const items = data?.data ?? [];
  const lowStock = items.filter((i) => i.lowStock).length;

  return (
    <FigmaScreen>
      <CrmHint>Pharmacy inventory — stock levels · low-stock alerts</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Items" value={data?.meta.total ?? 0} icon="💊" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Low Stock" value={lowStock} icon="⚠️" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Page" value={page} icon="📄" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>
      <CrmPanel title="Inventory">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search medicines…" />
          <input className="crm-input" placeholder="New item name" value={name} onChange={(e) => setName(e.target.value)} />
          <button type="button" className="crm-btn crm-btn-primary" disabled={!name || createMutation.isPending} onClick={() => createMutation.mutate()}>Add</button>
        </div>
        {isLoading ? <CrmListLoading /> : items.length === 0 ? <CrmEmpty message="No pharmacy items." /> : (
          <table className="crm-table">
            <thead><tr><th>Name</th><th>SKU</th><th>Qty</th><th>Price</th><th>Status</th><th /></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku || '—'}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.price != null ? `₹${item.price}` : '—'}</td>
                  <td>{item.lowStock ? <CrmBadge label="LOW" variant="warning" /> : <CrmBadge label="OK" variant="success" />}</td>
                  <td><button type="button" className="crm-btn crm-btn-secondary" onClick={() => restockMutation.mutate(item.id)}>Restock</button></td>
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
