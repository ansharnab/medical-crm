import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/organization';
import type { AppointmentSlotsResponse, Invoice, LabOrder, MessageLog, PharmacyItem, Prescription, PrescriptionItem } from '@/types/clinical';

export async function fetchAppointmentSlots(params: { doctorId: string; date: string }) {
  const { data } = await apiClient.get<AppointmentSlotsResponse>('/appointments/slots', { params });
  return data;
}

export async function fetchPrescription(appointmentId: string) {
  const { data } = await apiClient.get<{ prescription: Prescription | null }>(
    `/consultations/appointment/${appointmentId}/prescription`
  );
  return data.prescription;
}

export async function savePrescription(appointmentId: string, payload: { notes?: string; items: PrescriptionItem[] }) {
  const { data } = await apiClient.post<Prescription>(
    `/consultations/appointment/${appointmentId}/prescription`,
    payload
  );
  return data;
}

export async function fetchInvoices(params?: { status?: string; date?: string; page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params });
  return data;
}

export async function fetchDailyClosing(date?: string) {
  const { data } = await apiClient.get<{
    date: string;
    invoiceCount: number;
    totalBilled: number;
    totalPaid: number;
    paidCount: number;
    pendingCount: number;
  }>('/invoices/daily-closing', { params: { date } });
  return data;
}

export async function createInvoice(payload: {
  patientId: string;
  appointmentId?: string;
  amount: number;
  gstRate?: number;
  notes?: string;
}) {
  const { data } = await apiClient.post<Invoice>('/invoices', payload);
  return data;
}

export async function payInvoice(id: string, payload: { amount: number; paymentMode: string }) {
  const { data } = await apiClient.post<Invoice>(`/invoices/${id}/payments`, payload);
  return data;
}

export async function fetchMessageLogs(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<MessageLog>>('/communications/logs', { params });
  return data;
}

export async function fetchCommunicationsConfig() {
  const { data } = await apiClient.get<{
    supportPhone: string;
    supportEmail: string;
    sms: { provider: string; configured: boolean; mode: string };
    whatsapp: { provider: string; configured: boolean; mode: string };
    email: { configured: boolean; mode: string; from: string };
  }>('/communications/config');
  return data;
}

export async function sendMessage(payload: {
  patientId?: string;
  channel: 'sms' | 'email' | 'whatsapp';
  recipient: string;
  body: string;
  subject?: string;
}) {
  const { data } = await apiClient.post<MessageLog>('/communications/send', payload);
  return data;
}

export async function fetchMessageTemplates() {
  const { data } = await apiClient.get<{ data: { id: string; name: string; channel: string; body: string }[] }>(
    '/communications/templates'
  );
  return data.data;
}

export async function fetchPharmacyItems(params?: { search?: string; lowStock?: boolean; page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<PharmacyItem>>('/pharmacy', {
    params: { ...params, lowStock: params?.lowStock ? 'true' : undefined },
  });
  return data;
}

export async function createPharmacyItem(payload: Partial<PharmacyItem>) {
  const { data } = await apiClient.post<PharmacyItem>('/pharmacy', payload);
  return data;
}

export async function updatePharmacyItem(id: string, payload: Partial<PharmacyItem>) {
  const { data } = await apiClient.patch<PharmacyItem>(`/pharmacy/${id}`, payload);
  return data;
}

export async function fetchLabOrders(params?: { status?: string; patientId?: string; page?: number; limit?: number }) {
  const { data } = await apiClient.get<PaginatedResponse<LabOrder>>('/labs', { params });
  return data;
}

export async function createLabOrder(payload: {
  patientId: string;
  consultationId?: string;
  testName: string;
  notes?: string;
}) {
  const { data } = await apiClient.post<LabOrder>('/labs', payload);
  return data;
}

export async function updateLabOrder(id: string, payload: { status?: string; notes?: string }) {
  const { data } = await apiClient.patch<LabOrder>(`/labs/${id}`, payload);
  return data;
}

export async function saveLabResult(id: string, payload: { resultText?: string; fileUrl?: string }) {
  const { data } = await apiClient.post<LabOrder>(`/labs/${id}/result`, payload);
  return data;
}
