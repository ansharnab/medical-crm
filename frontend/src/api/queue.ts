import { apiClient } from './client';
import type { CallNextResponse, QueueResponse } from '@/types/clinical';

export async function fetchQueue(params?: { doctorId?: string; date?: string }) {
  const { data } = await apiClient.get<QueueResponse>('/queue', { params });
  return data;
}

export async function callNextPatient(appointmentId: string) {
  const { data } = await apiClient.post<CallNextResponse>(`/queue/${appointmentId}/call-next`);
  return data;
}
