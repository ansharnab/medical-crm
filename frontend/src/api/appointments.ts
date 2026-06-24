import { apiClient } from './client';
import type {
  Appointment,
  AppointmentsResponse,
  AppointmentStatus,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '@/types/clinical';

export async function fetchAppointment(id: string) {
  const { data } = await apiClient.get<Appointment>(`/appointments/${id}`);
  return data;
}

export async function fetchAppointmentSlots(params: { doctorId: string; date: string }) {
  const { data } = await apiClient.get<import('@/types/clinical').AppointmentSlotsResponse>('/appointments/slots', {
    params,
  });
  return data;
}

export async function fetchAppointments(params?: {
  date?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  patientId?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<AppointmentsResponse>('/appointments', { params });
  return data;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const { data } = await apiClient.post<Appointment>('/appointments', payload);
  return data;
}

export async function updateAppointment(id: string, payload: UpdateAppointmentPayload) {
  const { data } = await apiClient.patch<Appointment>(`/appointments/${id}`, payload);
  return data;
}

export async function cancelAppointment(id: string) {
  const { data } = await apiClient.post<Appointment>(`/appointments/${id}/cancel`);
  return data;
}
