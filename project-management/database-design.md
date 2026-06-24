# Database Design — Doctor CRM

**DBMS:** PostgreSQL 15+  
**ORM:** Sequelize  
**Convention:** snake_case tables/columns, UUID primary keys

---

## 1. Entity Relationship Overview

```
organizations ──┬── users
                ├── patients
                ├── appointments ──┬── consultations
                │                  └── payments
                ├── followups
                └── audit_logs

users (doctors/receptionists) ←── appointments.doctor_id
patients ←── appointments.patient_id
consultations ←── followups (optional link)
```

---

## 2. Tables

### organizations

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| address_line1 | VARCHAR(255) | |
| address_line2 | VARCHAR(255) | |
| city | VARCHAR(100) | |
| state | VARCHAR(100) | |
| pincode | VARCHAR(10) | |
| timezone | VARCHAR(50) | DEFAULT 'Asia/Kolkata' |
| status | ENUM | active, suspended, pending |
| working_hours | JSONB | Weekly schedule |
| settings | JSONB | Misc clinic config |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `slug`, `status`

---

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK → organizations, NULL for SUPER_ADMIN |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | |
| role | ENUM | super_admin, client_admin, doctor, receptionist |
| status | ENUM | active, disabled |
| specialization | VARCHAR(100) | Doctor only |
| consultation_fee | DECIMAL(10,2) | Doctor only |
| last_login_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, role)`, `email`, `(organization_id, status)`

---

### patients

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | |
| phone | VARCHAR(20) | NOT NULL |
| email | VARCHAR(255) | |
| date_of_birth | DATE | |
| gender | ENUM | male, female, other, prefer_not_to_say |
| address | TEXT | |
| blood_group | VARCHAR(5) | |
| emergency_contact | VARCHAR(20) | |
| notes | TEXT | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, phone)`, `(organization_id, last_name, first_name)`  
**Unique:** `(organization_id, phone)` — one record per phone per clinic

---

### appointments

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NOT NULL |
| patient_id | UUID | FK → patients |
| doctor_id | UUID | FK → users |
| scheduled_at | TIMESTAMPTZ | NOT NULL |
| duration_minutes | INT | DEFAULT 15 |
| status | ENUM | scheduled, confirmed, waiting, in_consultation, completed, cancelled, no_show |
| token_number | INT | Queue order per doctor/day |
| fee_amount | DECIMAL(10,2) | |
| notes | TEXT | |
| booked_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, scheduled_at)`, `(organization_id, doctor_id, scheduled_at)`, `(organization_id, patient_id)`, `(organization_id, status)`

---

### consultations

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NOT NULL |
| appointment_id | UUID | FK → appointments, UNIQUE |
| patient_id | UUID | FK → patients |
| doctor_id | UUID | FK → users |
| symptoms | TEXT | |
| diagnosis | TEXT | |
| notes | TEXT | |
| recommendations | TEXT | |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, patient_id, completed_at DESC)`, `(organization_id, doctor_id)`

---

### payments

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NOT NULL |
| appointment_id | UUID | FK → appointments |
| patient_id | UUID | FK → patients |
| amount | DECIMAL(10,2) | NOT NULL |
| amount_paid | DECIMAL(10,2) | DEFAULT 0 |
| payment_mode | ENUM | cash, upi, card, other |
| status | ENUM | pending, paid, partial, waived |
| collected_by | UUID | FK → users |
| paid_at | TIMESTAMPTZ | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, status)`, `(organization_id, created_at)`, `(organization_id, patient_id)`

---

### followups

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NOT NULL |
| patient_id | UUID | FK → patients |
| consultation_id | UUID | FK → consultations |
| doctor_id | UUID | FK → users |
| due_date | DATE | NOT NULL |
| status | ENUM | pending, completed, cancelled |
| notes | TEXT | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Indexes:** `(organization_id, due_date, status)`, `(organization_id, patient_id)`

---

### audit_logs

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| organization_id | UUID | FK, NULL for platform actions |
| user_id | UUID | FK → users |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | |
| entity_id | UUID | |
| metadata | JSONB | |
| ip_address | INET | |
| created_at | TIMESTAMPTZ | NOT NULL |

**Indexes:** `(organization_id, created_at DESC)`, `(entity_type, entity_id)`

**Note:** Append-only; no updates/deletes

---

## 3. Patient Snapshot — Optimized View

```sql
CREATE VIEW patient_snapshots AS
SELECT
  p.id AS patient_id,
  p.organization_id,
  COUNT(c.id) FILTER (WHERE c.completed_at IS NOT NULL) AS total_visits,
  MAX(c.completed_at) AS last_visit_date,
  (
    SELECT u.first_name || ' ' || u.last_name
    FROM consultations c2
    JOIN users u ON u.id = c2.doctor_id
    WHERE c2.patient_id = p.id AND c2.organization_id = p.organization_id
    ORDER BY c2.completed_at DESC NULLS LAST
    LIMIT 1
  ) AS last_doctor_name,
  (
    SELECT c2.diagnosis
    FROM consultations c2
    WHERE c2.patient_id = p.id AND c2.organization_id = p.organization_id
    ORDER BY c2.completed_at DESC NULLS LAST
    LIMIT 1
  ) AS last_diagnosis,
  (
    SELECT COUNT(*)
    FROM followups f
    WHERE f.patient_id = p.id AND f.organization_id = p.organization_id AND f.status = 'pending'
  ) AS pending_followups_count
FROM patients p
LEFT JOIN consultations c ON c.patient_id = p.id AND c.organization_id = p.organization_id
GROUP BY p.id, p.organization_id;
```

Recent notes fetched separately (last 3) to keep view lean.

---

## 4. Analytics — Materialized Queries

Peak hour/day computed via scheduled job or on-demand with Redis cache:

```sql
-- Peak hour (appointments by hour, last 30 days)
SELECT EXTRACT(HOUR FROM scheduled_at) AS hour, COUNT(*)
FROM appointments
WHERE organization_id = :orgId AND scheduled_at >= NOW() - INTERVAL '30 days'
GROUP BY 1 ORDER BY 2 DESC LIMIT 1;
```

---

## 5. Migrations Strategy

- Sequelize migrations in `backend/src/migrations/`
- Naming: `YYYYMMDDHHMMSS-description.js`
- Seed: Super Admin user + demo clinic (dev only)

---

## 6. Data Retention

| Data | Retention |
|------|-----------|
| Clinical records | Indefinite (clinic owns data) |
| Audit logs | 7 years |
| Redis cache | TTL-based |
| Session tokens | 7 days |

---

## 7. Tenant Isolation Rules

1. Every business table has `organization_id NOT NULL` (except users.super_admin)
2. All FKs include organization consistency check in service layer
3. Composite indexes lead with `organization_id`
4. Row Level Security (RLS) optional Phase 2 — app-layer sufficient for MVP
