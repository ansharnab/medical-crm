# MaatriDev MedicCare CRM

Full-stack medical CRM with dashboard analytics, role-based access, and SQLite persistence.

## Features

- **Dashboard** — OPD Footfall chart, Department Load bars, KPI cards
- **Patients** — Registry with triage risk levels
- **Appointments** — Scheduling, reschedule, cancel
- **Doctors & Staff** — Provider capacity and roster management
- **Billing** — Invoices with payment status tracking
- **Inventory** — Stock alerts and department kit requests
- **Auth** — JWT login with Admin, Doctor, Receptionist roles

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
