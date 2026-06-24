# Doctor CRM — Clinic Management SaaS

Multi-tenant clinic management platform (MVP pilot).

## Stack

- **Frontend:** React, MUI, React Router, React Query, Axios
- **Backend:** Node.js, Express, Sequelize, PostgreSQL, Redis
- **Auth:** JWT + HttpOnly refresh cookies

## Quick Start

### 1. Start infrastructure

```bash
cd docker
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

API: http://localhost:4000  
Health: http://localhost:4000/health

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL to match backend PORT
npm install
npm run dev
```

App: http://localhost:5173

**Important:** `frontend/.env` → `VITE_API_URL` must match `backend/.env` → `PORT` (e.g. both `4001`).

### Demo logins (run `npm run seed` in backend first)

| Role | Email | Password | After login |
|------|-------|----------|-------------|
| **Super Admin** | `admin@doctorcrm.com` | `Admin@123456` | `/super-admin/dashboard` |
| **Client Admin** | `admin@democlinic.com` | `Demo@123456` | `/admin/dashboard` |
| **Doctor** | `doctor@democlinic.com` | `Demo@123456` | `/doctor/dashboard` |
| **Receptionist** | `reception@democlinic.com` | `Demo@123456` | `/reception/dashboard` |

All clinic roles belong to **Demo Clinic** (`demo-clinic` tenant).

**How to test each role:** Log out → log in with that row’s email/password → you should land on that role’s dashboard. Wrong role routes redirect to the correct home (e.g. doctor cannot open `/admin/*`).

To recreate demo users:

```bash
cd backend
npm run seed
```

## Databases (dev · test · staging · production)

Each environment uses its **own PostgreSQL database** so data never mixes:

| Database | Purpose | Env variable |
|----------|---------|----------------|
| `doctor_crm` | Local dev, seed data | `DATABASE_URL` |
| `doctor_crm_test` | Jest (`npm test`) only | `TEST_DATABASE_URL` |
| `doctor_crm_staging` | Pre-production / QA | `STAGING_DATABASE_URL` |
| `doctor_crm_production` | Live deploy | `PRODUCTION_DATABASE_URL` |

Copy env templates:

```bash
cd backend
cp .env.example .env
cp .env.test.example .env.test      # optional
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

### One-time setup

```bash
cd backend
npm run db:setup           # dev + test
npm run db:setup:all       # dev + test + staging
npm run seed               # demo users → dev DB only
```

Per-environment only:

```bash
npm run db:create:test
npm run db:setup:staging
npm run migrate:production   # after PRODUCTION_DATABASE_URL is set
```

Run staging API locally:

```bash
cd backend
npm run dev:staging          # port 4002, uses .env.staging
# or from repo root:
.\scripts\start-staging.ps1
```

Production (Docker):

```bash
cd docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis backend
```

Production migrations only:

```bash
cd backend
# set PRODUCTION_DATABASE_URL in .env.production first
npm run migrate:production
```

### Tests (test DB only)

```bash
cd backend
npm test
```

## Project docs

See `/project-management` and `/docs/design` for architecture, API contracts, and sprint plans.
