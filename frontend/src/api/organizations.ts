import { apiClient } from './client';
import type {
  CreateClientAdminPayload,
  CreateOrganizationPayload,
  Organization,
  OrganizationStatus,
  PaginatedResponse,
  UpdateClientAdminPayload,
} from '@/types/organization';

export async function fetchOrganizations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationStatus;
}) {
  const { data } = await apiClient.get<PaginatedResponse<Organization>>('/organizations', { params });
  return data;
}

export async function fetchOrganization(id: string) {
  const { data } = await apiClient.get<Organization>(`/organizations/${id}`);
  return data;
}

export async function createOrganization(payload: CreateOrganizationPayload) {
  const { data } = await apiClient.post<Organization>('/organizations', payload);
  return data;
}

export async function updateOrganization(id: string, payload: Partial<CreateOrganizationPayload>) {
  const { data } = await apiClient.patch<Organization>(`/organizations/${id}`, payload);
  return data;
}

export async function deleteOrganization(id: string) {
  const { data } = await apiClient.delete<{ message: string }>(`/organizations/${id}`);
  return data;
}

export async function createClientAdmin(organizationId: string, payload: CreateClientAdminPayload) {
  const { data } = await apiClient.post(`/organizations/${organizationId}/client-admins`, payload);
  return data;
}

export async function updateClientAdmin(
  organizationId: string,
  userId: string,
  payload: UpdateClientAdminPayload
) {
  const { data } = await apiClient.patch(
    `/organizations/${organizationId}/client-admins/${userId}`,
    payload
  );
  return data;
}

export async function deleteClientAdmin(organizationId: string, userId: string) {
  const { data } = await apiClient.delete<{ message: string }>(
    `/organizations/${organizationId}/client-admins/${userId}`
  );
  return data;
}

export async function verifyClinicEmail(token: string) {
  const { data } = await apiClient.get<{ message: string; organization: Organization }>(
    '/organizations/verify-email',
    { params: { token } }
  );
  return data;
}

export async function resendClinicVerification(organizationId: string) {
  const { data } = await apiClient.post<{ message: string; verificationUrl?: string }>(
    `/organizations/${organizationId}/resend-verification`
  );
  return data;
}

export async function resendClientAdminPassword(organizationId: string, userId: string) {
  const { data } = await apiClient.post<{ message: string; devPassword?: string }>(
    `/organizations/${organizationId}/client-admins/${userId}/resend-password`
  );
  return data;
}
