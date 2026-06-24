import type { PaginatedResponse } from './organization';

export type PatientGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: PatientGender | null;
  address?: string | null;
  bloodGroup?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  notes?: string;
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

export type PatientsResponse = PaginatedResponse<Patient>;

export interface PatientSnapshotConsultation {
  id: string;
  completedAt?: string | null;
  doctorName?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface PatientSnapshot {
  patientId: string;
  totalVisits: number;
  lastVisitDate?: string | null;
  lastDoctorName?: string | null;
  lastDiagnosis?: string | null;
  pendingFollowupsCount: number;
  recentConsultations: PatientSnapshotConsultation[];
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface AppointmentPatientRef {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AppointmentDoctorRef {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string | null;
}

export interface AppointmentPaymentRef {
  id: string;
  status: PaymentStatus;
  amount: number;
  amountPaid: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  tokenNumber?: number | null;
  feeAmount?: number | null;
  notes?: string | null;
  patient?: AppointmentPatientRef;
  doctor?: AppointmentDoctorRef;
  payment?: AppointmentPaymentRef;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  notes?: string;
}

export type UpdateAppointmentPayload = Partial<{
  scheduledAt: string;
  doctorId: string;
  status: AppointmentStatus;
  notes: string;
}>;

export type AppointmentsResponse = PaginatedResponse<Appointment>;

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'waived';
export type PaymentMode = 'cash' | 'upi' | 'card' | 'other';

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  amountPaid: number;
  paymentMode?: PaymentMode | null;
  status: PaymentStatus;
  paidAt?: string | null;
  notes?: string | null;
  patient?: { id: string; firstName: string; lastName: string; phone: string };
  appointment?: { id: string; scheduledAt: string; status: AppointmentStatus };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  appointmentId: string;
  amount: number;
  amountPaid: number;
  paymentMode?: PaymentMode;
  status?: PaymentStatus;
  notes?: string;
}

export type UpdatePaymentPayload = Partial<CreatePaymentPayload>;

export type PaymentsResponse = PaginatedResponse<Payment>;

export interface QueueEntry {
  appointmentId: string;
  tokenNumber?: number | null;
  patientName: string;
  waitingSince: string;
  status?: AppointmentStatus;
}

export interface DoctorQueue {
  doctorId: string;
  doctorName: string;
  waiting: QueueEntry[];
  inConsultation: QueueEntry | null;
}

export interface QueueResponse {
  date: string;
  doctors: DoctorQueue[];
}

export interface CallNextResponse {
  appointmentId: string;
  consultationId: string;
  status: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  recommendations?: string | null;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  spo2?: number | null;
  weightKg?: number | null;
  temperatureC?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  doctor?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateConsultationPayload {
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  recommendations?: string;
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  spo2?: number | null;
  weightKg?: number | null;
  temperatureC?: number | null;
}

export interface AppointmentSlot {
  time: string;
  available: boolean;
}

export interface AppointmentSlotsResponse {
  date: string;
  doctorId: string;
  closed: boolean;
  slots: AppointmentSlot[];
}

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dose?: string | null;
  duration?: string | null;
  quantity?: number | null;
  sortOrder?: number;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  notes?: string | null;
  items: PrescriptionItem[];
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  amount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  notes?: string | null;
  patient?: { id: string; firstName: string; lastName: string; phone: string };
  payments?: { id: string; amount: number; paymentMode: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface LabOrder {
  id: string;
  consultationId?: string | null;
  patientId: string;
  doctorId: string;
  testName: string;
  status: string;
  notes?: string | null;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; firstName: string; lastName: string };
  result?: { id: string; resultText?: string | null; fileUrl?: string | null; recordedAt: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  reorderLevel: number;
  price?: number | null;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageLog {
  id: string;
  patientId?: string | null;
  channel: string;
  recipient: string;
  body: string;
  status: string;
  createdAt: string;
}

export type ConsultationsResponse = PaginatedResponse<Consultation>;

export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export interface Followup {
  id: string;
  patientId: string;
  consultationId?: string | null;
  doctorId: string;
  dueDate: string;
  status: FollowupStatus;
  notes?: string | null;
  completedAt?: string | null;
  patient?: { id: string; name: string; phone: string };
  doctor?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowupPayload {
  consultationId: string;
  dueDate: string;
  notes?: string;
}

export type UpdateFollowupPayload = Partial<{ status: FollowupStatus; notes: string }>;

export type FollowupsResponse = PaginatedResponse<Followup>;

export interface ReceptionDashboardAnalytics {
  date: string;
  patientsToday: number;
  revenueToday: number;
  waitingCount: number;
  pendingAppointments: number;
  pendingFollowups: number;
}

export interface DoctorDashboardAnalytics {
  date: string;
  appointmentsToday: number;
  waiting: number;
  completed: number;
  inConsultation: number;
  pendingFollowups: number;
}
