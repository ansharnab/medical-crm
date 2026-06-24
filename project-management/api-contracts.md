# API Contracts — Doctor CRM v1

**Base URL:** `/api/v1`  
**Auth:** Bearer JWT (access token)  
**Content-Type:** `application/json`  
**Errors:** `{ "error": { "code": "STRING", "message": "string", "details": [] } }`

---

## Common Headers

| Header | Required |
|--------|----------|
| Authorization | Yes (except auth endpoints) |
| X-Request-Id | Optional (generated if missing) |

---

## Auth

### POST /auth/login

**Body:**
```json
{ "email": "admin@clinic.com", "password": "string" }
```

**Response 200:**
```json
{
  "accessToken": "jwt",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "client_admin",
    "organizationId": "uuid"
  }
}
```
Refresh token set as HttpOnly cookie.

---

### POST /auth/refresh

**Response 200:** `{ "accessToken": "jwt" }`

---

### POST /auth/logout

**Response 204**

---

## Organizations (Super Admin)

### GET /organizations

**Query:** `status`, `page`, `limit`, `search`  
**Role:** SUPER_ADMIN

**Response 200:**
```json
{
  "data": [{ "id", "name", "city", "status", "createdAt" }],
  "meta": { "page", "limit", "total" }
}
```

---

### POST /organizations

**Role:** SUPER_ADMIN

**Body:**
```json
{
  "name": "City Clinic",
  "email": "contact@cityclinic.com",
  "phone": "+919876543210",
  "addressLine1": "string",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response 201:** Organization object

---

### PATCH /organizations/:id

**Role:** SUPER_ADMIN  
**Body:** Partial org fields + `status: active|suspended`

---

### POST /organizations/:id/client-admins

**Role:** SUPER_ADMIN

**Body:**
```json
{
  "email": "admin@cityclinic.com",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string"
}
```

---

## Users

### GET /users

**Role:** CLIENT_ADMIN  
**Query:** `role`, `status`, `page`, `limit`

---

### POST /users

**Role:** CLIENT_ADMIN

**Body (doctor):**
```json
{
  "email": "dr@clinic.com",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "doctor",
  "specialization": "General Medicine",
  "consultationFee": 500
}
```

**Body (receptionist):** Same without specialization/consultationFee

---

### PATCH /users/:id

**Role:** CLIENT_ADMIN  
**Body:** Partial user + `status: active|disabled`

---

## Clinic Settings

### GET /settings/clinic

**Role:** CLIENT_ADMIN

---

### PATCH /settings/clinic

**Role:** CLIENT_ADMIN  
**Body:** Clinic info fields

---

### GET /settings/working-hours

**Role:** CLIENT_ADMIN

**Response:**
```json
{
  "monday": { "open": "09:00", "close": "18:00", "closed": false },
  "tuesday": { ... }
}
```

---

### PUT /settings/working-hours

**Role:** CLIENT_ADMIN

---

### GET /settings/doctor-fees

**Role:** CLIENT_ADMIN

---

### PUT /settings/doctor-fees/:doctorId

**Role:** CLIENT_ADMIN  
**Body:** `{ "consultationFee": 500 }`

---

## Patients

### GET /patients

**Role:** RECEPTIONIST, DOCTOR, CLIENT_ADMIN  
**Query:** `search`, `page`, `limit`

---

### POST /patients

**Role:** RECEPTIONIST

**Body:**
```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "phone": "+919876543210",
  "email": "optional",
  "dateOfBirth": "1985-03-15",
  "gender": "male"
}
```

---

### GET /patients/:id

**Role:** RECEPTIONIST, DOCTOR, CLIENT_ADMIN

---

### PATCH /patients/:id

**Role:** RECEPTIONIST

---

### GET /patients/:id/snapshot ⭐

**Role:** DOCTOR, RECEPTIONIST  
**Performance target:** p95 < 200ms

**Response 200:**
```json
{
  "patientId": "uuid",
  "totalVisits": 12,
  "lastVisitDate": "2026-05-15T10:30:00Z",
  "lastDoctorName": "Dr. Sharma",
  "lastDiagnosis": "Hypertension",
  "pendingFollowupsCount": 1,
  "recentConsultations": [
    {
      "id": "uuid",
      "completedAt": "2026-05-15T10:30:00Z",
      "doctorName": "Dr. Sharma",
      "diagnosis": "Hypertension",
      "notes": "Continue medication"
    }
  ]
}
```

---

## Appointments

### GET /appointments

**Query:** `date`, `doctorId`, `status`, `patientId`, `page`, `limit`  
**Role:** RECEPTIONIST, DOCTOR, CLIENT_ADMIN

---

### POST /appointments

**Role:** RECEPTIONIST

**Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "scheduledAt": "2026-05-30T10:00:00+05:30",
  "notes": "optional"
}
```

---

### PATCH /appointments/:id

**Role:** RECEPTIONIST  
**Body:** `{ "scheduledAt", "doctorId", "status", "notes" }`

---

### POST /appointments/:id/cancel

**Role:** RECEPTIONIST

---

## Queue

### GET /queue

**Query:** `doctorId`, `date` (default today)  
**Role:** RECEPTIONIST, DOCTOR

**Response:**
```json
{
  "doctors": [
    {
      "doctorId": "uuid",
      "doctorName": "Dr. Sharma",
      "waiting": [
        { "appointmentId", "tokenNumber", "patientName", "waitingSince" }
      ],
      "inConsultation": { ... }
    }
  ]
}
```

---

### POST /queue/:appointmentId/call-next

**Role:** DOCTOR  
**Effect:** Sets appointment status to `in_consultation`

---

## Consultations

### POST /consultations

**Role:** DOCTOR  
**Body:** `{ "appointmentId": "uuid" }` — starts consultation

---

### PATCH /consultations/:id

**Role:** DOCTOR

**Body:**
```json
{
  "symptoms": "string",
  "diagnosis": "string",
  "notes": "string",
  "recommendations": "string"
}
```

---

### POST /consultations/:id/complete

**Role:** DOCTOR  
**Effect:** Marks consultation + appointment completed

---

### GET /consultations/patient/:patientId

**Role:** DOCTOR  
**Query:** `page`, `limit` — visit history

---

## Payments

### GET /payments

**Query:** `date`, `status`, `patientId`  
**Role:** RECEPTIONIST, CLIENT_ADMIN

---

### POST /payments

**Role:** RECEPTIONIST

**Body:**
```json
{
  "appointmentId": "uuid",
  "amount": 500,
  "amountPaid": 500,
  "paymentMode": "cash",
  "status": "paid"
}
```

---

### PATCH /payments/:id

**Role:** RECEPTIONIST — partial payments

---

## Follow-ups

### GET /followups

**Query:** `status`, `dueDate`, `filter=today|pending`  
**Role:** RECEPTIONIST, DOCTOR, CLIENT_ADMIN

---

### POST /followups

**Role:** DOCTOR

**Body:**
```json
{
  "consultationId": "uuid",
  "dueDate": "2026-06-15",
  "notes": "Review blood pressure"
}
```

---

### PATCH /followups/:id

**Role:** DOCTOR, RECEPTIONIST  
**Body:** `{ "status": "completed" }`

---

## Analytics

### GET /analytics/platform

**Role:** SUPER_ADMIN

**Response:** Total clinics, active clinics, total appointments (platform-wide)

---

### GET /analytics/clinic/dashboard

**Role:** CLIENT_ADMIN

**Response:**
```json
{
  "patients": { "total", "new", "returning" },
  "appointments": { "today", "week", "month" },
  "revenue": { "today", "week", "month" },
  "doctors": [{ "doctorId", "name", "patients", "revenue", "appointments" }],
  "insights": {
    "peakHour": 10,
    "peakDay": "tuesday",
    "mostActiveDoctor": "Dr. Sharma",
    "avgRevenuePerPatient": 850
  }
}
```

---

### GET /analytics/reception/dashboard

**Role:** RECEPTIONIST

**Response:** Today's patients, revenue, waiting count, pending appointments

---

### GET /analytics/doctor/dashboard

**Role:** DOCTOR

**Response:** Today's appointments, waiting, completed

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No content |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (RBAC or tenant) |
| 404 | Not found |
| 409 | Conflict (duplicate phone) |
| 429 | Rate limited |
| 500 | Server error |

---

## Pagination Standard

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

Query: `page` (1-based), `limit` (max 100)
