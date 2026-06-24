import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { fetchFollowups, updateFollowup } from '@/api/followups';
import {
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmTabs,
} from '@/components/app';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { FollowupStatusBadge } from '@/utils/clinical';

const PAGE_SIZE = 10;

export function ReceptionFollowupsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);

  const filter = tab === 0 ? 'today' : tab === 1 ? 'pending' : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['followups', filter, page],
    queryFn: () =>
      fetchFollowups({
        filter: filter as 'today' | 'pending' | undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => updateFollowup(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      showToast('Follow-up marked complete.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to update follow-up.'), 'error'),
  });

  const items = data?.data ?? [];
  const pendingCount = items.filter((f) => f.status === 'pending').length;

  return (
    <>
      <CrmHint>Track and complete patient follow-ups — due today, pending & all</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Total" value={data?.meta.total ?? 0} icon="📋" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="On Page" value={items.length} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Pending (page)" value={pendingCount} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Filter" value={tab === 0 ? 'today' : tab === 1 ? 'pending' : 'all'} icon="🔍" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmTabs tabs={['Due Today', 'Pending', 'All']} active={tab} onChange={(v) => { setTab(v); setPage(1); }} />

      <CrmPanel title="Follow-ups" badge={<CrmBadge label={`${data?.meta.total ?? 0} total`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.patient ? (
                        <RouterLink to={`/reception/patients/${f.patientId}`} style={{ color: 'var(--app-primary)', fontWeight: 600, textDecoration: 'none' }}>
                          {f.patient.name}
                        </RouterLink>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{f.doctor?.name || '—'}</td>
                    <td>{f.dueDate}</td>
                    <td>
                      <FollowupStatusBadge status={f.status} />
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.notes || '—'}</td>
                    <td>
                      {f.status !== 'completed' && (
                        <button type="button" className="crm-btn crm-btn-primary" style={{ padding: '4px 10px', fontSize: 11 }} disabled={completeMutation.isPending} onClick={() => completeMutation.mutate(f.id)}>
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && <CrmEmpty message="No follow-ups found." />}
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
