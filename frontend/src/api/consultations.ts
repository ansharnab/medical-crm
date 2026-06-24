import { apiClient } from './client';
import type {
  Consultation,
  ConsultationsResponse,
  UpdateConsultationPayload,
} from '@/types/clinical';

export async function startConsultation(appointmentId: string) {
  const { data } = await apiClient.post<Consultation>('/consultations', { appointmentId });
  return data;
}

export async function updateConsultation(id: string, payload: UpdateConsultationPayload) {
  const { data } = await apiClient.patch<Consultation>(`/consultations/${id}`, payload);
  return data;
}

export async function completeConsultation(id: string) {
  const { data } = await apiClient.post<Consultation>(`/consultations/${id}/complete`);
  return data;
}

export async function fetchPatientConsultations(patientId: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<ConsultationsResponse>(`/consultations/patient/${patientId}`, {
    params,
  });
  return data;
}
