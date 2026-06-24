# Architecture Document — Doctor CRM

**Version:** 1.0  
**Pattern:** Modular Monolith  
**Deployment:** AWS

---

## 1. System Context

```
┌─────────────┐     HTTPS      ┌──────────────────────────────────┐
│ React SPA   │ ◄────────────► │ Express API (Modular Monolith)    │
│ MUI + RQ    │                │  ├─ auth module                   │
└─────────────┘                │  ├─ organizations module          │
                               │  ├─ users module                  │
                               │  ├─ patients module               │
                               │  ├─ appointments module           │
                               │  ├─ consultations module          │
                               │  ├─ payments module               │
                               │  ├─ followups module              │
                               │  ├─ analytics module              │
                               │  └─ audit module                  │
                               └───────┬──────────┬────────────────┘
                                       │          │
                               ┌───────▼──┐  ┌────▼─────┐  ┌────────┐
                               │PostgreSQL│  │  Redis   │  │  S3    │
                               └──────────┘  └──────────┘  └────────┘
```

---

## 2. Architectural Principles

1. **Modular monolith** — bounded modules, clear interfaces; extract to services only when proven necessary
2. **Tenant-first** — every business query scoped by `organization_id`
3. **Service layer** — controllers thin; business logic in services
4. **Repository pattern** — data access isolated per entity
5. **DTO validation** — Joi/Zod at API boundary
6. **Fail secure** — deny by default on authz failures

---

## 3. Module Boundaries

| Module | Responsibility |
|--------|----------------|
| `auth` | Login, JWT, refresh tokens, password hash |
| `organizations` | Clinic CRUD, activate/suspend (Super Admin) |
| `users` | User CRUD, role assignment, disable |
| `patients` | Patient CRUD, search, **snapshot aggregation** |
| `appointments` | Booking, status lifecycle, doctor assignment |
| `consultations` | Clinical notes, symptoms, diagnosis |
| `payments` | Fee collection, payment modes, status |
| `followups` | Schedule, pending/today views |
| `analytics` | Aggregated metrics, peak hour/day |
| `audit` | Immutable audit log writes |

---

## 4. Folder Structure

```
medical-crm-mvp/
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/              # Axios clients per domain
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   └── domain/
│       ├── hooks/
│       ├── pages/            # Route-level pages by role
│       ├── routes/
│       ├── theme/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
├── backend/
│   └── src/
│       ├── config/
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── tenant.middleware.js
│       │   ├── rbac.middleware.js
│       │   └── error.middleware.js
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.js
│       │   │   ├── auth.service.js
│       │   │   ├── auth.routes.js
│       │   │   └── auth.dto.js
│       │   ├── organizations/
│       │   ├── users/
│       │   ├── patients/
│       │   ├── appointments/
│       │   ├── consultations/
│       │   ├── payments/
│       │   ├── followups/
│       │   ├── analytics/
│       │   └── audit/
│       ├── models/           # Sequelize models
│       ├── repositories/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── docs/
│   └── design/
├── project-management/
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── scripts/
    ├── migrate.sh
    └── seed-pilot.sh
```

---

## 5. Request Flow

```
HTTP Request
  → auth.middleware (verify JWT)
  → tenant.middleware (resolve organization_id from token; reject cross-tenant)
  → rbac.middleware (check role + permission)
  → controller (parse DTO)
  → service (business logic)
  → repository (Sequelize query WITH organization_id)
  → response / error.middleware
```

---

## 6. Authentication

| Token | TTL | Storage |
|-------|-----|---------|
| Access JWT | 15 min | Memory (frontend) |
| Refresh token | 7 days | HttpOnly cookie + Redis session |

**JWT Claims:** `sub`, `email`, `role`, `organization_id` (null for SUPER_ADMIN), `iat`, `exp`

**Password:** bcrypt cost factor 12

---

## 7. Multi-Tenancy

| Role | organization_id in JWT |
|------|------------------------|
| SUPER_ADMIN | null — platform scope |
| CLIENT_ADMIN | required |
| DOCTOR | required |
| RECEPTIONIST | required |

**Enforcement layers:**
1. Middleware injects `req.tenantId`
2. Repository base class auto-appends `WHERE organization_id = :tenantId`
3. Integration tests per endpoint for cross-tenant access denial

---

## 8. Caching Strategy (Redis)

| Key Pattern | TTL | Use |
|-------------|-----|-----|
| `snapshot:org:{id}:patient:{id}` | 60s | Patient snapshot |
| `analytics:org:{id}:dashboard` | 300s | Client admin dashboard |
| `session:refresh:{tokenId}` | 7d | Refresh token validation |
| `ratelimit:{ip}` | 1min | Login rate limit |

**Invalidation:** On patient/consultation/followup write → delete snapshot key

---

## 9. Storage (S3 Compatible)

| Bucket Path | Use |
|-------------|-----|
| `{org_id}/exports/` | CSV/PDF exports |
| `{org_id}/attachments/` | Future: reports, prescriptions |

MVP: exports only

---

## 10. Messaging — Kafka Decision

**Decision:** **Not in MVP**

Rationale: Audit logs written synchronously to PostgreSQL. Revisit when:
- >1000 events/sec per tenant, OR
- Async notification workers needed at scale

See `decision-log.md` ADR-003.

---

## 11. Observability

| Layer | Tool |
|-------|------|
| Logs | Winston → CloudWatch |
| Metrics | Prometheus-compatible / CloudWatch |
| Errors | Sentry |
| Health | `GET /health`, `GET /ready` |

Structured log fields: `requestId`, `userId`, `organizationId`, `module`, `action`

---

## 12. AWS Deployment (Target)

```
Route 53 → CloudFront → S3 (frontend static)
                      → ALB → ECS Fargate (backend)
                              → RDS PostgreSQL
                              → ElastiCache Redis
                              → S3 (files)
```

**Environments:** dev, staging, production

---

## 13. Security Checklist

- [ ] HTTPS only
- [ ] CORS restricted to frontend origin
- [ ] Helmet.js headers
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Sequelize parameterized)
- [ ] Rate limiting on auth endpoints
- [ ] Secrets in AWS Secrets Manager
- [ ] RDS encryption at rest
- [ ] Tenant isolation integration tests

---

## 14. Performance Targets

| Endpoint | p95 |
|----------|-----|
| Patient snapshot | < 200ms |
| Dashboard analytics | < 500ms |
| Patient search | < 300ms |
| Appointment list (today) | < 250ms |

---

## 15. Scalability Path (12–24 months)

1. Read replicas for analytics queries
2. Connection pooling (PgBouncer)
3. Horizontal ECS scaling on CPU/latency
4. Extract notification service if WhatsApp/SMS added
5. Consider CQRS for analytics if dashboards slow writes
