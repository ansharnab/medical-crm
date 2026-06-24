# Product Backlog — Doctor CRM

**Last updated:** 2026-05-30  
**Priority:** P0 (MVP) → P1 (Pilot+) → P2 (Future)

---

## P0 — MVP (Must Have)

### Epic E1: Platform Foundation
| ID | Story | Sprint |
|----|-------|--------|
| E1-01 | As Super Admin, I can log in securely | S1 |
| E1-02 | As Super Admin, I can create and manage clinics | S2 |
| E1-03 | As Super Admin, I can create client admins for clinics | S2 |
| E1-04 | As Super Admin, I can activate/suspend clinics | S2 |
| E1-05 | As Super Admin, I can view platform analytics | S2 |

### Epic E2: Clinic Administration
| ID | Story | Sprint |
|----|-------|--------|
| E2-01 | As Client Admin, I can create and manage doctors | S3 |
| E2-02 | As Client Admin, I can create and manage receptionists | S3 |
| E2-03 | As Client Admin, I can disable staff accounts | S3 |
| E2-04 | As Client Admin, I can configure clinic information | S3 |
| E2-05 | As Client Admin, I can set working hours | S3 |
| E2-06 | As Client Admin, I can configure doctor consultation fees | S3 |

### Epic E3: Reception Operations
| ID | Story | Sprint |
|----|-------|--------|
| E3-01 | As Receptionist, I can add and edit patients | S4 |
| E3-02 | As Receptionist, I can search patients by name/phone | S4 |
| E3-03 | As Receptionist, I can book appointments with doctor selection | S4 |
| E3-04 | As Receptionist, I can manage/reschedule/cancel appointments | S4 |
| E3-05 | As Receptionist, I can collect consultation fees | S5 |
| E3-06 | As Receptionist, I can track payment status | S5 |
| E3-07 | As Receptionist, I can view doctor-wise queue | S6 |
| E3-08 | As Receptionist, I can view pending and today's follow-ups | S7 |
| E3-09 | As Receptionist, I see today's dashboard KPIs | S5 |

### Epic E4: Doctor Clinical Workflow
| ID | Story | Sprint |
|----|-------|--------|
| E4-01 | As Doctor, I can view my queue and call next patient | S6 |
| E4-02 | As Doctor, I can record symptoms, diagnosis, notes | S6 |
| E4-03 | As Doctor, I can complete consultations | S6 |
| E4-04 | As Doctor, I can view patient visit history | S6 |
| E4-05 | As Doctor, I see **Smart Patient Snapshot** instantly | S6 |
| E4-06 | As Doctor, I can recommend follow-up dates | S7 |
| E4-07 | As Doctor, I see today's dashboard KPIs | S7 |

### Epic E5: Analytics
| ID | Story | Sprint |
|----|-------|--------|
| E5-01 | As Client Admin, I see patient analytics (total/new/returning) | S7 |
| E5-02 | As Client Admin, I see appointment analytics (daily/weekly/monthly) | S7 |
| E5-03 | As Client Admin, I see revenue analytics | S7 |
| E5-04 | As Client Admin, I see doctor performance metrics | S7 |
| E5-05 | As Client Admin, I see peak hour, peak day, most active doctor | S7 |
| E5-06 | As Client Admin, I see average revenue per patient | S7 |

### Epic E6: Security & Multi-Tenancy
| ID | Story | Sprint |
|----|-------|--------|
| E6-01 | All business data isolated by organization_id | S1–S8 |
| E6-02 | RBAC enforced on every API endpoint | S1–S8 |
| E6-03 | Audit log for sensitive actions | S2+ |
| E6-04 | Tenant isolation integration tests | S2–S8 |

---

## P1 — Pilot Enhancements

| ID | Story |
|----|-------|
| P1-01 | Export appointments/revenue to CSV |
| P1-02 | Change password flow |
| P1-03 | Appointment conflict detection |
| P1-04 | SMS appointment reminder (Twilio) |
| P1-05 | Audit log viewer for Client Admin |
| P1-06 | Patient soft-delete / archive |

---

## P2 — Future

| ID | Story |
|----|-------|
| P2-01 | Prescription PDF generation |
| P2-02 | Pharmacy inventory module |
| P2-03 | WhatsApp automation |
| P2-04 | Subscription billing |
| P2-05 | Mobile apps |
| P2-06 | AI clinical note assist |
| P2-07 | EMR templates |
| P2-08 | Kafka event bus |

---

## Technical Debt Backlog

| ID | Item | Priority |
|----|------|----------|
| TD-01 | Row Level Security in PostgreSQL | P1 |
| TD-02 | E2E test suite (Playwright) | P1 |
| TD-03 | Storybook component docs | P2 |
| TD-04 | OpenAPI spec generation from routes | P1 |
