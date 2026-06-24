# Product Roadmap — Doctor CRM / Clinic Management SaaS

**Vision:** Multi-tenant clinic operating system for Indian clinics — pilot MVP → paid SaaS → full clinic ecosystem.

---

## Phase 0 — Foundation (Weeks 1–2) ← **CURRENT**

| Milestone | Deliverable | Status |
|-----------|-------------|--------|
| M0.1 | Design analysis + design system | ✅ Complete |
| M0.2 | Architecture + database design | ✅ Complete |
| M0.3 | API contracts + RBAC matrix | ✅ Complete |
| M0.4 | Sprint plan + QA strategy | ✅ Complete |
| M0.5 | Stakeholder approval gate | ✅ Approved 2026-05-30 |

---

## Phase 1 — MVP Pilot (Weeks 3–10)

**Goal:** Onboard 3–5 pilot clinics with core workflows.

| Release | Features | Target |
|---------|----------|--------|
| R1.0 | Auth, multi-tenant core, Super Admin clinic mgmt | Week 4 |
| R1.1 | Client Admin users + clinic settings | Week 5 |
| R1.2 | Receptionist: patients, appointments, payments | Week 7 |
| R1.3 | Doctor: queue, consultation, patient snapshot | Week 8 |
| R1.4 | Analytics dashboards + follow-ups | Week 9 |
| R1.5 | QA hardening, security review, pilot launch | Week 10 |

---

## Phase 2 — Pilot Feedback (Weeks 11–16)

| Feature | Priority |
|---------|----------|
| Prescription PDF export | High |
| SMS/WhatsApp appointment reminders | High |
| Advanced search + filters | Medium |
| Audit log viewer UI | Medium |
| Bulk import patients (CSV) | Medium |
| Clinic branding (logo, colors) | Low |

---

## Phase 3 — Commercial SaaS (Months 5–8)

| Feature | Notes |
|---------|-------|
| Subscription billing (Stripe/Razorpay) | Per-clinic pricing tiers |
| Usage metering | Users, appointments/month |
| Self-serve clinic signup | Reduce Super Admin bottleneck |
| SLA monitoring + status page | Production ops |

---

## Phase 4 — Clinic Ecosystem (Months 9–18)

| Module | Description |
|--------|-------------|
| Pharmacy management | Inventory, dispensing |
| Lab orders | External lab integration |
| EMR expansion | Structured clinical templates |
| WhatsApp automation | Follow-up, reminders |
| AI assist | Note summarization, triage suggestions |
| Mobile apps | Doctor + receptionist native |
| Advanced analytics | Cohort, retention, forecasting |

---

## Non-Goals (MVP)

- Microservices architecture
- Kafka (unless audit/event volume requires it)
- Full billing/insurance desk (reference video only)
- Inventory management
- Native mobile apps

---

## Success Metrics — Pilot

| Metric | Target |
|--------|--------|
| Clinic onboarding time | < 30 min |
| Appointment booking time | < 60 sec |
| Patient snapshot load | < 200ms p95 |
| Tenant isolation incidents | 0 |
| Uptime | 99.5% |
| Pilot clinic NPS | ≥ 40 |
