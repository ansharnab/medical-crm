import type { UserRole } from '@/types';

const roleHomePaths: Record<UserRole, string> = {
  super_admin: '/super-admin/dashboard',
  client_admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  receptionist: '/reception/dashboard',
};

export function getRoleHomePath(role: UserRole): string {
  return roleHomePaths[role];
}

export function formatRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin (Platform)',
    client_admin: 'Clinic Admin',
    doctor: 'Doctor',
    receptionist: 'Reception',
  };
  return labels[role];
}
