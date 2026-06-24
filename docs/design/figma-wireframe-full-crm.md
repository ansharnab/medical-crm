# Figma Wireframe — Doctor CRM Full Demo Flow

**Purpose:** Fully connected prototype for stakeholder demo — covers current MVP + proposed CRM modules.  
**Figma file name:** `Doctor CRM — Full Flow v2`  
**Frame size:** Desktop 1440 × 900 · Mobile 390 × 844  
**Design tokens:** Use `design-system.md` (Primary `#2563EB`, Inter font)

---

## How to build in Figma (30–45 min)

1. Create file → add 8 pages listed below  
2. Drop **AppShell** component (sidebar 240px + header 64px + content) on every authenticated frame  
3. Use **Prototype** tab → connect arrows per **Prototype Map** section  
4. Set interaction: **On click → Navigate to** · Animation: **Instant** (wireframe) or **Smart animate 200ms** (polish)  
5. Add **Flow starting point** badges on: `AUTH-01`, `RC-DEMO-01`, `DR-DEMO-01`, `SA-DEMO-01`

---

## What's NEW vs Current App

| Module | Current (built) | Added in wireframe |
|--------|-----------------|-------------------|
| Auth | Login only | Forgot password, clinic email verify, session timeout |
| Patients | List + CRUD | Full profile, vitals, documents, family members, tags |
| Appointments | Book + list | Online booking, waitlist, recurring, reminders config |
| Queue | Basic board | Token display TV mode, priority, ETA |
| Consultation | Symptoms/diagnosis | Vitals panel, templates, ICD codes, treatment plan |
| Prescriptions | ❌ | E-Rx builder, print/PDF, drug interaction warning |
| Lab / Reports | ❌ | Order tests, upload results, trend charts |
| Billing | Collect fee only | Invoices, partial pay, refunds, daily closing |
| Pharmacy | ❌ | Inventory, dispense, low-stock alerts |
| Communications | ❌ | SMS/WhatsApp/email center, templates, logs |
| Analytics | Basic KPIs | Cohort, funnel, export, scheduled reports |
| Admin | Users + settings | Audit log, roles/permissions, branches, packages |
| Patient Portal | ❌ | Self-book, history, prescriptions download |
| Super Admin | Clinics | Subscription plans, usage billing, support tickets |

**Total frames:** 78 (42 existing MVP + 36 new)

---

## Figma Pages & Frames

### Page 0 — Cover & Flow Map

| Frame ID | Name | Notes |
|----------|------|-------|
| COVER-01 | Cover — Doctor CRM Full Demo | Title, version, date |
| MAP-01 | Master Flow Map | FigJam-style: 4 swimlanes (Super Admin, Admin, Reception, Doctor) |
| MAP-02 | End-to-End Patient Journey | Register → Appt → Pay → Queue → Consult → Rx → Follow-up |
| LEGEND-01 | Component Legend | Colors, badges (NEW / MVP / P1) |

**Prototype from MAP-02:** each node clicks to its role's demo start frame.

---

### Page 1 — Authentication (4 frames)

| ID | Frame | Connects to |
|----|-------|-------------|
| AUTH-01 | Login | Role picker overlay → SA/CA/RC/DR dashboards |
| AUTH-02 | Forgot Password | AUTH-01 (back) |
| AUTH-03 | Reset Password Email Sent | AUTH-01 |
| AUTH-04 | Verify Clinic Email | CA-07 after verify |

---

### Page 2 — Super Admin (8 frames)

| ID | Frame | Connects to |
|----|-------|-------------|
| SA-01 | Platform Dashboard | SA-02, SA-07, SA-08 |
| SA-02 | Clinics List | SA-03, SA-05 |
| SA-03 | Create Clinic | SA-05 on save |
| SA-04 | Edit Clinic | SA-05 |
| SA-05 | Clinic Detail | SA-04, SA-06, suspend modal |
| SA-06 | Create Client Admin | SA-05 |
| SA-07 | Platform Analytics | SA-01 |
| SA-08 | **NEW** Subscription Plans | SA-05 |

**Demo flow SA-DEMO-01:** SA-01 → SA-02 → SA-03 → SA-05 → SA-06 → SA-01

---

### Page 3 — Client Admin (14 frames)

| ID | Frame | Connects to |
|----|-------|-------------|
| CA-01 | Clinic Dashboard | CA-10, CA-11, CA-12 |
| CA-02 | Users List | CA-03, CA-05 |
| CA-03 | Create Doctor | CA-02 |
| CA-04 | Edit Doctor | CA-02 |
| CA-05 | Create Receptionist | CA-02 |
| CA-06 | Edit Receptionist | CA-02 |
| CA-07 | Settings — Clinic Info | CA-08, CA-09 |
| CA-08 | Settings — Working Hours | CA-07 |
| CA-09 | Settings — Doctor Fees | CA-07 |
| CA-10 | Revenue Analytics | CA-01 |
| CA-11 | Patient Analytics | CA-01 |
| CA-12 | Doctor Performance | CA-01 |
| CA-13 | **NEW** Audit Log Viewer | CA-01 |
| CA-14 | **NEW** Branch Management | CA-01 |

---

### Page 4 — Reception (18 frames) ⭐ Main demo path

| ID | Frame | Connects to |
|----|-------|-------------|
| RC-DEMO-01 | **Demo Start** Reception Dashboard | RC-02 |
| RC-01 | Reception Dashboard | RC-02, RC-06, RC-11, RC-12 |
| RC-02 | Patients List | RC-03 modal, RC-14 |
| RC-03 | Add Patient (modal) | closes → RC-02 |
| RC-04 | Edit Patient (modal) | closes → RC-02 |
| RC-05 | Patient Search (inline) | RC-14 |
| RC-06 | Appointments List | RC-07, RC-08 |
| RC-07 | Book Appointment (modal) | RC-06, RC-09 |
| RC-08 | Manage Appointment (drawer) | RC-06 |
| RC-09 | Collect Payment | RC-10 |
| RC-10 | Payment History | RC-09 |
| RC-11 | Doctor Queue Board | RC-06 |
| RC-12 | Pending Follow-ups | RC-14 |
| RC-13 | Today's Follow-ups | RC-14 |
| RC-14 | Patient Profile (full) | RC-15, RC-16, RC-17 |
| RC-15 | **NEW** Patient Documents | RC-14 |
| RC-16 | **NEW** Send Reminder (SMS/WhatsApp) | RC-06 |
| RC-17 | **NEW** Create Invoice | RC-09 |

**End-to-end demo flow RC-DEMO:**
```
RC-DEMO-01 → RC-03 (Add Patient) → RC-07 (Book Appt) → RC-09 (Payment)
  → RC-11 (Queue) → [handoff] DR-02 → DR-03 → DR-09 (Prescription)
  → DR-07 (Follow-up) → CA-01 (Analytics)
```

---

### Page 5 — Doctor (12 frames)

| ID | Frame | Connects to |
|----|-------|-------------|
| DR-01 | Doctor Dashboard | DR-02, DR-08 |
| DR-02 | Queue View | DR-03 |
| DR-03 | Consultation — Active | DR-04, DR-06, DR-09 |
| DR-04 | Consultation — Clinical Notes | DR-03 |
| DR-05 | Patient History (timeline) | DR-06 |
| DR-06 | Smart Patient Snapshot (panel) | DR-05 |
| DR-07 | Recommend Follow-up (modal) | DR-03 |
| DR-08 | Completed Today | DR-01 |
| DR-09 | **NEW** E-Prescription Builder | DR-10 |
| DR-10 | **NEW** Prescription Preview / Print | DR-03 |
| DR-11 | **NEW** Order Lab Tests | DR-12 |
| DR-12 | **NEW** Lab Results Viewer | DR-03 |

**Doctor demo DR-DEMO-01:** DR-01 → DR-02 → DR-03 → DR-06 expand → DR-09 → DR-07 → DR-08

---

### Page 6 — New CRM Modules (14 frames)

| ID | Frame | Role | Connects to |
|----|-------|------|-------------|
| NM-01 | Billing — Invoice List | Admin/Reception | NM-02 |
| NM-02 | Billing — Invoice Detail | Reception | NM-03 |
| NM-03 | Billing — Daily Closing | Admin | CA-01 |
| NM-04 | Pharmacy — Inventory | Admin | NM-05 |
| NM-05 | Pharmacy — Dispense | Reception | RC-14 |
| NM-06 | Communications — Message Center | Admin | NM-07 |
| NM-07 | Communications — Template Editor | Admin | NM-06 |
| NM-08 | Reports — Export Center | Admin | CA-10 |
| NM-09 | Patient Portal — Login | Patient | NM-10 |
| NM-10 | Patient Portal — Book Online | Patient | NM-11 |
| NM-11 | Patient Portal — My Visits | Patient | NM-12 |
| NM-12 | Patient Portal — Download Rx | Patient | — |
| NM-13 | Referrals — Outgoing/Incoming | Doctor | DR-03 |
| NM-14 | Membership / Health Packages | Admin | CA-01 |

---

### Page 7 — Mobile (6 frames)

| ID | Frame | Connects to |
|----|-------|-------------|
| MOB-01 | Login | MOB-02 |
| MOB-02 | Reception Dashboard | MOB-03 |
| MOB-03 | Patient List (cards) | MOB-04 |
| MOB-04 | Book Appointment | MOB-05 |
| MOB-05 | Queue (compact) | MOB-06 |
| MOB-06 | Doctor Consultation | DR-07 |

---

### Page 8 — Components

Build as Figma **Components** (variants where noted):

- `AppShell / Sidebar / Header`
- `KPI / StatCard` (5 variants)
- `DataTable / Row / Pagination`
- `Modal / Drawer / ConfirmDialog`
- `PatientSnapshot / Panel`
- `Form / Input / Select / DatePicker`
- `StatusBadge` (scheduled, waiting, in-consult, completed, cancelled)
- `EmptyState / LoadingSkeleton`
- `Chart / Bar / Line` (placeholder blocks)
- `NEW / MVP / P1` badge chips

---

## Prototype Map — Primary Demo (stakeholder walkthrough)

Connect these in order with **Back** links where noted:

```
1. AUTH-01 [Login as Receptionist]
      ↓ Sign In
2. RC-DEMO-01 [Dashboard — see today's KPIs]
      ↓ "+ Add Patient"
3. RC-03 [Modal — Rajesh Kumar, +91...]
      ↓ Save
4. RC-02 [Patient in list — click row]
5. RC-14 [Full patient profile — vitals tab NEW]
      ↓ "Book Appointment"
6. RC-07 [Modal — Dr. Patel, today 10:30]
      ↓ Book
7. RC-09 [Collect ₹500 — UPI — Mark Paid]
      ↓ "View Queue"
8. RC-11 [Token #4 — Waiting]
      ↓ Switch role banner: "Continue as Doctor →"
9. DR-02 [Doctor queue — Call Next]
      ↓
10. DR-03 [Consultation + Snapshot panel]
      ↓ "Add Prescription" (NEW)
11. DR-09 [E-Rx — medicines, dosage]
      ↓ Print / Save
12. DR-07 [Follow-up in 7 days]
      ↓ Complete Consultation
13. DR-08 [Completed list]
      ↓ "View Clinic Analytics →"
14. CA-01 [Admin dashboard — revenue updated]
```

**Secondary demos (optional starting points):**
- Super Admin onboarding: SA-DEMO-01 (create clinic + admin)
- Patient portal: NM-09 → NM-10 → NM-11
- Billing deep-dive: NM-01 → NM-02 → NM-03

---

## Wireframe Annotations (add sticky notes in Figma)

On each **NEW** frame, add yellow sticky:
> **NEW — [Module]**  
> Why: [1 line business value]  
> Sprint: P1 / P2  
> API: TBD

On **MVP** frames, add gray sticky:
> **MVP — Already in codebase**  
> Route: `/reception/patients` etc.

---

## Frame Layout Templates

### Dashboard (all roles)
```
[Header: Title | Search | User menu]
[KPI × 5 row]
[Chart 50%] [Chart/Table 50%]
[Table full width]
```

### List + Action
```
[Header + Primary CTA]
[Filters row: search | date | doctor | status]
[Table with pagination]
```

### Consultation (Doctor)
```
[Snapshot panel — top, collapsible on mobile]
[2-col: Vitals NEW | Notes form]
[Tabs: Symptoms | Diagnosis | Rx NEW | Labs NEW | History]
[Footer: Follow-up | Complete]
```

---

## Export & Handoff

- **Demo:** Present from Figma Prototype → `RC-DEMO-01` starting point  
- **Dev handoff:** Mark MVP frames with ✅, NEW with 🆕 in layer names  
- **Sync with code:** Cross-ref `screen-inventory.md` IDs  

---

## Checklist before demo

- [ ] All 78 frames placed on correct pages  
- [ ] Primary demo path (14 steps) fully connected, no dead ends  
- [ ] Role switch callouts on RC-11 → DR-02 bridge frame  
- [ ] NEW badges visible on 36 new frames  
- [ ] Mobile flow connected (6 frames)  
- [ ] Cover page with legend and date  
