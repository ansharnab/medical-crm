import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/api/audit';
import {
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListFilters,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 20;

export function SuperAdminAuditPage() {
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', action, from, to, page],
    queryFn: () =>
      fetchAuditLogs({
        action: action || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const logs = data?.data ?? [];

  return (
    <>
      <CrmHint>Compliance trail — who did what, when, on which clinic</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Total Events" value={data?.meta.total ?? 0} icon="📋" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="This Page" value={logs.length} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Filter" value={action ? 'on' : 'all'} icon="🔍" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmListFilters>
        <input placeholder="Filter action…" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} />
        <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
        <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
      </CrmListFilters>

      <CrmPanel title="Audit Log" badge={<CrmBadge label={`${data?.meta.total ?? 0} events`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Clinic</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                    <td>{log.user?.email || '—'}</td>
                    <td>{log.organization?.name || 'Platform'}</td>
                    <td><code style={{ fontSize: 11 }}>{log.action}</code></td>
                    <td style={{ fontSize: 11, color: 'var(--app-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.metadata ? JSON.stringify(log.metadata) : log.entityType || '—'}
                    </td>
                  </tr>
                ))}
                {!logs.length && <CrmEmpty message="No audit events yet." />}
              </tbody>
            </table>
            {data?.meta && (
              <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </CrmPanel>
    </>
  );
}
