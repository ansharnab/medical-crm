export type UserRole = 'super_admin' | 'client_admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string | null;
  status?: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ClinicLoginOption {
  organizationId: string;
  name: string;
  city?: string | null;
  role: UserRole;
}

export interface ClinicSelectionResponse {
  requiresClinicSelection: true;
  clinics: ClinicLoginOption[];
}

export type LoginResult = LoginResponse | ClinicSelectionResponse;

export function isClinicSelectionResponse(result: LoginResult): result is ClinicSelectionResponse {
  return 'requiresClinicSelection' in result && result.requiresClinicSelection === true;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}
