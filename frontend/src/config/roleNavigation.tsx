import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import QueueIcon from '@mui/icons-material/Queue';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ScienceIcon from '@mui/icons-material/Science';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import MedicationIcon from '@mui/icons-material/Medication';
import TvIcon from '@mui/icons-material/Tv';
import type { NavItem, UserRole } from '@/types';

export const PLATFORM_OWNER = 'MaatriDev Technologies';
export const PRODUCT_NAME = 'Doctor CRM';

export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', path: '/super-admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Onboarding', path: '/super-admin/onboarding', icon: <EventIcon fontSize="small" /> },
    { label: 'Clinics', path: '/super-admin/clinics', icon: <BusinessIcon fontSize="small" /> },
    { label: 'Users', path: '/super-admin/users', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Subscriptions', path: '/super-admin/subscriptions', icon: <PaymentIcon fontSize="small" /> },
    { label: 'Analytics', path: '/super-admin/analytics', icon: <AnalyticsIcon fontSize="small" /> },
    { label: 'Audit Log', path: '/super-admin/audit', icon: <EventNoteIcon fontSize="small" /> },
    { label: 'Settings', path: '/super-admin/settings', icon: <SettingsIcon fontSize="small" /> },
  ],
  client_admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Staff', path: '/admin/users', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Patients', path: '/admin/patients', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Payments', path: '/admin/payments', icon: <PaymentIcon fontSize="small" /> },
    { label: 'Follow-ups', path: '/admin/followups', icon: <EventNoteIcon fontSize="small" /> },
    { label: 'Billing', path: '/admin/billing', icon: <ReceiptLongIcon fontSize="small" /> },
    { label: 'Communications', path: '/admin/communications', icon: <ChatIcon fontSize="small" /> },
    { label: 'Pharmacy', path: '/admin/pharmacy', icon: <LocalPharmacyIcon fontSize="small" /> },
    { label: 'Audit Log', path: '/admin/audit', icon: <HistoryIcon fontSize="small" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <AnalyticsIcon fontSize="small" /> },
    { label: 'Settings', path: '/admin/settings/clinic', icon: <SettingsIcon fontSize="small" /> },
  ],
  doctor: [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Queue', path: '/doctor/queue', icon: <QueueIcon fontSize="small" /> },
    { label: 'Schedule', path: '/doctor/schedule', icon: <EventIcon fontSize="small" /> },
    { label: 'Follow-ups', path: '/doctor/followups', icon: <EventNoteIcon fontSize="small" /> },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: <MedicationIcon fontSize="small" /> },
    { label: 'Labs', path: '/doctor/labs', icon: <ScienceIcon fontSize="small" /> },
  ],
  receptionist: [
    { label: 'Dashboard', path: '/reception/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Patients', path: '/reception/patients', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Appointments', path: '/reception/appointments', icon: <EventIcon fontSize="small" /> },
    { label: 'Payments', path: '/reception/payments', icon: <PaymentIcon fontSize="small" /> },
    { label: 'Billing', path: '/reception/billing', icon: <ReceiptLongIcon fontSize="small" /> },
    { label: 'Queue', path: '/reception/queue', icon: <QueueIcon fontSize="small" /> },
    { label: 'Queue TV', path: '/reception/queue/tv', icon: <TvIcon fontSize="small" /> },
    { label: 'Follow-ups', path: '/reception/followups', icon: <EventNoteIcon fontSize="small" /> },
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Platform owner — manage all clinics, subscriptions & analytics',
  client_admin: 'Clinic administrator — staff, billing, pharmacy & reports',
  doctor: 'Clinical — consultations, prescriptions, labs & follow-ups',
  receptionist: 'Front desk — patients, appointments, payments & queue',
};

export function getRoleNav(role: UserRole): NavItem[] {
  return ROLE_NAV[role];
}
