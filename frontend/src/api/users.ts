import { apiClient } from './client';
import type {
  CreateStaffUserPayload,
  StaffUser,
  StaffUsersResponse,
  StaffRole,
  UpdateStaffUserPayload,
  UserStatus,
} from '@/types/user';

export async function fetchStaffUsers(params?: {
  role?: StaffRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<StaffUsersResponse>('/users', { params });
  return data;
}

export async function fetchStaffUser(id: string) {
  const { data } = await apiClient.get<StaffUser>(`/users/${id}`);
  return data;
}

export async function createStaffUser(payload: CreateStaffUserPayload) {
  const { data } = await apiClient.post<StaffUser & { devPassword?: string }>('/users', payload);
  return data;
}

export async function updateStaffUser(id: string, payload: UpdateStaffUserPayload) {
  const { data } = await apiClient.patch<StaffUser>(`/users/${id}`, payload);
  return data;
}

export async function deleteStaffUser(id: string) {
  const { data } = await apiClient.delete<{ message: string }>(`/users/${id}`);
  return data;
}

export async function resendStaffPassword(id: string) {
  const { data } = await apiClient.post<{ message: string; devPassword?: string }>(
    `/users/${id}/resend-password`
  );
  return data;
}
