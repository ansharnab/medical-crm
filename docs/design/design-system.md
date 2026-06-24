# Doctor CRM — Design System v1.0

**Stack:** React + Material UI (themed)  
**Reference:** MaatriDev Medic CRM video (visual language only)

---

## 1. Design Tokens

### Colors

```typescript
export const colors = {
  primary: {
    main: '#2563EB',
    light: '#DBEAFE',
    dark: '#1D4ED8',
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#0F172A',
    light: '#334155',
    dark: '#020617',
    contrast: '#FFFFFF',
  },
  success: {
    main: '#16A34A',
    light: '#DCFCE7',
    dark: '#15803D',
  },
  warning: {
    main: '#D97706',
    light: '#FEF3C7',
    dark: '#B45309',
  },
  error: {
    main: '#DC2626',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};
```

### Typography

```typescript
export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  h1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.25, color: '#0F172A' },
  h2: { fontSize: '20px', fontWeight: 600, lineHeight: 1.3, color: '#0F172A' },
  h3: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, color: '#0F172A' },
  h4: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: '#0F172A' },
  body1: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, color: '#334155' },
  body2: { fontSize: '13px', fontWeight: 400, lineHeight: 1.5, color: '#475569' },
  label: { fontSize: '12px', fontWeight: 500, lineHeight: 1.4, color: '#64748B' },
  tableHeader: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiValue: { fontSize: '26px', fontWeight: 700, lineHeight: 1.2, color: '#0F172A' },
};
```

### Spacing & Radius

```typescript
export const spacing = { unit: 8 }; // 8px grid
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 9999,
};
export const shadows = {
  card: '0 1px 3px rgba(15, 23, 42, 0.08)',
  modal: '0 20px 40px rgba(15, 23, 42, 0.15)',
};
```

---

## 2. MUI Theme Mapping

| MUI Slot | Token |
|----------|-------|
| `palette.primary` | `#2563EB` |
| `palette.secondary` | `#0F172A` |
| `palette.background.default` | `#F8FAFC` |
| `palette.background.paper` | `#FFFFFF` |
| `shape.borderRadius` | 8 |
| `components.MuiButton` | 40px height, 8px radius, no uppercase |
| `components.MuiCard` | 12px radius, card shadow |
| `components.MuiTableCell` | 13px body, no vertical borders |

---

## 3. Components

### 3.1 Buttons

| Component | Variants | Notes |
|-----------|----------|-------|
| `PrimaryButton` | contained | Main CTAs |
| `SecondaryButton` | outlined | Secondary actions |
| `GhostButton` | text | Export, Cancel |
| `DangerButton` | outlined error | Delete, Remove, Cancel appointment |
| `IconButton` | icon | Sidebar toggle (mobile) |

**Sizes:** sm (32px), md (40px), lg (44px)

### 3.2 Inputs

| Component | Usage |
|-----------|-------|
| `TextField` | Standard text input |
| `SearchField` | Header global search with icon |
| `SelectField` | Dropdowns |
| `DatePicker` | MUI X DatePicker |
| `TimePicker` | MUI X TimePicker |
| `PhoneField` | Indian phone format validation |

### 3.3 Data Display

| Component | Usage |
|-----------|-------|
| `StatCard` | KPI strip item (label + value) |
| `DataCard` | White section container |
| `DataTable` | Sortable, paginated table |
| `StatusBadge` | Semantic pill badges |
| `EmptyState` | No data illustration + CTA |
| `PatientSnapshotPanel` | **Hero feature** — visit summary |

### 3.4 Feedback

| Component | Usage |
|-----------|-------|
| `Dialog` | Create/edit modals |
| `Drawer` | Consultation detail (doctor) |
| `Toast` | Success/error notifications |
| `ConfirmDialog` | Destructive action confirmation |
| `LoadingSkeleton` | Page/table loading |

### 3.5 Navigation

| Component | Usage |
|-----------|-------|
| `AppShell` | Sidebar + header + content |
| `Sidebar` | Role-filtered nav |
| `PageHeader` | Title, subtitle, actions |
| `Breadcrumbs` | Optional nested pages |

### 3.6 Charts

| Component | Usage |
|-----------|-------|
| `BarChartCard` | Appointments/revenue trends |
| `ProgressList` | Doctor load, peak hours |
| `DonutChart` | Patient new vs returning |

**Library:** Recharts wrapped in `ChartCard`

---

## 4. Layout

### AppShell

```
Sidebar (240px) | Main
                | PageHeader
                | KPI Row (optional)
                | Content (max-width fluid, padding 32px)
```

### Dashboard Grid

```css
.dashboard-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(12, 1fr);
}
.kpi-row { grid-column: 1 / -1; display: flex; gap: 32px; }
.chart-half { grid-column: span 6; }
.table-half { grid-column: span 6; }
.full-width { grid-column: 1 / -1; }
```

### Responsive Rules

| Breakpoint | Behavior |
|------------|----------|
| ≥1280px | Full 2-column dashboard |
| 1024–1279px | Charts stack, tables side-by-side |
| 768–1023px | Sidebar → drawer, single column |
| <768px | Mobile-optimized tables (card list) |

---

## 5. Status Badge Mapping

| Domain | Status | Color |
|--------|--------|-------|
| Appointment | scheduled | info |
| Appointment | confirmed | success |
| Appointment | waiting | warning |
| Appointment | in_consultation | info |
| Appointment | completed | neutral |
| Appointment | cancelled | error |
| Payment | pending | warning |
| Payment | paid | success |
| Payment | partial | warning |
| Follow-up | pending | warning |
| Follow-up | completed | success |
| User | active | success |
| User | disabled | neutral |
| Clinic | active | success |
| Clinic | suspended | error |

---

## 6. File Structure (Frontend Design System)

```
frontend/src/
  theme/
    palette.ts
    typography.ts
    components.ts
    index.ts
  components/
    ui/           # Atomic design system
      Button/
      TextField/
      StatusBadge/
      DataTable/
      DataCard/
      StatCard/
      Dialog/
      ...
    layout/
      AppShell/
      Sidebar/
      PageHeader/
    domain/       # Business components
      PatientSnapshotPanel/
      QueueBoard/
      ConsultationForm/
```

---

## 7. Accessibility

- WCAG 2.1 AA contrast on all text
- Focus rings on interactive elements
- Keyboard navigation for modals and tables
- ARIA labels on icon-only buttons
- Status not conveyed by color alone (text label required)

---

## 8. Implementation Order

1. MUI theme + tokens
2. AppShell + Sidebar + PageHeader
3. StatCard, DataCard, DataTable, StatusBadge
4. Dialog, ConfirmDialog, Toast
5. Charts
6. Domain components (PatientSnapshotPanel last — depends on API)
