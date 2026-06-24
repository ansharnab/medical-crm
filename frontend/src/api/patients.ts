import { apiClient } from './client';
import type {
  CreatePatientPayload,
  Patient,
  PatientSnapshot,
  PatientsResponse,
  UpdatePatientPayload,
} from '@/types/clinical';

export async function fetchPatients(params?: { search?: string; page?: number; limit?: number }) {
  const { data } = await apiClient.get<PatientsResponse>('/patients', { params });
  return data;
}

export async function fetchPatient(id: string) {
  const { data } = await apiClient.get<Patient>(`/patients/${id}`);
  return data;
}

export async function fetchPatientSnapshot(id: string) {
  const { data } = await apiClient.get<PatientSnapshot>(`/patients/${id}/snapshot`);
  return data;
}

export async function createPatient(payload: CreatePatientPayload) {
  const { data } = await apiClient.post<Patient>('/patients', payload);
  return data;
}

export async function updatePatient(id: string, payload: UpdatePatientPayload) {
  const { data } = await apiClient.patch<Patient>(`/patients/${id}`, payload);
  return data;
}
