import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchClinicSettings, updateClinicSettings } from '@/api/settings';
import { getApiErrorMessage } from '@/utils/apiError';

export function ClinicSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    timezone: 'Asia/Kolkata',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'clinic'],
    queryFn: fetchClinicSettings,
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        timezone: data.timezone || 'Asia/Kolkata',
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateClinicSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'clinic'] });
      setInfo('Clinic settings updated successfully.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to update clinic settings.')),
  });

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {info && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfo('')}>
          {info}
        </Alert>
      )}

      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Clinic email" value={data.email} disabled helperText="Contact support to change clinic email" />
          <TextField
            label="Clinic name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Address line 1"
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />
          <TextField
            label="Address line 2"
            value={form.addressLine2}
            onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <TextField
              label="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
            <TextField
              label="Pincode"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            />
          </Box>
          <TextField
            label="Timezone"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          />
          <Box>
            <Button
              variant="contained"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name}
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
