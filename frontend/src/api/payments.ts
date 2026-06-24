import { apiClient } from './client';
import type {
  CreatePaymentPayload,
  Payment,
  PaymentsResponse,
  PaymentStatus,
  UpdatePaymentPayload,
} from '@/types/clinical';

export async function fetchPayments(params?: {
  date?: string;
  status?: PaymentStatus;
  patientId?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.get<PaymentsResponse>('/payments', { params });
  return data;
}

export async function createPayment(payload: CreatePaymentPayload) {
  const { data } = await apiClient.post<Payment>('/payments', payload);
  return data;
}

export async function updatePayment(id: string, payload: UpdatePaymentPayload) {
  const { data } = await apiClient.patch<Payment>(`/payments/${id}`, payload);
  return data;
}
