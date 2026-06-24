# Design Analysis Report — MaatriDev Medic CRM Video Reference

**Video:** `MaatriDev Medic CRM Frontend.mp4` (62s, 1918×866)  
**Purpose:** Visual and UX reference only — not product specification  
**Product:** Doctor CRM / Clinic Management SaaS (our own requirements)  
**Date:** 2026-05-30

---

## Executive Summary

The reference video demonstrates a **premium enterprise SaaS medical dashboard** with a dark sidebar + light workspace layout, KPI-first dashboards, data-dense tables, inline modals, and semantic status badges. The visual language is clean, modern, and trustworthy — ideal for clinical staff workflows.

We will adopt the **design language** while building **our own product** with multi-tenant architecture, RBAC (Super Admin, Client Admin, Doctor, Receptionist), and MVP features defined in the product brief.

---

## 1. Design Language

| Attribute | Reference Pattern | Our Adaptation |
|-----------|-------------------|----------------|
| Mood | Professional, calm, clinical | Same — enterprise healthcare SaaS |
| Density | Comfortable, not cramped | Same — optimized for reception/doctor speed |
| Hierarchy | KPI → Charts → Tables | Same pattern per role dashboard |
| Depth | Flat cards, subtle shadows | Same — avoid heavy skeuomorphism |
| Motion | Toast notifications, modal overlays | Same — minimal, purposeful animation |

---

## 2. Color Palette (Extracted)

| Token | Reference Value | Usage |
|-------|-----------------|-------|
| Sidebar BG | `#0F172A` (deep navy) | Primary navigation shell |
| Sidebar Active | `#2563EB` on rounded pill | Active nav item |
| Page BG | `#F8FAFC` | Main workspace background |
| Surface | `#FFFFFF` | Cards, modals, header |
| Primary | `#2563EB` | CTAs, charts, links |
| Primary Hover | `#1D4ED8` | Button hover |
| Text Primary | `#0F172A` | Headings, KPI values |
| Text Secondary | `#64748B` | Labels, subtitles |
| Text Muted | `#94A3B8` | Placeholders, table headers |
| Border | `#E2E8F0` | Inputs, dividers |
| Success | `#16A34A` / bg `#DCFCE7` | Confirmed, Stable, Paid |
| Warning | `#D97706` / bg `#FEF3C7` | Pending, Monitor |
| Error | `#DC2626` / bg `#FEE2E2` | Critical, Due, Delete |
| Info | `#2563EB` / bg `#DBEAFE` | Informational badges |

**Note:** We use INR (₹) formatting as shown in reference for Indian clinic pilot.

---

## 3. Typography

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 28px | 700 | Page title ("Dashboard") |
| H2 | 20px | 600 | Section/card titles |
| H3 | 16px | 600 | Subsection headers |
| H4 | 14px | 600 | Table section labels |
| Body | 14px | 400 | Default content |
| Body Small | 13px | 400 | Table cells |
| Label | 12px | 500 | Form labels, KPI labels |
| Table Header | 12px | 600 | Uppercase or semi-bold gray |
| KPI Value | 24–28px | 700 | Metric numbers |

**Font Stack:** `"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif`

---

## 4. Layout Patterns

### 4.1 App Shell
```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │ Header (title, search, user, actions)      │
│ 240px    ├─────────────────────────────────────────────┤
│ fixed    │ KPI Strip (5 metrics, borderless)           │
│          ├─────────────────────────────────────────────┤
│          │ Main Content (cards, charts, tables)        │
│          │                                             │
└──────────┴─────────────────────────────────────────────┘
```

### 4.2 Sidebar
- Fixed left, full viewport height
- Logo: circular badge with initials + product name + tagline
- Nav items: icon + label, 44px row height
- Active state: rounded rectangle (8px radius) with primary blue fill
- No collapse in MVP desktop; collapsible drawer on tablet/mobile

### 4.3 Header
- Left: Page title + gray subtitle
- Center: Global search (max-width 480px)
- Right: Role badge/dropdown, Export (ghost), Primary CTA

### 4.4 KPI Strip
- Horizontal row of 5 metrics
- No card borders — label above value
- Consistent across all admin pages in reference

### 4.5 Content Grid
- Dashboard: 2-column chart row + 2-column table row
- List pages: Full-width section card with table
- Staff pages: 2-column split tables
- Responsive: stacks to single column below 1024px

---

## 5. Component Styles

### Cards
- Background: white
- Border radius: 12px
- Shadow: `0 1px 3px rgba(15, 23, 42, 0.08)`
- Padding: 20–24px
- Header: title left, action button right

### Buttons
| Variant | Style |
|---------|-------|
| Primary | Blue fill, white text, 8px radius |
| Secondary | White fill, gray border |
| Ghost | Text only (Export) |
| Danger | Red outline, red text (Remove/Delete) |

### Tables
- No vertical borders
- Light horizontal dividers
- Horizontal scroll on overflow
- Row hover: `#F8FAFC`
- Actions: text links + outlined danger buttons

### Status Badges
- Pill shape (full border-radius)
- Light tinted background + darker text
- Sizes: sm (table), md (cards)

### Modals
- Centered, max-width 480–560px
- Backdrop: `rgba(15, 23, 42, 0.5)`
- Stacked form fields
- Footer: Cancel (text) + Primary action

### Charts
- Bar chart: blue gradient bars, rounded tops
- Progress bars: blue fill on gray track
- Library: Recharts (MUI-compatible)

### Toast
- Bottom-right, dark background, white text
- Auto-dismiss 4s

---

## 6. Navigation Patterns (Reference vs Ours)

| Reference Nav | Our MVP Nav (by role) |
|---------------|----------------------|
| Dashboard | Role-specific dashboard |
| Patients | Patients (Receptionist, Doctor) |
| Appointments | Appointments (Receptionist, Doctor) |
| Doctors & Staff | Users / Doctors (Client Admin) |
| Billing | Payments (Receptionist) — not full billing |
| Inventory | **Out of MVP scope** |
| — | Queue (Receptionist, Doctor) |
| — | Consultations (Doctor) |
| — | Follow-ups (All clinical roles) |
| — | Clinics (Super Admin) |
| — | Analytics (Client Admin, Super Admin) |
| — | Settings (Client Admin) |

---

## 7. Interaction Patterns

1. **Global search** — placeholder suggests cross-entity search; MVP: patients + appointments
2. **Primary CTA in header** — context-aware (e.g., "+ New Appointment" on appointment pages)
3. **Inline modals** for create/edit — no full-page forms for simple CRUD
4. **Table row actions** — Edit (text), Delete/Cancel (danger outline)
5. **Export** — triggers download + success toast
6. **Date/time picker** — calendar + hour/minute columns in modal
7. **Dropdown filters** — e.g., "7 Days" on charts

---

## 8. Spacing System (8px Grid)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Badge padding |
| sm | 8px | Tight gaps |
| md | 16px | Card padding, form gaps |
| lg | 24px | Section spacing |
| xl | 32px | Page padding |
| 2xl | 48px | Major section breaks |

---

## 9. Screens Shown in Video

| Screen | Key Elements |
|--------|--------------|
| Dashboard (Admin) | KPIs, OPD bar chart, department load, appointments table, triage queue |
| Patients | Patient registry table, Add Patient modal |
| Appointments | Schedule table, status badges, Reschedule/Cancel |
| Doctors & Staff | Provider capacity + staff roster tables |
| Billing | Invoice table, Add Invoice modal |
| Inventory | Stock alerts + kit requests, Add Item modal |

**MVP Scope Note:** Billing and Inventory screens inform visual patterns only. Our MVP implements consultation payments, not full invoicing/insurance/inventory.

---

## 10. Design Principles for Our Product

1. **Consistency** — Every screen uses AppShell + design tokens
2. **Scanability** — KPIs and badges for at-a-glance status
3. **Speed** — Receptionist and doctor flows optimized for clicks
4. **Trust** — Clean whitespace, semantic colors, no clutter
5. **Differentiation** — Smart Patient Snapshot panel is our hero UX (not in reference video)

---

## 11. Approval Checklist

- [ ] Color palette approved
- [ ] Typography scale approved
- [ ] Layout shell approved
- [ ] Component styles approved
- [ ] Role-based nav mapping approved
- [ ] MVP scope exclusions acknowledged (no inventory clone)

**Status:** Pending stakeholder approval before implementation.
