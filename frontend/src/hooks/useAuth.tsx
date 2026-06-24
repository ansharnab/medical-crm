import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '@/api/auth';
import type { ClinicLoginOption, LoginResult, User } from '@/types';
import { isClinicSelectionResponse } from '@/types';

export type LoginOutcome =
  | { status: 'authenticated'; user: User }
  | { status: 'select_clinic'; clinics: ClinicLoginOption[] };

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, organizationId?: string) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toLoginOutcome(result: LoginResult): LoginOutcome {
  if (isClinicSelectionResponse(result)) {
    return { status: 'select_clinic', clinics: result.clinics };
  }
  return { status: 'authenticated', user: result.user };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .refreshSession()
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, organizationId?: string) => {
    const result = await authApi.login(email, password, organizationId);
    const outcome = toLoginOutcome(result);
    if (outcome.status === 'authenticated') {
      setUser(outcome.user);
    }
    return outcome;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const updatedUser = await authApi.changePassword(currentPassword, newPassword);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      changePassword,
    }),
    [user, isLoading, login, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
