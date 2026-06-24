# QA Checklist & Test Strategy — Doctor CRM MVP

**QA Lead responsibility:** No feature marked complete until all applicable sections pass.

---

## 1. Test Pyramid

```
        ┌─────────┐
        │  E2E    │  10% — Critical user journeys
        ├─────────┤
        │ Integr. │  30% — API + tenant + RBAC
        ├─────────┤
        │  Unit   │  60% — Services, utils, validators
        └─────────┘
```

**Tools:** Jest (backend + frontend), Supertest (API), Playwright (E2E — Sprint 8)

---

## 2. Per-Feature QA Process

For every feature (see sprint-plan.md):

- [ ] Step 1: Requirement traceability (backlog ID linked)
- [ ] Step 2: Happy path manual test
- [ ] Step 3: Edge case tests
- [ ] Step 4: Role permission tests (all 4 roles)
- [ ] Step 5: Tenant isolation tests
- [ ] Step 6: Negative tests (invalid input, unauthorized)
- [ ] Step 7: Regression of related features
- [ ] Step 8: Security review item
- [ ] Step 9: Documentation updated
- [ ] Step 10: Marked complete in completed-tasks.md

---

## 3. Tenant Isolation Test Template

```javascript
describe('Tenant isolation: GET /patients/:id', () => {
  it('returns 403 when org B user accesses org A patient', async () => {
    const patientA = await createPatient(orgA);
    const tokenB = await login(userB_in_orgB);
    const res = await request(app)
      .get(`/api/v1/patients/${patientA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });
});
```

**Apply to:** Every GET/PATCH/DELETE by ID for all entities.

---

## 4. RBAC Test Matrix (Sample)

| Endpoint | SUPER_ADMIN | CLIENT_ADMIN | DOCTOR | RECEPTIONIST |
|----------|:-----------:|:------------:|:------:|:------------:|
| POST /organizations | 201 | 403 | 403 | 403 |
| POST /patients | 403 | 403 | 403 | 201 |
| POST /consultations | 403 | 403 | 201 | 403 |
| GET /analytics/platform | 200 | 403 | 403 | 403 |

Automate via parameterized Jest table.

---

## 5. Smart Patient Snapshot — Performance Tests

| Test | Target | Method |
|------|--------|--------|
| Cold cache p95 | < 300ms | k6/Artillery, 50 concurrent |
| Warm cache p95 | < 100ms | Redis hit |
| Cache invalidation | < 5s stale max | Write consultation → read snapshot |

---

## 6. Functional Test Cases by Epic

### Auth (Sprint 1)
- [ ] Valid login returns token + user
- [ ] Invalid password returns 401
- [ ] Expired access token returns 401
- [ ] Refresh token renews access
- [ ] Logout invalidates refresh
- [ ] Rate limit after 10 failed logins/min

### Organizations (Sprint 2)
- [ ] Create clinic with valid data
- [ ] Duplicate slug rejected
- [ ] Suspend clinic blocks tenant user login
- [ ] Client admin created with correct org scope

### Patients (Sprint 4)
- [ ] Create patient with required fields
- [ ] Duplicate phone in same org rejected
- [ ] Same phone in different org allowed
- [ ] Search by partial name
- [ ] Search by phone

### Appointments (Sprint 4)
- [ ] Book appointment assigns fee from doctor config
- [ ] Status transitions: scheduled → confirmed → waiting → in_consultation → completed
- [ ] Cancelled appointment excluded from queue
- [ ] Reschedule updates scheduled_at

### Payments (Sprint 5)
- [ ] Full payment marks status paid
- [ ] Partial payment marks status partial
- [ ] Revenue dashboard reflects payments today

### Consultation + Snapshot (Sprint 6)
- [ ] Snapshot shows correct total visits after completion
- [ ] Last diagnosis updates after consultation
- [ ] Pending follow-ups count accurate
- [ ] Doctor cannot access other doctor's in-progress consultation

### Analytics (Sprint 7)
- [ ] New vs returning patient counts correct
- [ ] Peak hour matches appointment distribution
- [ ] Doctor revenue matches payment sums

---

## 7. Security Testing

| Category | Tests |
|----------|-------|
| Authentication | JWT tampering, missing token, wrong algorithm |
| Authorization | Horizontal privilege escalation (same role, different org) |
| Input validation | SQL injection strings, XSS in text fields |
| Rate limiting | Login brute force |
| Headers | Helmet CSP, HSTS in production |
| Secrets | No credentials in logs or responses |

---

## 8. Regression Suite (Sprint 8)

Run full suite before pilot launch:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Tenant isolation suite (100% endpoints)
- [ ] RBAC suite (100% write endpoints)
- [ ] E2E: Super Admin onboarding flow
- [ ] E2E: Receptionist day flow (patient → appt → payment)
- [ ] E2E: Doctor consultation with snapshot
- [ ] E2E: Client Admin analytics view
- [ ] Performance: snapshot p95
- [ ] Manual: cross-browser (Chrome, Safari, Firefox)
- [ ] Manual: responsive (768px, 1024px, 1280px)

---

## 9. Bug Severity

| Level | Definition | SLA |
|-------|------------|-----|
| S1 Critical | Data leakage, auth bypass | Fix immediately |
| S2 High | Core workflow blocked | Fix within 24h |
| S3 Medium | Workaround exists | Fix within sprint |
| S4 Low | Cosmetic | Backlog |

---

## 10. QA Sign-off Criteria — MVP Launch

- [ ] Zero S1/S2 open bugs
- [ ] Tenant isolation tests: 100% pass
- [ ] RBAC tests: 100% pass
- [ ] Snapshot performance: meets target
- [ ] Security checklist complete
- [ ] Pilot clinic UAT sign-off (3 clinics)
