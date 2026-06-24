export type OrganizationStatus = 'active' | 'suspended' | 'pending';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  timezone?: string;
  status: OrganizationStatus;
  emailVerifiedAt?: string | null;
  emailVerified?: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  adminCount?: number;
  users?: OrganizationUser[];
  createdAt: string;
  updatedAt?: string;
  verificationEmailSent?: boolean;
  verificationUrl?: string;
}

export interface OrganizationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateClientAdminPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'active' | 'disabled';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlatformAnalytics {
  clinics: {
    total: number;
    active: number;
    suspended: number;
    pending: number;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  appointments: {
    total: number;
    today: number;
  };
  recentClinics: {
    id: string;
    name: string;
    city?: string;
    status: OrganizationStatus;
    createdAt: string;
  }[];
}

export interface CreateOrganizationPayload {
  name: string;
  email: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: OrganizationStatus;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

export interface CreateClientAdminPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
