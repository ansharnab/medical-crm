import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { createStaffUser, fetchStaffUser, updateStaffUser } from '@/api/users';
import { PageHeader } from '@/components/ui';
import { getApiErrorMessage } from '@/utils/apiError';
import type { StaffRole } from '@/types/user';

const emptyForm = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  specialization: '',
  consultationFee: '',
  status: 'active' as 'active' | 'disabled',
};

export function UserFormPage({ role }: { role: StaffRole }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const roleLabel = role === 'doctor' ? 'Doctor' : 'Receptionist';

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { data: existingUser, isLoading } = useQuery({
    queryKey: ['staff-user', id],
    queryFn: () => fetchStaffUser(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingUser) {
      setForm({
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phone: existingUser.phone || '',
        specialization: existingUser.specialization || '',
        consultationFee:
          existingUser.consultationFee != null ? String(existingUser.consultationFee) : '',
        status: existingUser.status === 'disabled' ? 'disabled' : 'active',
      });
    }
  }, [existingUser]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEdit && id) {
        return updateStaffUser(id, {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          status: form.status,
          ...(role === 'doctor'
            ? {
                specialization: form.specialization || undefined,
                consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
              }
            : {}),
        });
      }

      return createStaffUser({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        role,
        ...(role === 'doctor'
          ? {
              specialization: form.specialization || undefined,
              consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
            }
          : {}),
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['staff-users'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'clinic'] });
      if (!isEdit && 'devPassword' in result && result.devPassword) {
        setInfo(
          `${roleLabel} created. Credentials emailed (dev password: ${result.devPassword})`
        );
      } else if (!isEdit) {
        setInfo(`${roleLabel} created. Login credentials have been sent to their email.`);
      } else {
        navigate('/admin/users');
      }
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, `Failed to ${isEdit ? 'update' : 'create'} ${roleLabel.toLowerCase()}.`)),
  });

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={isEdit ? `Edit ${roleLabel}` : `Add ${roleLabel}`}
        subtitle={
          isEdit
            ? `Update ${roleLabel.toLowerCase()} details`
            : `A temporary password will be emailed automatically`
        }
        actions={
          <Button component={RouterLink} to="/admin/users">
            Back to Users
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/admin/users')}>
              View Users
            </Button>
          }
        >
          {info}
        </Alert>
      )}

      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </Box>
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {role === 'doctor' && (
            <>
              <TextField
                label="Specialization"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
              <TextField
                label="Consultation fee (₹)"
                type="number"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
              />
            </>
          )}
          {isEdit && (
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'active' | 'disabled' })
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </TextField>
          )}
          <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
            <Button
              variant="contained"
              onClick={() => saveMutation.mutate()}
              disabled={
                saveMutation.isPending ||
                !form.email ||
                !form.firstName ||
                !form.lastName
              }
            >
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : `Create ${roleLabel}`}
            </Button>
            <Button component={RouterLink} to="/admin/users">
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
