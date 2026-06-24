import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { fetchClinicUsage } from '@/api/platform';
import {
  createClientAdmin,
  deleteClientAdmin,
  fetchOrganization,
  resendClientAdminPassword,
  resendClinicVerification,
  updateClientAdmin,
  updateOrganization,
} from '@/api/organizations';
import {
  CrmAlert,
  CrmBadge,
  CrmGrid2,
  CrmHint,
  CrmKpi,
  CrmListActions,
  CrmListLoading,
  CrmPanel,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/apiError';
import type { OrganizationUser, UpdateClientAdminPayload } from '@/types/organization';

const emptyAdminForm = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  status: 'active' as 'active' | 'disabled',
};

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'info' {
  if (s === 'active') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'suspended') return 'danger';
  return 'info';
}

export function ClinicDetailPage({ clinicId }: { clinicId: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const verificationState = location.state as { verificationSent?: boolean; verificationUrl?: string } | null;

  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [viewingAdmin, setViewingAdmin] = useState<OrganizationUser | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<OrganizationUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<OrganizationUser | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    verificationState?.verificationSent ? 'Verification email sent.' : ''
  );

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['organization', clinicId],
    queryFn: () => fetchOrganization(clinicId),
  });

  const { data: usage } = useQuery({
    queryKey: ['clinic-usage', clinicId],
    queryFn: () => fetchClinicUsage(clinicId),
    enabled: !!clinic,
  });

  const suspendMutation = useMutation({
    mutationFn: () => updateOrganization(clinicId, { status: 'suspended' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', clinicId] });
      setInfo('Clinic suspended.');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => updateOrganization(clinicId, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', clinicId] });
      setInfo('Clinic reactivated.');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to reactivate.')),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendClinicVerification(clinicId),
    onSuccess: (result) => setInfo(result.verificationUrl ? `Dev link: ${result.verificationUrl}` : 'Verification sent.'),
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to resend.')),
  });

  const adminMutation = useMutation({
    mutationFn: () => createClientAdmin(clinicId, adminForm),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organization', clinicId] });
      setAdminDialogOpen(false);
      setAdminForm(emptyAdminForm);
      setInfo(result.devPassword ? `Admin created (dev pwd: ${result.devPassword})` : 'Admin created.');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to create admin.')),
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateClientAdminPayload }) =>
      updateClientAdmin(clinicId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', clinicId] });
      setEditingAdmin(null);
      setAdminForm(emptyAdminForm);
      setInfo('Admin updated.');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to update admin.')),
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (userId: string) => deleteClientAdmin(clinicId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', clinicId] });
      setAdminToDelete(null);
      setInfo('Admin deleted.');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to delete admin.')),
  });

  const resendPasswordMutation = useMutation({
    mutationFn: (userId: string) => resendClientAdminPassword(clinicId, userId),
    onSuccess: (result) => setInfo(result.devPassword ? `${result.message} (dev: ${result.devPassword})` : result.message),
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to resend password.')),
  });

  if (isLoading || !clinic) return <CrmListLoading />;

  const canAddAdmin = clinic.emailVerified && clinic.status === 'active';
  const clientAdmins = (clinic.users || []).filter((u) => u.role === 'client_admin');
  const checks = [
    { ok: clinic.emailVerified, label: 'Email verified' },
    { ok: clientAdmins.length > 0, label: 'Client admin added' },
    { ok: clinic.status === 'active', label: 'Clinic active' },
  ];

  return (
    <>
      <CrmHint>
        <strong>{clinic.name}</strong> · {clinic.city || '—'} · {clinic.slug}
      </CrmHint>

      {info && <CrmAlert variant="success" onClose={() => setInfo('')}>{info}</CrmAlert>}
      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}

      <CrmListActions>
        <RouterLink to={`/super-admin/clinics/${clinicId}/edit`} className="crm-btn crm-btn-secondary" style={{ textDecoration: 'none' }}>Edit</RouterLink>
        {!clinic.emailVerified && (
          <button type="button" className="crm-btn crm-btn-primary" disabled={resendMutation.isPending} onClick={() => resendMutation.mutate()}>
            Resend Verification
          </button>
        )}
        {clinic.status === 'suspended' && (
          <button type="button" className="crm-btn crm-btn-primary" disabled={reactivateMutation.isPending} onClick={() => reactivateMutation.mutate()}>
            Reactivate
          </button>
        )}
        {clinic.status !== 'suspended' && clinic.emailVerified && (
          <button type="button" className="crm-btn crm-btn-secondary" style={{ color: '#ef4444' }} onClick={() => suspendMutation.mutate()}>
            Suspend
          </button>
        )}
        <button type="button" className="crm-btn crm-btn-primary" disabled={!canAddAdmin} onClick={() => setAdminDialogOpen(true)}>
          + Client Admin
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => navigate('/super-admin/clinics')}>
          ← Back
        </button>
      </CrmListActions>

      <div className="crm-kpis-8">
        <CrmKpi label="Patients" value={usage?.patients ?? 0} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Appointments" value={usage?.appointments ?? 0} icon="📅" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Revenue" value={`₹${((usage?.revenue ?? 0) / 1000).toFixed(1)}k`} icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Staff" value={usage?.staff.total ?? 0} icon="🩺" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Plan" value={clinic.subscriptionPlan || 'starter'} icon="📦" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Sub Status" value={clinic.subscriptionStatus || 'trial'} icon="⭐" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Admins" value={clientAdmins.length} icon="👤" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Status" value={clinic.status} icon="●" iconColor="#64748b" sparkColor="#64748b" />
      </div>

      <CrmGrid2>
        <CrmPanel title="Clinic Overview">
          <div className="crm-metric-row"><span>Status</span><CrmBadge label={clinic.status} variant={statusVariant(clinic.status)} /></div>
          <div className="crm-metric-row"><span>Email</span><strong>{clinic.email}</strong></div>
          <div className="crm-metric-row"><span>Phone</span><strong>{clinic.phone || '—'}</strong></div>
          <div className="crm-metric-row"><span>Email verified</span><strong>{clinic.emailVerified ? 'Yes' : 'No'}</strong></div>
          <div className="crm-metric-row"><span>Created</span><strong>{formatDateTime(clinic.createdAt)}</strong></div>
          <div className="crm-metric-row"><span>Address</span><strong style={{ textAlign: 'right', maxWidth: 240 }}>{[clinic.addressLine1, clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(', ') || '—'}</strong></div>
        </CrmPanel>
        <CrmPanel title="Onboarding Checklist">
          {checks.map((c) => (
            <div key={c.label} className="crm-metric-row">
              <span>{c.label}</span>
              <strong style={{ color: c.ok ? '#10b981' : 'var(--app-muted)' }}>{c.ok ? '✓ Done' : 'Pending'}</strong>
            </div>
          ))}
          {!canAddAdmin && (
            <p style={{ fontSize: 12, color: 'var(--app-muted)', marginTop: 12 }}>Verify email & activate before adding client admin.</p>
          )}
        </CrmPanel>
      </CrmGrid2>

      <CrmPanel title="Client Admins">
        <table className="crm-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Status</th><th>Created</th><th /></tr>
          </thead>
          <tbody>
            {clientAdmins.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.firstName} {user.lastName}</strong></td>
                <td>{user.email}</td>
                <td><CrmBadge label={user.status} variant={user.status === 'active' ? 'success' : 'danger'} /></td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, marginRight: 4 }} onClick={() => setViewingAdmin(user)}>View</button>
                  <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, marginRight: 4 }} onClick={() => { setEditingAdmin(user); setAdminForm({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone || '', status: user.status === 'disabled' ? 'disabled' : 'active' }); }}>Edit</button>
                  <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 8px', color: '#ef4444' }} onClick={() => setAdminToDelete(user)} aria-label="Delete"><DeleteOutlineIcon style={{ fontSize: 14 }} /></button>
                </td>
              </tr>
            ))}
            {!clientAdmins.length && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--app-muted)', padding: 24 }}>No client admin yet.</td></tr>
            )}
          </tbody>
        </table>
      </CrmPanel>

      {/* Dialogs */}
      <Dialog open={Boolean(viewingAdmin)} onClose={() => setViewingAdmin(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Client Admin</DialogTitle>
        <DialogContent>
          {viewingAdmin && (
            <>
              <p><strong>{viewingAdmin.firstName} {viewingAdmin.lastName}</strong></p>
              <p>{viewingAdmin.email}</p>
              <Button onClick={() => resendPasswordMutation.mutate(viewingAdmin.id)} disabled={resendPasswordMutation.isPending}>Resend Password</Button>
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewingAdmin(null)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={Boolean(editingAdmin)} onClose={() => setEditingAdmin(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="First name" value={adminForm.firstName} onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })} />
          <TextField label="Last name" value={adminForm.lastName} onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })} />
          <TextField label="Email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
          <TextField select label="Status" value={adminForm.status} onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value as 'active' | 'disabled' })}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="disabled">Disabled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingAdmin(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => editingAdmin && updateAdminMutation.mutate({ userId: editingAdmin.id, payload: adminForm })}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Client Admin</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="First name" value={adminForm.firstName} onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })} required />
          <TextField label="Last name" value={adminForm.lastName} onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })} required />
          <TextField label="Email" type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
          <TextField label="Phone" value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => adminMutation.mutate()} disabled={!adminForm.email || !adminForm.firstName}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(adminToDelete)} onClose={() => setAdminToDelete(null)}>
        <DialogTitle>Delete admin?</DialogTitle>
        <DialogContent><DialogContentText>Permanently delete {adminToDelete?.email}?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => adminToDelete && deleteAdminMutation.mutate(adminToDelete.id)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
