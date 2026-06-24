import { Button, Switch, FormControlLabel } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPlatformSettings, updatePlatformSettings } from '@/api/platform';
import { CrmAlert, CrmHint, CrmKpi, CrmListLoading, CrmPanel } from '@/components/app';
import { getApiErrorMessage } from '@/utils/apiError';

export function PlatformSettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    productName: '',
    platformOwner: '',
    supportEmail: '',
    defaultTimezone: '',
    currency: 'INR',
    maintenanceMode: false,
  });
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: fetchPlatformSettings,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updatePlatformSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      setInfo('Platform settings saved.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to save settings.')),
  });

  if (isLoading) return <CrmListLoading />;

  return (
    <>
      <CrmHint>MaatriDev platform configuration — branding, support & maintenance</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Product" value={form.productName || '—'} icon="⚕" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Currency" value={form.currency} icon="₹" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Maintenance" value={form.maintenanceMode ? 'ON' : 'OFF'} icon="🔧" iconColor="#f59e0b" sparkColor="#f59e0b" />
      </div>

      {info && <CrmAlert variant="success" onClose={() => setInfo('')}>{info}</CrmAlert>}
      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}

      <CrmPanel title="Platform Settings">
        <div style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
          <label className="crm-field-label">Product Name</label>
          <input className="crm-field" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} />

          <label className="crm-field-label">Platform Owner</label>
          <input className="crm-field" value={form.platformOwner} onChange={(e) => setForm({ ...form, platformOwner: e.target.value })} />

          <label className="crm-field-label">Support Email</label>
          <input className="crm-field" type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />

          <label className="crm-field-label">Default Timezone</label>
          <input className="crm-field" value={form.defaultTimezone} onChange={(e) => setForm({ ...form, defaultTimezone: e.target.value })} />

          <label className="crm-field-label">Currency</label>
          <input className="crm-field" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />

          <FormControlLabel
            control={<Switch checked={form.maintenanceMode} onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })} />}
            label="Maintenance mode"
          />

          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </CrmPanel>
    </>
  );
}
