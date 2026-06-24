# Architecture Decision Log

**Format:** ADR — Architecture Decision Record

---

## ADR-001: Modular Monolith over Microservices

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** MVP pilot for 3–5 clinics; team size small; need fast iteration.

**Decision:** Single Express deployable with bounded modules.

**Consequences:**
- (+) Simpler ops, transactions, debugging
- (+) Lower AWS cost for pilot
- (-) Must enforce module boundaries in code review
- Revisit at 500+ clinics or 50k daily appointments

---

## ADR-002: JWT + Refresh Token Auth

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** SPA frontend needs stateless auth with secure session renewal.

**Decision:** Short-lived access JWT (15 min) + HttpOnly refresh cookie stored in Redis.

**Consequences:**
- (+) Standard pattern, works with React Query
- (+) Can revoke sessions via Redis delete
- (-) Requires careful XSS prevention (no refresh in localStorage)

---

## ADR-003: No Kafka in MVP

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Prompt allows Kafka only if genuinely required.

**Decision:** Synchronous audit log writes to PostgreSQL; no message broker in MVP.

**Consequences:**
- (+) Reduced infrastructure complexity
- (-) Async notifications deferred to Phase 2
- Trigger for adoption: >1000 events/sec or required async workers

---

## ADR-004: Redis for Cache Only (Not Primary Store)

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Patient snapshot and analytics need sub-200ms reads.

**Decision:** Redis caches snapshot + dashboard aggregates; PostgreSQL is source of truth.

**Consequences:**
- (+) Performance without premature optimization
- (-) Cache invalidation logic required on writes
- TTL: snapshot 60s, analytics 300s

---

## ADR-005: Material UI with Custom Theme

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Required stack includes MUI; video reference has distinct visual language.

**Decision:** MUI component library with custom theme tokens matching design system (not default MUI look).

**Consequences:**
- (+) Accessible components out of box
- (+) Faster delivery than fully custom CSS
- (-) Must override default MUI styles consistently

---

## ADR-006: organization_id on Every Business Table

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Multi-tenant SaaS; data leakage is critical bug.

**Decision:** Mandatory `organization_id` column; repository layer enforces scope; SUPER_ADMIN exempt only on platform routes.

**Consequences:**
- (+) Defense in depth
- (-) Slightly more verbose queries
- Phase 2: optional PostgreSQL RLS as third layer

---

## ADR-007: INR Currency for Pilot

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Reference video uses ₹; pilot targets Indian clinics.

**Decision:** Store amounts as DECIMAL; display with ₹; timezone default Asia/Kolkata.

**Consequences:**
- (+) Matches pilot market
- (-) i18n expansion needed for other markets later

---

## ADR-008: Do Not Clone Reference Product Workflows

**Status:** Accepted  
**Date:** 2026-05-30

**Context:** Video shows Billing, Inventory, Triage — not all in our MVP spec.

**Decision:** Adopt visual design only; implement our RBAC workflows (Receptionist payments ≠ full billing desk).

**Consequences:**
- (+) Clear product differentiation
- (+) MVP scope control
- (-) Stakeholders must understand reference ≠ spec

---

## Pending Decisions

| ID | Question | Options | Target Date |
|----|----------|---------|-------------|
| PD-001 | S3 provider for dev | LocalStack vs MinIO vs AWS | Sprint 1 |
| PD-002 | E2E framework timing | Playwright Sprint 8 vs earlier | Sprint 1 |
| PD-003 | Email service for password reset | SES vs SendGrid | Phase 2 |
