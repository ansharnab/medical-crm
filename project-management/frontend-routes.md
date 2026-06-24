# Frontend Route Structure — Doctor CRM

**Router:** React Router v6  
**Auth guard:** `ProtectedRoute` + `RoleRoute`  
**Layout:** `AppShell` for all authenticated routes

---

## Public Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/login` | `LoginPage` | Redirect if authenticated |
| `/forgot-password` | `ForgotPasswordPage` | P2 |

---

## Route Tree

```
/
├── /login
├── /super-admin          [Role: SUPER_ADMIN]
│   ├── /dashboard
│   ├── /clinics
│   ├── /clinics/new
│   ├── /clinics/:id
│   ├── /clinics/:id/edit
│   └── /analytics
├── /admin                [Role: CLIENT_ADMIN]
│   ├── /dashboard
│   ├── /users
│   ├── /users/doctors/new
│   ├── /users/doctors/:id/edit
│   ├── /users/receptionists/new
│   ├── /users/receptionists/:id/edit
│   ├── /settings
│   │   ├── /clinic
│   │   ├── /working-hours
│   │   └── /doctor-fees
│   └── /analytics
├── /reception            [Role: RECEPTIONIST]
│   ├── /dashboard
│   ├── /patients
│   ├── /patients/:id
│   ├── /appointments
│   ├── /payments
│   ├── /queue
│   └── /followups
├── /doctor               [Role: DOCTOR]
│   ├── /dashboard
│   ├── /queue
│   ├── /consultations/:appointmentId
│   ├── /patients/:id
│   └── /followups
└── /403, /404
```

---

## Role → Default Redirect

| Role | Login Redirect |
|------|----------------|
| SUPER_ADMIN | `/super-admin/dashboard` |
| CLIENT_ADMIN | `/admin/dashboard` |
| RECEPTIONIST | `/reception/dashboard` |
| DOCTOR | `/doctor/dashboard` |

---

## Navigation Items by Role

### Super Admin Sidebar

| Label | Path | Icon |
|-------|------|------|
| Dashboard | `/super-admin/dashboard` | Dashboard |
| Clinics | `/super-admin/clinics` | Business |
| Analytics | `/super-admin/analytics` | Analytics |

### Client Admin Sidebar

| Label | Path |
|-------|------|
| Dashboard | `/admin/dashboard` |
| Users | `/admin/users` |
| Settings | `/admin/settings/clinic` |
| Analytics | `/admin/analytics` |

### Receptionist Sidebar

| Label | Path |
|-------|------|
| Dashboard | `/reception/dashboard` |
| Patients | `/reception/patients` |
| Appointments | `/reception/appointments` |
| Payments | `/reception/payments` |
| Queue | `/reception/queue` |
| Follow-ups | `/reception/followups` |

### Doctor Sidebar

| Label | Path |
|-------|------|
| Dashboard | `/doctor/dashboard` |
| Queue | `/doctor/queue` |
| Follow-ups | `/doctor/followups` |

---

## Page Header CTAs (Context-Aware)

| Route Pattern | Primary CTA |
|---------------|-------------|
| `*/appointments` | + Book Appointment |
| `*/patients` | + Add Patient |
| `*/users` | + Add User |
| `*/clinics` | + Create Clinic |
| `*/queue` | — |
| `*/consultations/*` | Complete Consultation |

---

## React Query Keys

```typescript
// Pattern: [domain, scope, ...params]
['patients', orgId, { search, page }]
['patients', patientId, 'snapshot']
['appointments', orgId, { date, doctorId }]
['queue', orgId, date]
['analytics', 'clinic', orgId]
['analytics', 'reception', orgId]
['analytics', 'doctor', orgId, doctorId]
```

---

## Code Structure

```
frontend/src/pages/
├── auth/
│   └── LoginPage.tsx
├── super-admin/
│   ├── DashboardPage.tsx
│   ├── ClinicsListPage.tsx
│   ├── ClinicFormPage.tsx
│   └── PlatformAnalyticsPage.tsx
├── admin/
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── UserFormPage.tsx
│   ├── settings/
│   └── AnalyticsPage.tsx
├── reception/
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   ├── AppointmentsPage.tsx
│   ├── PaymentsPage.tsx
│   ├── QueuePage.tsx
│   └── FollowupsPage.tsx
└── doctor/
    ├── DashboardPage.tsx
    ├── QueuePage.tsx
    ├── ConsultationPage.tsx
    └── FollowupsPage.tsx
```

---

## Lazy Loading

All role page modules lazy-loaded via `React.lazy()` + `Suspense` with `LoadingSkeleton`.

---

## URL Design Rules

1. Role prefix prevents accidental cross-role navigation
2. IDs are UUIDs in URLs
3. Modals do NOT change URL for simple CRUD (optional: query param `?modal=create`)
4. Consultation uses appointment ID in path for deep linking
