# Backend Roadmap — Doctor CRM (Smooth Build Plan)

**Status:** MVP backend live (auth, patients, appointments, queue, consultations, payments, analytics).  
**Next:** Wire NEW frontend modules to APIs in phased sprints — no big-bang rewrite.

---

## Current Backend (What Works Today)

| Module | API prefix | Notes |
|--------|------------|-------|
| Auth | `/api/v1/auth` | JWT + refresh cookie, multi-clinic login |
| Organizations | `/api/v1/organizations` | Super admin clinics |
| Users | `/api/v1/users` | Doctors, receptionists, admins |
| Patients | `/api/v1/patients` | CRUD + search |
| Appointments | `/api/v1/appointments` | Book, list, cancel |
| Queue | `/api/v1/queue` | Board, call next |
| Consultations | `/api/v1/consultations` | Start, notes, complete |
| Payments | `/api/v1/payments` | Collect fee (single payment) |
| Follow-ups | `/api/v1/followups` | Recommend + complete |
| Analytics | `/api/v1/analytics` | Clinic + platform KPIs |
| Settings | `/api/v1/settings` | Clinic info, hours, fees |

**Stack:** Node.js · Express · PostgreSQL · Redis · Prisma (or equivalent ORM in repo)

---

## Phase 2 — High Value (4–6 weeks)

Build in this order — each unlocks frontend modules already UI-ready.

### Sprint 1 — Billing & Invoices
**Frontend:** `/admin/billing`, `/reception/billing` (mock → API)

```
Tables: invoices, invoice_lines, invoice_payments
Endpoints:
  GET    /api/v1/invoices
  POST   /api/v1/invoices
  GET    /api/v1/invoices/:id
  POST   /api/v1/invoices/:id/payments      # partial pay
  POST   /api/v1/invoices/:id/refund
  GET    /api/v1/billing/daily-closing?date=
```

**Smooth tips:**
- Link invoice to `appointment_id` + `patient_id`
- GST fields: `amount`, `gst_rate`, `gst_amount`, `total`
- Idempotent payment webhooks later (Razorpay)

### Sprint 2 — E-Prescription
**Frontend:** `/doctor/consultations/:id/prescription`

```
Tables: prescriptions, prescription_items
Endpoints:
  GET/POST /api/v1/consultations/:id/prescription
  GET      /api/v1/prescriptions/:id/pdf       # puppeteer or pdfkit
```

**Smooth tips:**
- Reuse `consultation_id` as parent
- Medicine master table optional (start with free text + dosage)
- Drug interaction: rule table or external API stub

### Sprint 3 — Communications (SMS / WhatsApp)
**Frontend:** `/admin/communications`

```
Tables: message_templates, message_logs
Endpoints:
  POST /api/v1/communications/send
  GET  /api/v1/communications/logs
  CRUD /api/v1/communications/templates
```

**Integrations:**
- Twilio / MSG91 for SMS
- WhatsApp Business API or Gupshup (India)
- Queue sends via Bull/Redis job — never block HTTP

### Sprint 4 — Audit Log
**Frontend:** `/admin/audit`

```
Table: audit_events (user_id, org_id, action, entity, entity_id, meta JSON, ip, created_at)
Middleware: log on POST/PATCH/DELETE for sensitive routes
GET /api/v1/audit?from=&to=&user=
```

**Smooth tips:** Append-only table, no updates/deletes

---

## Phase 3 — Operations Scale (6–8 weeks)

### Pharmacy
```
Tables: pharmacy_items, stock_movements, dispense_records
Endpoints: inventory CRUD, dispense from prescription_id, low-stock alerts
```

### Lab Orders
```
Tables: lab_orders, lab_results
Endpoints: order from consultation, upload result file (S3/local), patient trend API
```

### Patient Portal (separate auth)
```
Tables: portal_users (link patient_id), portal_sessions
Endpoints: magic-link login, book slot, pay invoice, download Rx PDF
Route: /portal/* (public, rate-limited)
```

### Forgot Password
```
POST /api/v1/auth/forgot-password  → email token
POST /api/v1/auth/reset-password   → new password
Use: nodemailer + Redis token TTL 1h
```

---

## Phase 4 — Platform / SaaS (8+ weeks)

| Feature | Backend work |
|---------|----------------|
| Subscription plans | `plans`, `org_subscriptions`, Stripe/Razorpay billing |
| Multi-branch | `branches` table, `organization_id` on all entities |
| Real-time queue TV | WebSocket/SSE: `queue:updated` per clinic |
| Advanced analytics | Materialized views / nightly jobs for cohorts |
| ABDM / Health ID | Integration adapter layer (don't bake into core) |

---

## Architecture Principles (Smooth = No Pain Later)

### 1. Multi-tenancy first
Every query filters by `organization_id` from JWT. Never trust client org id.

### 2. API versioning
Keep `/api/v1/*`. Breaking changes → v2, not silent breaks.

### 3. Job queue for slow work
Email, SMS, PDF, exports → Redis + BullMQ workers.

### 4. File storage abstraction
```typescript
interface StorageAdapter { upload(file): Promise<url> }
// local dev → ./uploads | prod → S3
```

### 5. Frontend swap pattern (mock → real)
Each NEW page already uses mock data in `frontend/src/data/mockModules.ts`.  
Replace with React Query hooks one module at a time:

```typescript
// Before
const [invoices, setInvoices] = useState(mockInvoices);

// After
const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });
```

### 6. Database migrations
One migration per sprint. Seed demo data for invoices/Rx in `npm run seed`.

---

## Recommended Build Order (Summary)

```
Week 1-2:  Billing API + wire frontend
Week 3:    E-Prescription API + PDF
Week 4:    Communications queue + templates
Week 5:    Audit middleware + forgot password
Week 6+:   Pharmacy → Labs → Portal → WebSocket queue
```

---

## Environment Checklist (Production)

| Service | Dev | Prod |
|---------|-----|------|
| PostgreSQL | `.local/postgres` | RDS / managed |
| Redis | `.local/redis` | ElastiCache / Upstash |
| Email | Mailtrap | SendGrid / SES |
| SMS | Console log | MSG91 / Twilio |
| Payments | Mock | Razorpay |
| Files | `./uploads` | S3 + CloudFront |

---

## What You Can Demo Right Now

| Asset | URL / path |
|-------|------------|
| **Live MVP app** | `http://localhost:5173` (all roles) |
| **Premium HTML prototype** | `docs/design/wireframe-demo.html` |
| **NEW module UI (mock)** | Login → Admin/Reception/Doctor → Billing, Pharmacy, etc. |
| **Patient portal preview** | `http://localhost:5173/portal` |
| **Queue TV** | `http://localhost:5173/reception/queue/tv` |

Backend work starts when you say **"Sprint 1 billing"** — frontend is ready to plug in.
