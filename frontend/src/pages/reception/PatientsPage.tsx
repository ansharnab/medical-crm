import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPatient, fetchPatients, updatePatient } from '@/api/patients';
import {
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
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/formatDate';
import type { Patient } from '@/types/clinical';

const PAGE_SIZE = 10;
const emptyForm = { firstName: '', lastName: '', phone: '', email: '', gender: '' as string };

export function PatientsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => fetchPatients({ search: search || undefined, page, limit: PAGE_SIZE }),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updatePatient(editing.id, {
            firstName: form.firstName,
            lastName: form.lastName || undefined,
            phone: form.phone,
            email: form.email || undefined,
            gender: (form.gender as Patient['gender']) || undefined,
          })
        : createPatient({
            firstName: form.firstName,
            lastName: form.lastName || '',
            phone: form.phone,
            email: form.email || undefined,
            gender: (form.gender as Patient['gender']) || undefined,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      showToast(editing ? 'Patient updated.' : 'Patient registered.');
    },
    onError: (err) => showToast(getApiErrorMessage(err, 'Failed to save patient.'), 'error'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName || '',
      phone: patient.phone,
      email: patient.email || '',
      gender: patient.gender || '',
    });
    setOpen(true);
  };

  const total = data?.meta.total ?? 0;

  return (
    <>
      <CrmHint>Search · register · edit patient records for your clinic</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Total Patients" value={total} icon="👥" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="On This Page" value={data?.data.length ?? 0} icon="📄" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="Page" value={`${page}/${data?.meta.totalPages ?? 1}`} icon="📑" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Search" value={search ? 'active' : 'all'} icon="🔍" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-primary" onClick={openCreate}>
          + Add Patient
        </button>
      </CrmListActions>

      <CrmListFilters>
        <CrmSearch value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or phone…" />
      </CrmListFilters>

      <CrmPanel title="Patient List" badge={<CrmBadge label={`${total} total`} variant="info" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Registered</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(data?.data || []).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        {p.firstName} {p.lastName}
                      </strong>
                    </td>
                    <td>{p.phone}</td>
                    <td>{p.email || '—'}</td>
                    <td>{p.gender || '—'}</td>
                    <td>{formatDateTime(p.createdAt)}</td>
                    <td>
                      <button type="button" className="crm-btn crm-btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.data.length && <CrmEmpty message="No patients found." />}
              </tbody>
            </table>
            {data?.meta && (
              <CrmPagination page={page} totalPages={data.meta.totalPages} total={data.meta.total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            )}
          </>
        )}
      </CrmPanel>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <TextField label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <MenuItem value="">Prefer not to say</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.firstName || !form.phone}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
