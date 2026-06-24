import { apiClient } from './client';
import type {
  CreateFollowupPayload,
  Followup,
  FollowupsResponse,
  FollowupStatus,
  UpdateFollowupPayload,
} from '@/types/clinical';

export async function fetchFollowups(params?: {
  status?: FollowupStatus;
  dueDate?: string;
  filter?: 'today' | 'pending';
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<FollowupsResponse>('/followups', { params });
  return data;
}

export async function createFollowup(payload: CreateFollowupPayload) {
  const { data } = await apiClient.post<Followup>('/followups', payload);
  return data;
}

export async function updateFollowup(id: string, payload: UpdateFollowupPayload) {
  const { data } = await apiClient.patch<Followup>(`/followups/${id}`, payload);
  return data;
}
