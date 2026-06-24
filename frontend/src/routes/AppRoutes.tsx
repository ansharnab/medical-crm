import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyClinicEmailPage } from '@/pages/auth/VerifyClinicEmailPage';
import { ProtectedRoute, RoleRoute } from '@/routes/ProtectedRoute';
import { SuperAdminLayout } from '@/pages/super-admin/DashboardPage';
import { ClinicsListPage } from '@/pages/super-admin/ClinicsListPage';
import { ClinicFormPage } from '@/pages/super-admin/ClinicFormPage';
import { ClinicDetailPage } from '@/pages/super-admin/ClinicDetailPage';
import { PlatformAnalyticsPage, PlatformDashboardPage } from '@/pages/super-admin/PlatformPages';
import { OnboardingPage } from '@/pages/super-admin/OnboardingPage';
import { PlatformUsersPage } from '@/pages/super-admin/PlatformUsersPage';
import { SuperAdminAuditPage } from '@/pages/super-admin/SuperAdminAuditPage';
import { SubscriptionPlansPage } from '@/pages/super-admin/SubscriptionPlansPage';
import { PlatformSettingsPage } from '@/pages/super-admin/PlatformSettingsPage';
import { AdminDashboardPage } from '@/pages/admin/DashboardPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { UserFormPage } from '@/pages/admin/UserFormPage';
import { AdminPatientsPage } from '@/pages/admin/PatientsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminFollowupsPage } from '@/pages/admin/AdminFollowupsPage';
import { AdminBillingPage } from '@/pages/admin/AdminBillingPage';
import { AdminCommunicationsPage } from '@/pages/admin/AdminCommunicationsPage';
import { AdminPharmacyPage } from '@/pages/admin/AdminPharmacyPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { SettingsLayout } from '@/pages/admin/settings/SettingsLayout';
import { ClinicSettingsPage } from '@/pages/admin/settings/ClinicSettingsPage';
import { WorkingHoursPage } from '@/pages/admin/settings/WorkingHoursPage';
import { DoctorFeesPage } from '@/pages/admin/settings/DoctorFeesPage';
import { ReceptionDashboardPage } from '@/pages/reception/DashboardPage';
import { PatientsPage } from '@/pages/reception/PatientsPage';
import { AppointmentsPage } from '@/pages/reception/AppointmentsPage';
import { PaymentsPage } from '@/pages/reception/PaymentsPage';
import { ReceptionBillingPage } from '@/pages/reception/ReceptionBillingPage';
import { ReceptionQueuePage } from '@/pages/reception/QueuePage';
import { QueueTvPage } from '@/pages/reception/QueueTvPage';
import { ReceptionFollowupsPage } from '@/pages/reception/FollowupsPage';
import { DoctorDashboardPage } from '@/pages/doctor/DashboardPage';
import { DoctorQueuePage } from '@/pages/doctor/QueuePage';
import { DoctorSchedulePage } from '@/pages/doctor/SchedulePage';
import { ConsultationPage } from '@/pages/doctor/ConsultationPage';
import { PrescriptionPage } from '@/pages/doctor/PrescriptionPage';
import { DoctorPrescriptionsListPage } from '@/pages/doctor/PrescriptionsListPage';
import { LabsPage } from '@/pages/doctor/LabsPage';
import { DoctorFollowupsPage } from '@/pages/doctor/FollowupsPage';
import { PatientDetailPage } from '@/pages/clinical/PatientDetailPage';
import { PortalPage } from '@/pages/portal/PortalPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { AppShell } from '@/components/layout/AppShell';
import { getRoleNav } from '@/config/roleNavigation';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-clinic-email" element={<VerifyClinicEmailPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PlatformDashboardPage />} />
              <Route path="onboarding" element={<OnboardingPage />} />
              <Route path="clinics" element={<ClinicsListPage />} />
              <Route path="clinics/new" element={<ClinicFormPage />} />
              <Route path="clinics/:id" element={<ClinicDetailRoute />} />
              <Route path="clinics/:id/edit" element={<ClinicFormPage />} />
              <Route path="users" element={<PlatformUsersPage />} />
              <Route path="subscriptions" element={<SubscriptionPlansPage />} />
              <Route path="analytics" element={<PlatformAnalyticsPage />} />
              <Route path="audit" element={<SuperAdminAuditPage />} />
              <Route path="settings" element={<PlatformSettingsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['client_admin']} />}>
            <Route path="/admin" element={<AppShell navItems={getRoleNav('client_admin')} role="client_admin" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/doctors/new" element={<UserFormPage role="doctor" />} />
              <Route path="users/doctors/:id/edit" element={<UserFormPage role="doctor" />} />
              <Route path="users/receptionists/new" element={<UserFormPage role="receptionist" />} />
              <Route path="users/receptionists/:id/edit" element={<UserFormPage role="receptionist" />} />
              <Route path="patients" element={<AdminPatientsPage />} />
              <Route path="patients/:id" element={<PatientDetailPage backPath="/admin/patients" />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="followups" element={<AdminFollowupsPage />} />
              <Route path="billing" element={<AdminBillingPage />} />
              <Route path="communications" element={<AdminCommunicationsPage />} />
              <Route path="pharmacy" element={<AdminPharmacyPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<Navigate to="clinic" replace />} />
                <Route path="clinic" element={<ClinicSettingsPage />} />
                <Route path="working-hours" element={<WorkingHoursPage />} />
                <Route path="doctor-fees" element={<DoctorFeesPage />} />
              </Route>
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor" element={<AppShell navItems={getRoleNav('doctor')} role="doctor" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboardPage />} />
              <Route path="queue" element={<DoctorQueuePage />} />
              <Route path="schedule" element={<DoctorSchedulePage />} />
              <Route path="consultations/:appointmentId" element={<ConsultationPage />} />
              <Route path="consultations/:appointmentId/prescription" element={<PrescriptionPage />} />
              <Route path="prescriptions" element={<DoctorPrescriptionsListPage />} />
              <Route path="labs" element={<LabsPage />} />
              <Route path="patients/:id" element={<PatientDetailPage backPath="/doctor/queue" />} />
              <Route path="followups" element={<DoctorFollowupsPage />} />
            </Route>
          </Route>

          <Route element={<RoleRoute allowedRoles={['receptionist']} />}>
            <Route path="/reception" element={<AppShell navItems={getRoleNav('receptionist')} role="receptionist" />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ReceptionDashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/:id" element={<PatientDetailPage backPath="/reception/patients" />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="billing" element={<ReceptionBillingPage />} />
              <Route path="queue" element={<ReceptionQueuePage />} />
              <Route path="queue/tv" element={<QueueTvPage />} />
              <Route path="followups" element={<ReceptionFollowupsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function ClinicDetailRoute() {
  const { id } = useParams();
  if (!id) return null;
  return <ClinicDetailPage clinicId={id} />;
}
