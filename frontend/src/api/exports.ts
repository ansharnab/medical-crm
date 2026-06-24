import { apiClient } from './client';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportAppointmentsCsv(date?: string) {
  const { data } = await apiClient.get<Blob>('/exports/appointments.csv', {
    params: date ? { date } : undefined,
    responseType: 'blob',
  });
  downloadBlob(data, date ? `appointments-${date}.csv` : 'appointments.csv');
}

export async function exportRevenueCsv(date?: string) {
  const { data } = await apiClient.get<Blob>('/exports/revenue.csv', {
    params: date ? { date } : undefined,
    responseType: 'blob',
  });
  downloadBlob(data, date ? `revenue-${date}.csv` : 'revenue.csv');
}
