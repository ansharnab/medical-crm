# Screen Inventory — Doctor CRM MVP

**Total MVP Screens:** 42  
**Design System:** All screens consume shared components (see `design-system.md`)

---

## Legend

| Priority | Meaning |
|----------|---------|
| P0 | MVP launch blocker |
| P1 | MVP important |
| P2 | MVP nice-to-have |

---

## Authentication (2)

| ID | Screen | Role | Priority |
|----|--------|------|----------|
| AUTH-01 | Login | All | P0 |
| AUTH-02 | Forgot Password | All | P2 |

---

## Super Admin (6)

| ID | Screen | Priority |
|----|--------|----------|
| SA-01 | Platform Dashboard (analytics overview) | P0 |
| SA-02 | Clinics List | P0 |
| SA-03 | Create Clinic | P0 |
| SA-04 | Edit Clinic | P0 |
| SA-05 | Clinic Detail (activate/suspend) | P0 |
| SA-06 | Create Client Admin | P0 |

---

## Client Admin (12)

| ID | Screen | Priority |
|----|--------|----------|
| CA-01 | Clinic Dashboard (analytics) | P0 |
| CA-02 | Users List | P0 |
| CA-03 | Create Doctor | P0 |
| CA-04 | Edit Doctor | P0 |
| CA-05 | Create Receptionist | P0 |
| CA-06 | Edit Receptionist | P0 |
| CA-07 | Clinic Settings — Information | P0 |
| CA-08 | Clinic Settings — Working Hours | P0 |
| CA-09 | Clinic Settings — Doctor Fees | P0 |
| CA-10 | Revenue Analytics | P0 |
| CA-11 | Patient Analytics | P0 |
| CA-12 | Appointment & Doctor Analytics | P0 |

---

## Receptionist (14)

| ID | Screen | Priority |
|----|--------|----------|
| RC-01 | Reception Dashboard | P0 |
| RC-02 | Patients List | P0 |
| RC-03 | Add Patient (modal) | P0 |
| RC-04 | Edit Patient (modal) | P0 |
| RC-05 | Patient Search | P0 |
| RC-06 | Appointments List | P0 |
| RC-07 | Book Appointment (modal) | P0 |
| RC-08 | Manage Appointment | P0 |
| RC-09 | Collect Payment | P0 |
| RC-10 | Payment History | P1 |
| RC-11 | Doctor Queue Board | P0 |
| RC-12 | Pending Follow-ups | P0 |
| RC-13 | Today's Follow-ups | P0 |
| RC-14 | Patient Profile (with snapshot read-only) | P1 |

---

## Doctor (8)

| ID | Screen | Priority |
|----|--------|----------|
| DR-01 | Doctor Dashboard | P0 |
| DR-02 | Queue View | P0 |
| DR-03 | Consultation — Active Session | P0 |
| DR-04 | Consultation — Symptoms/Diagnosis/Notes | P0 |
| DR-05 | Patient History | P0 |
| DR-06 | **Smart Patient Snapshot** (panel + full view) | P0 |
| DR-07 | Recommend Follow-up | P0 |
| DR-08 | Completed Consultations Today | P1 |

---

## Shared / System (2)

| ID | Screen | Priority |
|----|--------|----------|
| SYS-01 | Profile & Change Password | P1 |
| SYS-02 | 403 / 404 / 500 Error Pages | P0 |

---

## Wireframe Notes by Screen Type

### Dashboard Pattern (SA-01, CA-01, RC-01, DR-01)
```
[KPI × 5]
[Chart 50%] [Chart/Progress 50%]
[Table 50%] [Table/Queue 50%]
```

### List + Modal Pattern (Patients, Users, Appointments)
```
[KPI × 5 optional]
[Section Card: Table + "+ Add" button]
[Modal overlay for create/edit]
```

### Settings Pattern (CA-07 to CA-09)
```
[Tabbed or stacked form cards]
[Save / Cancel footer]
```

### Consultation Pattern (DR-03, DR-04)
```
[Patient Snapshot Panel — fixed top/side]
[Consultation form tabs]
[Complete / Follow-up actions]
```

---

## Out of MVP Scope (Future)

- Full billing / insurance desk (reference video only)
- Inventory / pharmacy (reference video only)
- WhatsApp automation
- Prescription PDFs
- Mobile native apps
- EMR expansion
