import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrganization, fetchOrganization, updateOrganization } from '@/api/organizations';
import { CrmAlert, CrmHint, CrmListActions, CrmListLoading, CrmPanel } from '@/components/app';
import type { OrganizationStatus } from '@/types/organization';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  status: 'pending' as OrganizationStatus,
  subscriptionPlan: 'starter',
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) return error.response?.data?.error?.message || fallback;
  return fallback;
}

export function ClinicFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => fetchOrganization(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone || '',
        addressLine1: clinic.addressLine1 || '',
        city: clinic.city || '',
        state: clinic.state || '',
        pincode: clinic.pincode || '',
        status: clinic.status,
        subscriptionPlan: clinic.subscriptionPlan || 'starter',
      });
    }
  }, [clinic]);

  const mutation = useMutation({
    mutationFn: () => (isEdit ? updateOrganization(id!, form) : createOrganization(form)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      navigate(`/super-admin/clinics/${isEdit ? id : result.id}`, {
        state: { verificationSent: !isEdit, verificationUrl: result.verificationUrl },
      });
    },
    onError: (err) => setError(getErrorMessage(err, 'Failed to save clinic.')),
  });

  if (isEdit && isLoading) return <CrmListLoading />;

  return (
    <>
      <CrmHint>{isEdit ? 'Update clinic tenant information' : 'New clinic — email verification required before activation'}</CrmHint>

      {error && <CrmAlert variant="error">{error}</CrmAlert>}
      {!isEdit && <CrmAlert variant="info">Verification email will be sent to the clinic email after creation.</CrmAlert>}

      <CrmPanel title={isEdit ? 'Edit Clinic' : 'Create Clinic'}>
        <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
          <label className="crm-field-label">Clinic name *</label>
          <input className="crm-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label className="crm-field-label">Email *</label>
          <input className="crm-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="crm-field-label">Phone</label>
          <input className="crm-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

          <label className="crm-field-label">Address</label>
          <input className="crm-field" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="crm-field-label">City</label>
              <input className="crm-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="crm-field-label">State</label>
              <input className="crm-field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
          </div>

          <label className="crm-field-label">Pincode</label>
          <input className="crm-field" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />

          <label className="crm-field-label">Subscription Plan</label>
          <select className="crm-field" value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {isEdit && (
            <>
              <label className="crm-field-label">Status</label>
              <select
                className="crm-field"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as OrganizationStatus })}
              >
                <option value="pending">Pending</option>
                <option value="active" disabled={!clinic?.emailVerified}>Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </>
          )}

          <CrmListActions>
            <button type="button" className="crm-btn crm-btn-secondary" onClick={() => navigate('/super-admin/clinics')}>
              Cancel
            </button>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              disabled={mutation.isPending || !form.name || !form.email}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Clinic'}
            </button>
          </CrmListActions>
        </div>
      </CrmPanel>
    </>
  );
}
