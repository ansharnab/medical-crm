import { apiClient } from './client';
import type { PlatformAnalytics } from '@/types/organization';
import type { ClinicDashboardAnalytics } from '@/types/user';
import type { DoctorDashboardAnalytics, ReceptionDashboardAnalytics } from '@/types/clinical';

export async function fetchPlatformAnalytics() {
  const { data } = await apiClient.get<PlatformAnalytics>('/analytics/platform');
  return data;
}

export async function fetchClinicDashboard() {
  const { data } = await apiClient.get<ClinicDashboardAnalytics>('/analytics/clinic/dashboard');
  return data;
}

export async function fetchReceptionDashboard() {
  const { data } = await apiClient.get<ReceptionDashboardAnalytics>('/analytics/reception/dashboard');
  return data;
}

export async function fetchDoctorDashboard() {
  const { data } = await apiClient.get<DoctorDashboardAnalytics>('/analytics/doctor/dashboard');
  return data;
}

export async function fetchClinicAnalytics() {
  const { data } = await apiClient.get<ClinicDashboardAnalytics>('/analytics/clinic/dashboard');
  return data;
}
