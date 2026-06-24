# Known Issues

**Last updated:** 2026-05-30

---

## Open

| ID | Severity | Issue | Mitigation |
|----|----------|-------|------------|
| KI-004 | Low | Docker daemon not running in dev environment | Use local Postgres/Redis (documented in README) |
| KI-005 | Low | Node 18 warning for react-router v7 | Upgrade to Node 20+ recommended; build passes on 18 |
| KI-006 | Low | Frontend/backend port mismatch causes 401 on refresh | Set `VITE_API_URL` in `frontend/.env` to match backend `PORT` |

---

## Resolved

| ID | Resolution |
|----|------------|
| KI-001 | Codebase scaffolded — Sprint 1 complete |
| KI-002 | Documented: video billing/inventory is design reference only |
| KI-003 | Design architecture approved 2026-05-30 |

---

## Watch List

| ID | Risk | Monitoring |
|----|------|------------|
| WL-001 | Patient snapshot performance | Sprint 6 |
| WL-002 | Tenant data leakage | Isolation tests each sprint |
| WL-003 | Appointment double-booking | Sprint 4 |
