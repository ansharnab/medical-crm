import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchPlatformUsers, updatePlatformUser } from '@/api/platform';
import {
  CrmAlert,
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListFilters,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmSearch,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';
import { formatRoleLabel } from '@/utils/roles';
import { getApiErrorMessage } from '@/utils/apiError';

const PAGE_SIZE = 15;

export function PlatformUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['platform-users', search, role, status, page],
    queryFn: () =>
      fetchPlatformUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status: s }: { id: string; status: 'active' | 'disabled' }) =>
      updatePlatformUser(id, { status: s }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] });
      setInfo('User status updated.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to update user.')),
  });

  const users = data?.data ?? [];
  const active = users.filter((u) => u.status === 'active').length;

  return (
    <>
      <CrmHint>All platform users across clinics — search, filter, disable accounts</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Total Users" value={data?.meta.total ?? 0} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="On Page" value={users.length} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Active (page)" value={active} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Role Filter" value={role || 'all'} icon="🎭" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>

      {info && <CrmAlert variant="success" onClose={() => setInfo('')}>{info}</CrmAlert>}
      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}

      <CrmListFilters>
        <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search email or name…" />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          <option value="client_admin">Clinic Admin</option>
          <option value="doctor">Doctor</option>
          <option value="receptionist">Receptionist</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </CrmListFilters>

      <CrmPanel title="Platform Users" badge={<CrmBadge label={`${data?.meta.total ?? 0} total`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Clinic</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.firstName} {u.lastName}</strong></td>
                    <td>{u.email}</td>
                    <td>{formatRoleLabel(u.role as never)}</td>
                    <td>{u.organization?.name || '—'}</td>
                    <td>
                      <CrmBadge label={u.status} variant={u.status === 'active' ? 'success' : 'danger'} />
                    </td>
                    <td>{formatDateTime(u.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            id: u.id,
                            status: u.status === 'active' ? 'disabled' : 'active',
                          })
                        }
                      >
                        {u.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && <CrmEmpty message="No users found." />}
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
