import axios from 'axios';

interface ApiErrorDetail {
  field?: string;
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  if (!error.response) {
    return 'Cannot reach the server. Start the backend (port 4001) with scripts/start-dev.ps1 or npm run dev in backend/.';
  }

  const apiError = error.response?.data?.error;
  if (!apiError) return fallback;

  const details = (apiError.details || []) as ApiErrorDetail[];
  if (details.length > 0) {
    return details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join('. ');
  }

  return apiError.message || fallback;
}
