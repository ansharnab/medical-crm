import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteOrganization, fetchOrganizations } from '@/api/organizations';
import { fetchPlatformAnalytics } from '@/api/analytics';
import {
  CrmAlert,
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListActions,
  CrmListFilters,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmSearch,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/apiError';
import type { Organization, OrganizationStatus } from '@/types/organization';

const PAGE_SIZE = 10;

function statusVariant(s: OrganizationStatus): 'success' | 'warning' | 'danger' {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warning';
  return 'danger';
}

export function ClinicsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrganizationStatus | ''>(
    () => (searchParams.get('status') as OrganizationStatus) || ''
  );
  const [page, setPage] = useState(1);
  const [clinicToDelete, setClinicToDelete] = useState<Organization | null>(null);
  const [error, setError] = useState('');

  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: fetchPlatformAnalytics,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['organizations', search, status, page],
    queryFn: () =>
      fetchOrganizations({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-analytics'] });
      setClinicToDelete(null);
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to delete clinic.')),
  });

  return (
    <>
      <CrmHint>Create · manage · suspend clinic tenants on the platform</CrmHint>

      {analytics && (
        <div className="crm-kpis-8">
          <CrmKpi label="Total Clinics" value={analytics.clinics.total} icon="🏥" iconColor="#2563eb" sparkColor="#2563eb" />
          <CrmKpi label="Active" value={analytics.clinics.active} trend="↑ live" icon="✓" iconColor="#10b981" sparkColor="#10b981" />
          <CrmKpi label="Pending" value={analytics.clinics.pending} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
          <CrmKpi label="Suspended" value={analytics.clinics.suspended} icon="⛔" iconColor="#ef4444" sparkColor="#ef4444" />
          <CrmKpi label="Users" value={analytics.users.total} icon="👥" iconColor="#06b6d4" sparkColor="#06b6d4" />
          <CrmKpi label="Appts Today" value={analytics.appointments.today} icon="📅" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
          <CrmKpi label="All Appts" value={analytics.appointments.total} icon="📊" iconColor="#2563eb" sparkColor="#2563eb" />
          <CrmKpi label="Filtered" value={data?.meta.total ?? 0} trend={status || 'all'} icon="🔍" iconColor="#10b981" sparkColor="#10b981" />
        </div>
      )}

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-primary" onClick={() => navigate('/super-admin/clinics/new')}>
          + Create Clinic
        </button>
        <RouterLink to="/super-admin/clinics?status=pending" className="crm-btn crm-btn-secondary" style={{ textDecoration: 'none' }}>
          Pending ({analytics?.clinics.pending ?? 0})
        </RouterLink>
      </CrmListActions>

      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}

      <CrmListFilters>
        <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search clinics…" />
        <select value={status} onChange={(e) => { setStatus(e.target.value as OrganizationStatus | ''); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </CrmListFilters>

      <CrmPanel title="All Clinics" badge={<CrmBadge label={`${data?.meta.total ?? 0} clinics`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Clinic</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Admins</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.data.map((clinic) => (
                  <tr key={clinic.id} className="clickable">
                    <td>
                      <strong>{clinic.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--app-muted)' }}>{clinic.email}</div>
                    </td>
                    <td>{clinic.city || '—'}</td>
                    <td>
                      <CrmBadge label={clinic.status} variant={statusVariant(clinic.status)} />
                      {clinic.emailVerified === false && (
                        <CrmBadge label="email pending" variant="warning" />
                      )}
                    </td>
                    <td>{clinic.email}</td>
                    <td><CrmBadge label={clinic.subscriptionPlan || 'starter'} variant="info" /></td>
                    <td>{clinic.adminCount ?? 0}</td>
                    <td>{formatDateTime(clinic.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <RouterLink to={`/super-admin/clinics/${clinic.id}`} className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, marginRight: 4, textDecoration: 'none' }}>
                        View
                      </RouterLink>
                      <RouterLink to={`/super-admin/clinics/${clinic.id}/edit`} className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, marginRight: 4, textDecoration: 'none' }}>
                        Edit
                      </RouterLink>
                      <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444' }} onClick={() => setClinicToDelete(clinic)} aria-label={`Delete ${clinic.name}`}>
                        <DeleteOutlineIcon style={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && <CrmEmpty message="No clinics found." />}
              </tbody>
            </table>
            {data?.meta && (
              <CrmPagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </CrmPanel>

      <Dialog open={Boolean(clinicToDelete)} onClose={() => setClinicToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete clinic?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete <strong>{clinicToDelete?.name}</strong> and all users belonging to this clinic.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClinicToDelete(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMutation.isPending} onClick={() => clinicToDelete && deleteMutation.mutate(clinicToDelete.id)}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
