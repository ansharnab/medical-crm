# Sprint Plan — Doctor CRM MVP

**Duration:** 8 sprints × 1 week = 8 weeks (+ 2 weeks foundation/planning)  
**Team model:** Full-stack engineer + QA (agent-assisted)

---

## Sprint 0 — Planning & Design ✅

**Exit criteria:** All `/project-management` docs approved. ✅

---

## Sprint 1 — Infrastructure & Auth ✅

**Deliverable:** Login as Super Admin seed user; protected route redirect. ✅

---

## Sprint 2 — Super Admin + Organizations ✅

**Deliverable:** Super Admin creates clinic + client admin. ✅

---

## Sprint 3 — Client Admin & Settings ✅

**Deliverable:** Client Admin adds doctors and configures fees. ✅

---

## Sprint 4 — Patients & Appointments ✅

**Goal:** Reception can register patients and book.

| # | Task | Points | Status |
|---|------|--------|--------|
| 4.1 | Patients CRUD API + search | 5 | ✅ |
| 4.2 | Appointments CRUD API | 8 | ✅ |
| 4.3 | Patients UI (list, add/edit modal) | 5 | ✅ |
| 4.4 | Appointments UI (list, book modal) | 8 | ✅ |
| 4.5 | Date/time picker component | 3 | ✅ |
| 4.6 | Duplicate phone validation | 2 | ✅ |
| 4.7 | Integration tests | 5 | ✅ |

**Deliverable:** End-to-end patient registration + appointment booking. ✅

---

## Sprint 5 — Payments & Reception Dashboard ✅

| # | Task | Points | Status |
|---|------|--------|--------|
| 5.1 | Payments API | 5 | ✅ |
| 5.2 | Collect payment UI | 5 | ✅ |
| 5.3 | Reception dashboard API + page | 8 | ✅ |
| 5.4 | Payment status on appointments | 3 | ✅ |
| 5.5 | Export CSV (appointments/revenue) | 3 | ✅ |
| 5.6 | Toast notifications | 2 | ✅ |

**Deliverable:** Receptionist daily ops dashboard with payments. ✅

---

## Sprint 6 — Queue & Doctor Consultation ✅

| # | Task | Points | Status |
|---|------|--------|--------|
| 6.1 | Queue API (doctor-wise) | 5 | ✅ |
| 6.2 | Consultations API | 8 | ✅ |
| 6.3 | Patient snapshot API + Redis cache + DB view | 8 | ✅ |
| 6.4 | Queue UI (reception + doctor) | 5 | ✅ |
| 6.5 | Consultation page + form | 8 | ✅ |
| 6.6 | PatientSnapshotPanel component | 5 | ✅ |
| 6.7 | Call next patient flow | 3 | ✅ |
| 6.8 | Snapshot performance test (<200ms) | 3 | ✅ |

**Deliverable:** Doctor completes consultation with instant patient history. ✅

---

## Sprint 7 — Follow-ups & Analytics ✅

| # | Task | Points | Status |
|---|------|--------|--------|
| 7.1 | Follow-ups API | 5 | ✅ |
| 7.2 | Follow-up UI (all roles) | 5 | ✅ |
| 7.3 | Analytics aggregation service | 8 | ✅ |
| 7.4 | Client Admin analytics page (charts) | 8 | ✅ |
| 7.5 | Doctor dashboard KPIs | 3 | ✅ |
| 7.6 | Peak hour/day computation | 3 | ✅ |

**Deliverable:** Full analytics per MVP spec. ✅

---

## Sprint 8 — QA Hardening & Pilot Launch ✅

| # | Task | Points | Status |
|---|------|--------|--------|
| 8.1 | Full regression per qa-checklist.md | 8 | ✅ |
| 8.2 | Security review (OWASP top 10) | 5 | ✅ |
| 8.3 | Tenant isolation audit | 5 | ✅ |
| 8.4 | Error pages + edge cases | 3 | ✅ |
| 8.5 | Docker production configs | 3 | ✅ |
| 8.6 | Seed pilot clinic script | 2 | ✅ |
| 8.7 | Documentation handoff | 2 | ✅ |

**Deliverable:** Pilot launch to 3–5 clinics. ✅

---

## MVP Complete

All 8 sprints delivered. Ready for stakeholder review.
