# RBAC Matrix — Doctor CRM

**Roles:** SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST

**Legend:** ✅ Allowed | ❌ Denied | 🔶 Own/assigned only | 🏢 Own organization only

---

## Platform — Organizations

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| List all clinics | ✅ | ❌ | ❌ | ❌ |
| Create clinic | ✅ | ❌ | ❌ | ❌ |
| Edit clinic | ✅ | ❌ | ❌ | ❌ |
| Activate clinic | ✅ | ❌ | ❌ | ❌ |
| Suspend clinic | ✅ | ❌ | ❌ | ❌ |
| Create client admin | ✅ | ❌ | ❌ | ❌ |
| View platform analytics | ✅ | ❌ | ❌ | ❌ |

---

## Organization — Users

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| List users | ❌ | 🏢 ✅ | ❌ | ❌ |
| Create doctor | ❌ | 🏢 ✅ | ❌ | ❌ |
| Edit doctor | ❌ | 🏢 ✅ | ❌ | ❌ |
| Disable doctor | ❌ | 🏢 ✅ | ❌ | ❌ |
| Create receptionist | ❌ | 🏢 ✅ | ❌ | ❌ |
| Edit receptionist | ❌ | 🏢 ✅ | ❌ | ❌ |
| Disable receptionist | ❌ | 🏢 ✅ | ❌ | ❌ |

---

## Clinic Settings

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| View clinic info | ❌ | 🏢 ✅ | ❌ | ❌ |
| Edit clinic info | ❌ | 🏢 ✅ | ❌ | ❌ |
| Manage working hours | ❌ | 🏢 ✅ | ❌ | ❌ |
| Configure doctor fees | ❌ | 🏢 ✅ | ❌ | ❌ |

---

## Patients

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| List patients | ❌ | 🏢 ✅ | 🏢 ✅ | 🏢 ✅ |
| Search patients | ❌ | 🏢 ✅ | 🏢 ✅ | 🏢 ✅ |
| Create patient | ❌ | ❌ | ❌ | 🏢 ✅ |
| Edit patient | ❌ | ❌ | ❌ | 🏢 ✅ |
| View patient profile | ❌ | 🏢 ✅ | 🏢 ✅ | 🏢 ✅ |
| View patient snapshot | ❌ | ❌ | 🏢 ✅ | 🏢 ✅ |
| Delete patient | ❌ | ❌ | ❌ | ❌ (MVP — soft archive Phase 2) |

---

## Appointments

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| List appointments | ❌ | 🏢 ✅ | 🔶 ✅ | 🏢 ✅ |
| Book appointment | ❌ | ❌ | ❌ | 🏢 ✅ |
| Reschedule | ❌ | ❌ | ❌ | 🏢 ✅ |
| Cancel | ❌ | ❌ | ❌ | 🏢 ✅ |
| View own schedule | ❌ | ❌ | 🔶 ✅ | ❌ |

---

## Queue

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| View doctor-wise queue | ❌ | ❌ | 🔶 ✅ | 🏢 ✅ |
| Call next patient | ❌ | ❌ | 🔶 ✅ | ❌ |
| Update waiting status | ❌ | ❌ | ❌ | 🏢 ✅ |

---

## Consultations

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| Start consultation | ❌ | ❌ | 🔶 ✅ | ❌ |
| Record symptoms/diagnosis | ❌ | ❌ | 🔶 ✅ | ❌ |
| Complete consultation | ❌ | ❌ | 🔶 ✅ | ❌ |
| View patient history | ❌ | ❌ | 🔶 ✅ | ❌ |
| View all consultations | ❌ | 🏢 ✅ (read) | ❌ | ❌ |

---

## Payments

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| Collect consultation fee | ❌ | ❌ | ❌ | 🏢 ✅ |
| View payment status | ❌ | 🏢 ✅ | ❌ | 🏢 ✅ |
| Record partial payment | ❌ | ❌ | ❌ | 🏢 ✅ |
| Waive payment | ❌ | 🏢 ✅ | ❌ | ❌ |

---

## Follow-ups

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| Recommend follow-up date | ❌ | ❌ | 🔶 ✅ | ❌ |
| View pending follow-ups | ❌ | 🏢 ✅ | 🔶 ✅ | 🏢 ✅ |
| View today's follow-ups | ❌ | 🏢 ✅ | 🔶 ✅ | 🏢 ✅ |
| Mark follow-up complete | ❌ | ❌ | 🔶 ✅ | 🏢 ✅ |

---

## Analytics

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| Platform analytics | ✅ | ❌ | ❌ | ❌ |
| Revenue analytics | ❌ | 🏢 ✅ | ❌ | ❌ |
| Patient analytics | ❌ | 🏢 ✅ | ❌ | ❌ |
| Appointment analytics | ❌ | 🏢 ✅ | ❌ | ❌ |
| Doctor analytics | ❌ | 🏢 ✅ | ❌ | ❌ |
| Peak hour/day insights | ❌ | 🏢 ✅ | ❌ | ❌ |
| Reception dashboard KPIs | ❌ | ❌ | ❌ | 🏢 ✅ |
| Doctor dashboard KPIs | ❌ | ❌ | 🔶 ✅ | ❌ |

---

## System

| Action | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|--------|:-----------:|:------------:|:------:|:------------:|
| Login | ✅ | ✅ | ✅ | ✅ |
| Change own password | ✅ | ✅ | ✅ | ✅ |
| View audit logs | ✅ (platform) | 🏢 ✅ (Phase 2) | ❌ | ❌ |

---

## Middleware Mapping

```javascript
const permissions = {
  'organizations:*': ['SUPER_ADMIN'],
  'users:write': ['CLIENT_ADMIN'],
  'patients:write': ['RECEPTIONIST'],
  'patients:snapshot': ['DOCTOR', 'RECEPTIONIST'],
  'appointments:write': ['RECEPTIONIST'],
  'queue:call': ['DOCTOR'],
  'consultations:write': ['DOCTOR'],
  'payments:write': ['RECEPTIONIST'],
  'followups:write': ['DOCTOR'],
  'followups:complete': ['DOCTOR', 'RECEPTIONIST'],
  'analytics:platform': ['SUPER_ADMIN'],
  'analytics:clinic': ['CLIENT_ADMIN'],
  'analytics:reception': ['RECEPTIONIST'],
  'analytics:doctor': ['DOCTOR'],
};
```

---

## Tenant Isolation Rules

1. SUPER_ADMIN bypasses `organization_id` filter only on `/organizations` and `/analytics/platform`
2. All other roles: `req.tenantId` MUST match resource `organization_id`
3. DOCTOR "own" scope: `doctor_id = req.user.id`
4. Cross-tenant access → **403** (never 404 to prevent enumeration)
