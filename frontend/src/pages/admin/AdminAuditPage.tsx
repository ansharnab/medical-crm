import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchAuditLogs } from '@/api/audit';
import {
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  FigmaScreen,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 15;

export function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page],
    queryFn: () => fetchAuditLogs({ page, limit: PAGE_SIZE }),
  });

  const logs = data?.data ?? [];

  return (
    <FigmaScreen>
      <CrmHint>Clinic audit trail — who did what and when</CrmHint>
      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <CrmKpi label="Events" value={data?.meta.total ?? 0} icon="📋" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Page" value={page} icon="📄" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>
      <CrmPanel title="Audit Log">
        {isLoading ? <CrmListLoading /> : logs.length === 0 ? <CrmEmpty message="No audit events yet." /> : (
          <table className="crm-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.user?.name || log.user?.email || '—'}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType ? `${log.entityType}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}` : '—'}</td>
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
