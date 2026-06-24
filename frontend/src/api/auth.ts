import { apiClient, setAccessToken } from './client';
import type { LoginResponse, LoginResult, User } from '@/types';
import { isClinicSelectionResponse } from '@/types';

export async function login(
  email: string,
  password: string,
  organizationId?: string
): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/login', {
    email,
    password,
    organizationId,
  });

  if (isClinicSelectionResponse(data)) {
    return data;
  }

  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>('/auth/me');
  return data.user;
}

export async function refreshSession(): Promise<LoginResponse | null> {
  try {
    const { data } = await apiClient.post<LoginResponse>('/auth/refresh');
    setAccessToken(data.accessToken);
    return data;
  } catch {
    setAccessToken(null);
    return null;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<User> {
  const { data } = await apiClient.post<{ user: User }>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data.user;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, newPassword: string): Promise<User> {
  const { data } = await apiClient.post<{ user: User; message: string }>('/auth/reset-password', {
    token,
    newPassword,
  });
  return data.user;
}

export async function updateProfile(payload: { firstName?: string; lastName?: string }): Promise<User> {
  const { data } = await apiClient.patch<{ user: User }>('/auth/me', payload);
  return data.user;
}
