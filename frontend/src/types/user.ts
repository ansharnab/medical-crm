import type { PaginatedResponse } from './organization';

export type StaffRole = 'doctor' | 'receptionist';
export type UserStatus = 'active' | 'disabled';

export interface StaffUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: StaffRole;
  status: UserStatus;
  specialization?: string | null;
  consultationFee?: number | null;
  mustChangePassword?: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: StaffRole;
  specialization?: string;
  consultationFee?: number;
}

export interface UpdateStaffUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: UserStatus;
  specialization?: string;
  consultationFee?: number;
}

export type StaffUsersResponse = PaginatedResponse<StaffUser>;

export interface ClinicSettings {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  timezone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type WorkingHours = Record<string, DayHours>;

export interface DoctorFeeRow {
  doctorId: string;
  name: string;
  email: string;
  specialization?: string | null;
  consultationFee?: number | null;
  status: string;
}

export interface ClinicDashboardAnalytics {
  patients: { total: number; new: number; returning: number };
  appointments: { today: number; week: number; month: number };
  revenue: { today: number; week: number; month: number };
  staff: { doctors: number; receptionists: number; total: number };
  doctors: {
    doctorId: string;
    name: string;
    patients: number;
    revenue: number;
    appointments: number;
  }[];
  insights: {
    peakHour: number | null;
    peakDay: string | null;
    mostActiveDoctor: string | null;
    avgRevenuePerPatient: number | null;
  };
}
