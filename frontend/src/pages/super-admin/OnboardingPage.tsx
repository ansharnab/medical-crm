import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchOrganizations, resendClinicVerification } from '@/api/organizations';
import {
  CrmAlert,
  CrmBadge,
  CrmEmpty,
  CrmHint,
  CrmKpi,
  CrmListActions,
  CrmListLoading,
  CrmPanel,
} from '@/components/app';
import { formatDateTime } from '@/utils/formatDate';
import { getApiErrorMessage } from '@/utils/apiError';

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['organizations', 'onboarding'],
    queryFn: () => fetchOrganizations({ status: 'pending', page: 1, limit: 50 }),
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendClinicVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });

  const clinics = data?.data ?? [];
  const noAdmin = clinics.filter((c) => (c.adminCount ?? 0) === 0).length;
  const unverified = clinics.filter((c) => !c.emailVerified).length;

  return (
    <>
      <CrmHint>Pending clinics · verify email · add client admin · activate tenant</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Pending" value={data?.meta.total ?? clinics.length} icon="⏳" iconColor="#f59e0b" sparkColor="#f59e0b" />
        <CrmKpi label="Unverified Email" value={unverified} icon="✉" iconColor="#ef4444" sparkColor="#ef4444" />
        <CrmKpi label="No Admin Yet" value={noAdmin} icon="👤" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
        <CrmKpi label="Ready Soon" value={Math.max(0, clinics.length - noAdmin - unverified)} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
      </div>

      <CrmListActions>
        <button type="button" className="crm-btn crm-btn-primary" onClick={() => navigate('/super-admin/clinics/new')}>
          + Create Clinic
        </button>
        <button type="button" className="crm-btn crm-btn-secondary" onClick={() => navigate('/super-admin/clinics?status=pending')}>
          All Pending
        </button>
      </CrmListActions>

      <CrmPanel title="Onboarding Queue" badge={<CrmBadge label={`${clinics.length} clinics`} variant="warning" />}>
        {isLoading ? (
          <CrmListLoading />
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Clinic</th>
                <th>Email</th>
                <th>Checklist</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {clinics.map((c) => {
                const checks = [
                  { ok: c.emailVerified, label: 'Email verified' },
                  { ok: (c.adminCount ?? 0) > 0, label: 'Admin added' },
                  { ok: c.status === 'active', label: 'Active' },
                ];
                return (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--app-muted)' }}>{c.city || '—'}</div>
                    </td>
                    <td>{c.email}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {checks.map((ch) => (
                          <span key={ch.label} style={{ fontSize: 11, color: ch.ok ? '#10b981' : 'var(--app-muted)' }}>
                            {ch.ok ? '✓' : '○'} {ch.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{formatDateTime(c.createdAt)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {!c.emailVerified && (
                        <button
                          type="button"
                          className="crm-btn crm-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 11, marginRight: 4 }}
                          disabled={resendMutation.isPending}
                          onClick={() => resendMutation.mutate(c.id)}
                        >
                          Resend Email
                        </button>
                      )}
                      <button
                        type="button"
                        className="crm-btn crm-btn-primary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => navigate(`/super-admin/clinics/${c.id}`)}
                      >
                        Setup →
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!clinics.length && <CrmEmpty message="No pending clinics — all tenants onboarded!" />}
            </tbody>
          </table>
        )}
      </CrmPanel>

      {resendMutation.isError && (
        <CrmAlert variant="error">{getApiErrorMessage(resendMutation.error, 'Failed to resend verification.')}</CrmAlert>
      )}
    </>
  );
}
