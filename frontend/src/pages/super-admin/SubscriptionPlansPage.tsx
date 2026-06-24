import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  assignClinicPlan,
  fetchClinicsOverview,
  fetchSubscriptionPlans,
  fetchSubscriptionStats,
} from '@/api/platform';
import {
  CrmAlert,
  CrmBadge,
  CrmFigmaCard,
  CrmFigmaGrid2,
  CrmHint,
  CrmKpi,
  CrmListLoading,
  CrmPanel,
  CrmPill,
} from '@/components/app';
import { DonutChart } from '@/components/ui/charts';
import { getApiErrorMessage } from '@/utils/apiError';

export function SubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const [assignClinicId, setAssignClinicId] = useState('');
  const [assignPlan, setAssignPlan] = useState('pro');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['platform-plans'],
    queryFn: fetchSubscriptionPlans,
  });

  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: fetchSubscriptionStats,
  });

  const { data: clinics } = useQuery({
    queryKey: ['clinics-overview'],
    queryFn: fetchClinicsOverview,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignClinicPlan(assignClinicId, { subscriptionPlan: assignPlan, subscriptionStatus: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics-overview'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-stats'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setInfo('Plan assigned successfully.');
      setError('');
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Failed to assign plan.')),
  });

  if (plansLoading || !plans) {
    return <CrmListLoading />;
  }

  const segments = Object.entries(stats?.byPlan ?? {}).map(([plan, count], i) => ({
    value: count,
    label: plan,
    color: ['#2563eb', '#10b981', '#8b5cf6'][i % 3],
  }));

  return (
    <>
      <CrmHint>Subscription tiers · assign plans to clinics · track MRR</CrmHint>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <CrmKpi label="Est. MRR" value={`₹${((stats?.mrr ?? 0) / 100000).toFixed(1)}L`} trend="↑ live" icon="💰" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="Starter" value={stats?.byPlan?.starter ?? 0} icon="📦" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Pro + Enterprise" value={(stats?.byPlan?.pro ?? 0) + (stats?.byPlan?.enterprise ?? 0)} icon="⭐" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>

      {info && <CrmAlert variant="success" onClose={() => setInfo('')}>{info}</CrmAlert>}
      {error && <CrmAlert variant="error" onClose={() => setError('')}>{error}</CrmAlert>}

      <CrmFigmaGrid2>
        {plans.map((plan) => (
          <CrmFigmaCard
            key={plan.id}
            title={plan.name}
            badge={plan.id === 'pro' ? <CrmPill label="POPULAR" variant="b" /> : undefined}
          >
            <div style={{ fontFamily: 'var(--crm-font-display)', fontSize: 28, fontWeight: 800, color: 'var(--crm-primary)', marginBottom: 8 }}>
              {plan.price}
            </div>
            <p style={{ fontSize: 12, color: 'var(--crm-text-muted)', marginBottom: 12 }}>
              {plan.clinics} clinic(s) · {plan.users} users
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.8 }}>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              onClick={() => setAssignPlan(plan.id)}
            >
              Select for assignment
            </button>
          </CrmFigmaCard>
        ))}
      </CrmFigmaGrid2>

      <CrmFigmaGrid2>
        <CrmPanel title="Plan Distribution">
          {segments.length > 0 ? (
            <DonutChart centerLabel="Plans" segments={segments} />
          ) : (
            <p style={{ color: 'var(--app-muted)', fontSize: 13 }}>No clinics yet</p>
          )}
        </CrmPanel>
        <CrmPanel title="Assign Plan to Clinic">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <select value={assignClinicId} onChange={(e) => setAssignClinicId(e.target.value)}>
              <option value="">Select clinic…</option>
              {(clinics ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subscriptionPlan})
                </option>
              ))}
            </select>
            <select value={assignPlan} onChange={(e) => setAssignPlan(e.target.value)}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.price}</option>
              ))}
            </select>
            <button
              type="button"
              className="crm-btn crm-btn-primary"
              disabled={!assignClinicId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              Assign Plan
            </button>
          </div>
        </CrmPanel>
      </CrmFigmaGrid2>

      <CrmPanel title="Clinics by Plan">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Clinic</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Patients</th>
            </tr>
          </thead>
          <tbody>
            {(clinics ?? []).map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td><CrmBadge label={c.subscriptionPlan} variant="info" /></td>
                <td><CrmBadge label={c.subscriptionStatus} variant={c.subscriptionStatus === 'active' ? 'success' : 'warning'} /></td>
                <td>{c.patients}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CrmPanel>
    </>
  );
}
