import { Chip } from '@mui/material';
import type { OrganizationStatus } from '@/types/organization';

const statusConfig: Record<
  OrganizationStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  active: { label: 'Active', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  suspended: { label: 'Suspended', color: 'error' },
};

export function StatusBadge({ status }: { status: OrganizationStatus }) {
  const config = statusConfig[status] || { label: status, color: 'default' as const };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600, fontSize: 12 }}
    />
  );
}
