import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { deleteStaffUser, fetchStaffUsers, resendStaffPassword } from '@/api/users';
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
import { formatRoleLabel } from '@/utils/roles';
import { getApiErrorMessage } from '@/utils/apiError';
import type { StaffRole, StaffUser, UserStatus } from '@/types/user';

const PAGE_SIZE = 10;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<StaffUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['staff-users', search, role, status, page],
    queryFn: () =>
      fetchStaffUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const doctors = (data?.data || []).filter((u) => u.role === 'doctor').length;
  const receptionists = (data?.data || []).filter((u) => u.role === 'receptionist').length;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStaffUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'clinic'] });
      setUserToDelete(null);
      setInfo('User deleted successfully.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to delete user.')),
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendStaffPassword(id),
    onSuccess: (result) => {
      setInfo(result.devPassword ? `${result.message} (dev password: ${result.devPassword})` : result.message);
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to resend password.')),
  });

  return (
    <>
      <CrmHint>Manage doctors & reception staff — add, edit, disable accounts</CrmHint>

      <div className="crm-kpis-8">
        <CrmKpi label="Total Staff" value={data?.meta.total ?? 0} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="On Page" value={data?.data.length ?? 0} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Doctors (page)" value={doctors} icon="🩺" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Reception (page)" value={receptionists} icon="💁" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Active Filter" value={status || 'all'} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Role Filter" value={role || 'all'} icon="🎭" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Page" value={`${page}/${data?.meta.totalPages ?? 1}`} icon="📑" iconColor="#64748b" sparkColor="#64748b" />
        <CrmKpi label="Search" value={search ? 'on' : 'off'} icon="🔍" iconColor="#2563eb" sparkColor="#2563eb" />
      </div>

      <CrmListActions>
        <RouterLink to="/admin/users/receptionists/new" className="crm-btn crm-btn-secondary" style={{ textDecoration: 'none' }}>
          + Add Receptionist
        </RouterLink>
        <RouterLink to="/admin/users/doctors/new" className="crm-btn crm-btn-primary" style={{ textDecoration: 'none' }}>
          + Add Doctor
        </RouterLink>
      </CrmListActions>

      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}
      {info && <CrmAlert variant="success" onClose={() => setInfo('')}>{info}</CrmAlert>}

      <CrmListFilters>
        <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users…" />
        <select value={role} onChange={(e) => { setRole(e.target.value as StaffRole | ''); setPage(1); }}>
          <option value="">All roles</option>
          <option value="doctor">Doctor</option>
          <option value="receptionist">Receptionist</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as UserStatus | ''); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </CrmListFilters>

      <CrmPanel title="Staff Users" badge={<CrmBadge label={`${data?.meta.total ?? 0} total`} variant="info" />}>
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
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data?.data || []).map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>
                      {user.role === 'doctor' && user.specialization && (
                        <div style={{ fontSize: 11, color: 'var(--app-muted)' }}>{user.specialization}</div>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{formatRoleLabel(user.role)}</td>
                    <td>
                      <CrmBadge label={user.status === 'active' ? 'Active' : 'Disabled'} variant={user.status === 'active' ? 'success' : 'danger'} />
                    </td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <RouterLink to={`/admin/users/${user.role}s/${user.id}/edit`} className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11, marginRight: 4, textDecoration: 'none' }}>
                        Edit
                      </RouterLink>
                      <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px' }} onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuUser(user); }}>
                        <MoreVertIcon style={{ fontSize: 16 }} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && <CrmEmpty message="No staff users found." />}
              </tbody>
            </table>
            {data?.meta && (
              <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </CrmPanel>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { if (menuUser) resendMutation.mutate(menuUser.id); setMenuAnchor(null); }}>
          Resend Password
        </MenuItem>
        <MenuItem onClick={() => { if (menuUser) setUserToDelete(menuUser); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(userToDelete)} onClose={() => setUserToDelete(null)}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> ({userToDelete?.email}).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)} disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
