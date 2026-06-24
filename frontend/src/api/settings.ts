import { apiClient } from './client';
import type { ClinicSettings, DoctorFeeRow, WorkingHours } from '@/types/user';

export async function fetchClinicSettings() {
  const { data } = await apiClient.get<ClinicSettings>('/settings/clinic');
  return data;
}

export async function updateClinicSettings(payload: Partial<ClinicSettings>) {
  const { data } = await apiClient.patch<ClinicSettings>('/settings/clinic', payload);
  return data;
}

export async function fetchWorkingHours() {
  const { data } = await apiClient.get<WorkingHours>('/settings/working-hours');
  return data;
}

export async function updateWorkingHours(payload: WorkingHours) {
  const { data } = await apiClient.put<WorkingHours>('/settings/working-hours', payload);
  return data;
}

export async function fetchDoctorFees() {
  const { data } = await apiClient.get<DoctorFeeRow[]>('/settings/doctor-fees');
  return data;
}

export async function updateDoctorFee(doctorId: string, consultationFee: number) {
  const { data } = await apiClient.put<{ doctorId: string; name: string; consultationFee: number }>(
    `/settings/doctor-fees/${doctorId}`,
    { consultationFee }
  );
  return data;
}
