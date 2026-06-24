import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/organization';

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; email: string; name: string } | null;
  organization?: { id: string; name: string } | null;
}

export async function fetchAuditLogs(params?: {
  action?: string;
  organizationId?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { params });
  return data;
}
