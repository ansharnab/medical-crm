import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/organization';

export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone?: string | null;
  organizationId?: string | null;
  organization?: { id: string; name: string; city?: string | null } | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface PlatformSettings {
  productName: string;
  platformOwner: string;
  supportEmail: string;
  defaultTimezone: string;
  currency: string;
  maintenanceMode: boolean;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceMonthly: number;
  clinics: number | string;
  users: number | string;
  features: string[];
}

export interface ClinicUsage {
  organizationId: string;
  patients: number;
  appointments: number;
  revenue: number;
  staff: { doctors: number; receptionists: number; admins: number; total: number };
  subscriptionPlan: string;
  subscriptionStatus: string;
  trialEndsAt?: string | null;
}

export interface ClinicOverview {
  id: string;
  name: string;
  city?: string | null;
  status: string;
  emailVerified: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  patients: number;
  appointments: number;
  users: number;
  createdAt: string;
}

export interface SubscriptionStats {
  byPlan: Record<string, number>;
  mrr: number;
}

export async function fetchPlatformUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
  organizationId?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<PaginatedResponse<PlatformUser>>('/platform/users', { params });
  return data;
}

export async function updatePlatformUser(id: string, payload: { status: 'active' | 'disabled' }) {
  const { data } = await apiClient.patch<PlatformUser>(`/platform/users/${id}`, payload);
  return data;
}

export async function fetchPlatformSettings() {
  const { data } = await apiClient.get<PlatformSettings>('/platform/settings');
  return data;
}

export async function updatePlatformSettings(payload: Partial<PlatformSettings>) {
  const { data } = await apiClient.patch<PlatformSettings>('/platform/settings', payload);
  return data;
}

export async function fetchSubscriptionPlans() {
  const { data } = await apiClient.get<{ data: SubscriptionPlan[] }>('/platform/plans');
  return data.data;
}

export async function fetchClinicUsage(organizationId: string) {
  const { data } = await apiClient.get<ClinicUsage>(`/platform/clinics/${organizationId}/usage`);
  return data;
}

export async function assignClinicPlan(
  organizationId: string,
  payload: { subscriptionPlan: string; subscriptionStatus?: string }
) {
  const { data } = await apiClient.patch(`/platform/clinics/${organizationId}/plan`, payload);
  return data;
}

export async function fetchClinicsOverview() {
  const { data } = await apiClient.get<{ data: ClinicOverview[] }>('/platform/clinics/overview');
  return data.data;
}

export async function fetchSubscriptionStats() {
  const { data } = await apiClient.get<SubscriptionStats>('/platform/subscriptions/stats');
  return data;
}
