# MaatriDev MedicCare CRM

Full-stack medical CRM with dashboard analytics, role-based access, and SQLite persistence.

## Features

- **Dashboard** — OPD Footfall chart, Department Load bars, bed occupancy, KPI cards with animated counters
- **Patients** — Registry with triage risk levels, phone, email, blood group
- **Appointments** — Scheduling, reschedule, cancel with notes
- **Doctors & Staff** — Provider capacity and roster management
- **Lab & Rx** — Lab reports and active prescriptions
- **Billing** — Invoices with payment status tracking
- **Inventory** — Stock alerts and department kit requests
- **Notifications** — Real-time alerts for critical patients, low stock, pending appointments
- **Activity Log** — Audit trail of all system actions
- **Dark Mode** — Toggle with persistent preference
- **Auth** — JWT login with Admin, Doctor, Receptionist roles

## Database

SQLite database auto-created at `server/mediccare.db` with 12 tables. See `server/schema.sql` for full schema.

| Table | Purpose |
|-------|---------|
| users | Authentication & roles |
| patients | Patient records |
| appointments | Scheduling |
| doctors | Provider roster |
| staff | Staff roster |
| departments | Hospital departments & beds |
| invoices | Billing |
| inventory_items | Pharmacy stock |
| kit_requests | Department supply requests |
| lab_reports | Diagnostic results |
| prescriptions | Active medications |
| footfall | OPD analytics data |
| activity_log | Audit trail |

## Quick Start

```bash
npm install
npm start
```

Open **http://localhost:5001**

### Demo Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mediccare.com | admin123 |
| Doctor | doctor@mediccare.com | doctor123 |
| Receptionist | reception@mediccare.com | reception123 |

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/dashboard?period=7d` | Chart data |
| GET | `/api/:entity` | List records |
| POST | `/api/:entity` | Create record |
| PUT | `/api/:entity/:id` | Update record |
| DELETE | `/api/:entity/:id` | Delete record |

Entities: `patients`, `appointments`, `doctors`, `staff`, `invoices`, `inventory_items`, `kit_requests`

## Stack

- **Frontend** — Vanilla JS, CSS (Inter font)
- **Backend** — Node.js, Express 5
- **Database** — SQLite3 (auto-seeded on first run)
