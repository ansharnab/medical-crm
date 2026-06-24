# Component Library Plan

**Approach:** Atomic design with MUI base + custom themed wrappers  
**Location:** `frontend/src/components/`

---

## Phase 1 — Foundation (Sprint 0)

| Component | Props (key) | Dependencies |
|-----------|-------------|--------------|
| `ThemeProvider` | theme | MUI |
| `AppShell` | children, navItems | Sidebar, PageHeader |
| `Sidebar` | items, activePath, logo | MUI List |
| `PageHeader` | title, subtitle, search, actions | SearchField |
| `SearchField` | value, onChange, placeholder | MUI TextField |

---

## Phase 2 — Primitives (Sprint 1)

| Component | Variants | Tests |
|-----------|----------|-------|
| `Button` | primary, secondary, ghost, danger | render, click, disabled |
| `TextField` | text, email, phone, multiline | validation display |
| `Select` | single | options render |
| `StatusBadge` | success, warning, error, info, neutral | color mapping |
| `StatCard` | label, value, suffix (₹) | formatting |
| `DataCard` | title, action, children | slot render |
| `EmptyState` | title, description, action | CTA click |

---

## Phase 3 — Data (Sprint 2)

| Component | Features |
|-----------|----------|
| `DataTable` | sort, paginate, loading skeleton, row actions |
| `ConfirmDialog` | title, message, onConfirm |
| `FormDialog` | title, form fields, submit/cancel |
| `ToastProvider` | success, error, info |

---

## Phase 4 — Charts (Sprint 3)

| Component | Chart Type |
|-----------|------------|
| `BarChartCard` | Vertical bars, period filter |
| `LineChartCard` | Trend lines |
| `ProgressList` | Label + bar + percentage |
| `DonutChartCard` | New vs returning patients |

---

## Phase 5 — Domain (Sprint 4–6)

| Component | Role | Notes |
|-----------|------|-------|
| `PatientForm` | Receptionist | Create/edit patient |
| `AppointmentForm` | Receptionist | Book/reschedule |
| `PaymentForm` | Receptionist | Collect fee |
| `QueueBoard` | Receptionist, Doctor | Doctor-wise columns |
| `QueueCard` | Doctor | Call next patient |
| `ConsultationForm` | Doctor | Symptoms, diagnosis, notes |
| `PatientHistoryTimeline` | Doctor | Previous visits |
| `PatientSnapshotPanel` | Doctor, Receptionist | **Optimized — cached query** |
| `FollowUpList` | All clinical | Pending/today filters |
| `ClinicForm` | Super Admin | Create/edit clinic |
| `UserForm` | Client Admin, Super Admin | Doctor/receptionist/admin |
| `WorkingHoursEditor` | Client Admin | Weekly schedule |
| `DoctorFeeConfig` | Client Admin | Per-doctor fees |
| `AnalyticsDashboard` | Client Admin | Composed charts |

---

## PatientSnapshotPanel — Technical Plan

**Purpose:** Instant patient context on profile/consultation open

**Data displayed:**
- total_visits
- last_visit_date
- last_doctor_name
- last_diagnosis
- pending_followups_count
- recent_consultations (last 3 notes)

**API:** `GET /api/v1/patients/:id/snapshot`  
**Cache:** React Query `staleTime: 60s`, prefetch on row hover  
**Performance target:** <200ms p95 (backed by DB view + Redis cache)

---

## Storybook (Optional P1)

- Document all ui/ components
- Visual regression baseline
- Not blocking MVP launch

---

## Component Count Summary

| Layer | Count |
|-------|-------|
| ui/ primitives | 15 |
| layout/ | 4 |
| charts/ | 4 |
| domain/ | 14 |
| **Total** | **37** |

---

## Naming Conventions

- PascalCase components
- Co-located: `ComponentName/index.tsx`, `ComponentName.types.ts`, `ComponentName.test.tsx`
- No default exports except pages
