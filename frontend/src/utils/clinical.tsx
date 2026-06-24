import { Chip } from '@mui/material';
import type { AppointmentStatus, FollowupStatus, PaymentStatus } from '@/types/clinical';

const appointmentConfig: Record<AppointmentStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
  scheduled: { label: 'Scheduled', color: 'default' },
  confirmed: { label: 'Confirmed', color: 'info' },
  waiting: { label: 'Waiting', color: 'warning' },
  in_consultation: { label: 'In Consultation', color: 'primary' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  no_show: { label: 'No Show', color: 'error' },
};

const paymentConfig: Record<PaymentStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Pending', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  partial: { label: 'Partial', color: 'info' },
  waived: { label: 'Waived', color: 'default' },
};

const followupConfig: Record<FollowupStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  pending: { label: 'Pending', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const config = appointmentConfig[status] || { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600, fontSize: 12 }} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentConfig[status] || { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600, fontSize: 12 }} />;
}

export function FollowupStatusBadge({ status }: { status: FollowupStatus }) {
  const config = followupConfig[status] || { label: status, color: 'default' as const };
  return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600, fontSize: 12 }} />;
}

export function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}
