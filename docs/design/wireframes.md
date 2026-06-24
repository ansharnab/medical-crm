# Wireframes — Doctor CRM MVP (Text)

All wireframes use the **AppShell** layout from the design reference.

---

## WF-01: Login

```
┌─────────────────────────────────────────────────────────┐
│                    [Logo] Doctor CRM                     │
│                                                          │
│              ┌─────────────────────────┐                │
│              │ Email                    │                │
│              │ Password                 │                │
│              │ [ Sign In ]              │                │
│              └─────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## WF-02: App Shell (All Authenticated Roles)

```
┌─────────┬──────────────────────────────────────────────┐
│ [Logo]  │ Dashboard (Role)          [Search] Admin ▼   │
│ Doctor  │ Subtitle text              Export  [+ CTA]    │
│ CRM     ├──────────────────────────────────────────────┤
│         │ KPI1   KPI2   KPI3   KPI4   KPI5             │
│ ■ Dash  ├──────────────────────────────────────────────┤
│   Nav2  │                                              │
│   Nav3  │              MAIN CONTENT                    │
│   Nav4  │                                              │
│         │                                              │
└─────────┴──────────────────────────────────────────────┘
```

---

## WF-03: Receptionist Dashboard (RC-01)

```
KPI: Today's Patients | Today's Revenue | Waiting | Pending Appts

┌─ Today's Appointments ─────────┐ ┌─ Waiting Queue ──────────────┐
│ Patient | Doctor | Time | Status│ │ Token | Patient | Doctor    │
│ ...                             │ │ ...                          │
└─────────────────────────────────┘ └──────────────────────────────┘

┌─ Pending Follow-ups ─────────────────────────────────────────────┐
│ Patient | Due Date | Last Doctor | Action [View]                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-04: Doctor Dashboard + Smart Patient Snapshot (DR-01, DR-06)

```
KPI: Today's Appts | Waiting | Completed | Pending Follow-ups

┌─ My Queue ───────────────────────────────────────────────────────┐
│ # | Patient | Wait Time | [Call Next]                             │
└──────────────────────────────────────────────────────────────────┘

When patient selected / consultation opened:

┌─ SMART PATIENT SNAPSHOT ─────────────────────────────────────────┐
│ Total Visits: 12  │  Last Visit: 2026-05-15  │  Last Doctor: Dr X │
│ Last Diagnosis: Hypertension                                      │
│ Pending Follow-ups: 1 (due 2026-06-01)                           │
│ ── Previous Notes (collapsed list, last 3) ──                     │
└──────────────────────────────────────────────────────────────────┘

┌─ Consultation Form ──────────────────────────────────────────────┐
│ Symptoms | Diagnosis | Notes | Recommendations                   │
│ [Recommend Follow-up Date]  [Complete Consultation]               │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-05: Client Admin Analytics (CA-01)

```
KPI: Total Patients | New | Returning | Revenue Today | Appts Today

┌─ Revenue Trend (7/30 days) ────┐ ┌─ Appointments Trend ──────────┐
│ [Bar Chart]                     │ │ [Bar Chart]                   │
└─────────────────────────────────┘ └───────────────────────────────┘

┌─ Doctor Performance ───────────┐ ┌─ Business Intelligence ───────┐
│ Doctor | Patients | Rev | Appts │ │ Peak Hour: 10–11 AM           │
│ ...                             │ │ Peak Day: Tuesday              │
└─────────────────────────────────┘ │ Most Active: Dr. Sharma        │
                                    │ Avg Rev/Patient: ₹850          │
                                    └────────────────────────────────┘
```

---

## WF-06: Super Admin Clinics (SA-02)

```
[+ Create Clinic]

┌─ Clinics ────────────────────────────────────────────────────────┐
│ Name | City | Status | Admins | Created | Actions [Edit] [Suspend] │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-07: Book Appointment Modal (RC-07)

```
┌─ Book Appointment ──────────────────────────────── [×] ─┐
│ Patient:     [Search/select patient    ▼]              │
│ Doctor:      [Select doctor            ▼]              │
│ Date:        [Calendar picker]                         │
│ Time:        [Hour ▼] [Minute ▼]                       │
│ Fee:         ₹500 (from doctor config)                 │
│                                                        │
│                        [Cancel]  [Book Appointment]    │
└────────────────────────────────────────────────────────┘
```

---

## WF-08: Collect Payment (RC-09)

```
┌─ Collect Consultation Fee ───────────────────────────────────────┐
│ Patient: Rajesh Kumar                                            │
│ Doctor: Dr. Patel                                                │
│ Amount Due: ₹500                                                 │
│ Payment Mode: ( ) Cash  ( ) UPI  ( ) Card  ( ) Other            │
│ Status: [Mark Paid]  [Partial: ₹___]                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## WF-09: Patient List (RC-02)

```
[+ Add Patient]                              [Search: name/phone]

┌─ Patient Registry ───────────────────────────────────────────────┐
│ Name | Phone | Age | Last Visit | Actions [Edit] [Delete]        │
└──────────────────────────────────────────────────────────────────┘
```

Modal pattern matches reference video: stacked fields, Cancel + primary action.

---

## Responsive: Mobile (<768px)

- Sidebar → hamburger drawer
- KPI strip → horizontal scroll or 2×2 grid
- Tables → card list with key fields
- Snapshot panel → collapsible accordion at top of consultation
