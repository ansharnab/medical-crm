import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  fetchCommunicationsConfig,
  fetchMessageLogs,
  fetchMessageTemplates,
  sendMessage,
} from '@/api/modules';
import {
  CrmBadge,
  CrmDashboardHero,
  CrmEmpty,
  CrmKpi,
  CrmListLoading,
  CrmPagination,
  CrmPanel,
  CrmSectionHeader,
  FigmaScreen,
} from '@/components/app';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatDateTime } from '@/utils/formatDate';

const PAGE_SIZE = 10;

const QUICK_TEMPLATES = [
  { name: 'Appointment reminder', body: 'Reminder: Your appointment is scheduled today. Please arrive 10 min early.' },
  { name: 'Follow-up due', body: 'Your follow-up visit is due. Please call us to book a slot.' },
  { name: 'Payment pending', body: 'You have a pending payment at the clinic. Please visit reception or pay online.' },
  { name: 'Lab results ready', body: 'Your lab results are ready. Please visit the clinic or patient portal to view.' },
];

function statusVariant(status: string): 'success' | 'warning' | 'info' | 'danger' {
  if (status === 'sent') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'stub_logged') return 'warning';
  return 'info';
}

function statusLabel(status: string) {
  if (status === 'sent') return 'Sent';
  if (status === 'stub_logged') return 'Logged (dev)';
  if (status === 'failed') return 'Failed';
  return status;
}

export function AdminCommunicationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    recipient: '',
    body: QUICK_TEMPLATES[0].body,
    channel: 'sms' as 'sms' | 'email' | 'whatsapp',
    subject: 'Message from your clinic',
  });

  const { data: config } = useQuery({
    queryKey: ['communications-config'],
    queryFn: fetchCommunicationsConfig,
  });

  const { data: templates } = useQuery({
    queryKey: ['message-templates'],
    queryFn: fetchMessageTemplates,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['message-logs', page],
    queryFn: () => fetchMessageLogs({ page, limit: PAGE_SIZE }),
  });

  useEffect(() => {
    if (form.channel === 'email' && !form.recipient.includes('@')) {
      setForm((f) => ({ ...f, recipient: config?.supportEmail || 'info@maatridev.com' }));
    }
  }, [form.channel, config?.supportEmail]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(form),
    onSuccess: (log) => {
      queryClient.invalidateQueries({ queryKey: ['message-logs'] });
      showToast(
        log.status === 'sent' ? 'Message sent successfully.' : 'Message logged (configure SMS/SMTP for live delivery).'
      );
      setForm((f) => ({ ...f, recipient: '' }));
    },
    onError: (e) => showToast(getApiErrorMessage(e, 'Send failed.'), 'error'),
  });

  const logs = data?.data ?? [];
  const sentCount = logs.filter((l) => l.status === 'sent').length;
  const allTemplates = [...QUICK_TEMPLATES, ...(templates ?? []).map((t) => ({ name: t.name, body: t.body }))];

  return (
    <FigmaScreen>
      <CrmDashboardHero
        variant="teal"
        title="Communications Center"
        subtitle={`SMS · WhatsApp · Email — powered by MaatriDev (${config?.supportPhone || '9211611187'})`}
        chips={[
          { label: 'Total', value: String(data?.meta.total ?? 0), accent: '#60a5fa' },
          { label: 'SMS', value: config?.sms.mode === 'live' ? 'Live' : 'Stub', accent: '#34d399' },
          { label: 'WhatsApp', value: config?.whatsapp.mode === 'live' ? 'Live' : 'Stub', accent: '#a78bfa' },
          { label: 'Email', value: config?.email.mode === 'live' ? 'Live' : 'Stub', accent: '#fbbf24' },
        ]}
      />

      <CrmSectionHeader title="Send message" hint={config?.supportEmail || 'info@maatridev.com'} />

      <CrmPanel title="Compose">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {(['sms', 'whatsapp', 'email'] as const).map((ch) => (
            <button
              key={ch}
              type="button"
              className={`crm-btn ${form.channel === ch ? 'crm-btn-primary' : 'crm-btn-secondary'}`}
              onClick={() => setForm({ ...form, channel: ch })}
            >
              {ch === 'sms' ? '📱 SMS' : ch === 'whatsapp' ? '💬 WhatsApp' : '✉️ Email'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select
            className="crm-input"
            value=""
            onChange={(e) => {
              const t = allTemplates.find((x) => x.name === e.target.value);
              if (t) setForm({ ...form, body: t.body });
            }}
          >
            <option value="">Quick template…</option>
            {allTemplates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            className="crm-input"
            placeholder={form.channel === 'email' ? 'Email address' : 'Mobile (10 digits)'}
            value={form.recipient}
            onChange={(e) => setForm({ ...form, recipient: e.target.value })}
            style={{ minWidth: 180 }}
          />
          {form.channel === 'email' && (
            <input
              className="crm-input"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={{ minWidth: 200 }}
            />
          )}
          <textarea
            className="crm-input"
            style={{ flex: 1, minWidth: 240, minHeight: 72 }}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <button
            type="button"
            className="crm-btn crm-btn-primary"
            disabled={!form.recipient || !form.body || sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            {sendMutation.isPending ? 'Sending…' : 'Send'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--app-muted)', margin: 0 }}>
          Live SMS: set <code>MSG91_AUTH_KEY</code> in backend .env · Live email: set SMTP · Support:{' '}
          <strong>{config?.supportPhone}</strong> · <strong>{config?.supportEmail}</strong>
        </p>
      </CrmPanel>

      <div className="crm-kpis-8" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <CrmKpi label="Messages" value={data?.meta.total ?? 0} icon="💬" iconColor="#2563eb" sparkColor="#2563eb" />
        <CrmKpi label="Sent (page)" value={sentCount} icon="✓" iconColor="#10b981" sparkColor="#10b981" />
        <CrmKpi label="SMS mode" value={config?.sms.mode ?? '—'} icon="📱" iconColor="#06b6d4" sparkColor="#06b6d4" />
        <CrmKpi label="From" value={config?.email.from?.split('<')[0]?.trim() || 'MaatriDev'} icon="✉️" iconColor="#8b5cf6" sparkColor="#8b5cf6" />
      </div>

      <CrmPanel title="Message Log">
        {isLoading ? (
          <CrmListLoading />
        ) : logs.length === 0 ? (
          <CrmEmpty message="No messages sent yet." />
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>To</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.recipient}</td>
                  <td>{log.channel}</td>
                  <td>
                    <CrmBadge label={statusLabel(log.status)} variant={statusVariant(log.status)} />
                  </td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data?.meta && (
          <CrmPagination
            page={page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </CrmPanel>
    </FigmaScreen>
  );
}
