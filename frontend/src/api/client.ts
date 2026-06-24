import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE ? `${API_BASE}/api/v1` : '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Never retry auth bootstrap endpoints — avoids deadlock when refresh returns 401.
    if (
      !original ||
      original._retry ||
      isAuthEndpoint(original.url) ||
      error.response?.status !== 401
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post('/auth/refresh')
        .then((res) => {
          const token = res.data.accessToken as string;
          setAccessToken(token);
          return token;
        })
        .catch(() => {
          setAccessToken(null);
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    }

    return Promise.reject(error);
  }
);
