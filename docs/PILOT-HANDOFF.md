# Pilot Launch Handoff — Doctor CRM MVP

**Status:** All 8 sprints implemented (pilot-ready baseline)

## Quick Start (Development)

```bash
# Infrastructure
cd docker && docker compose up -d

# Backend
cd backend && npm install && npm run migrate && npm run seed && npm start

# Frontend
cd frontend && npm install && npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@doctorcrm.com | (see backend/.env) |
| Client Admin | admin@democlinic.com | Demo@123456 |
| Doctor | doctor@democlinic.com | Demo@123456 |
| Receptionist | reception@democlinic.com | Demo@123456 |

## Production Pilot

```bash
cd docker
cp ../backend/.env.production.example ../backend/.env.production
# Edit secrets, then:
docker compose -f docker-compose.prod.yml up -d --build
```

## Feature Coverage

- S1–S3: Auth, Super Admin, Client Admin settings/users ✅
- S4: Patients + Appointments ✅
- S5: Payments, reception dashboard, CSV export, toasts ✅
- S6: Queue, consultations, patient snapshot (Redis cache) ✅
- S7: Follow-ups, clinic/reception/doctor analytics ✅
- S8: Error pages, prod docker config, seed script, docs ✅

## Known Limitations (Pilot)

- Email delivery logs to console in dev (configure SMTP for production)
- Analytics doctor breakdown uses placeholders for per-doctor patient counts
- Patient delete not implemented (by design for MVP)

## Support

See `/project-management/qa-checklist.md` for regression testing before go-live.
