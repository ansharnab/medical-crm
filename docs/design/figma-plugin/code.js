// Doctor CRM — Full Wireframe Builder (Figma Plugin)
// Free plan: builds everything on ONE page (sections). Click "Build All Wireframes".

const C = {
  primary: { r: 0.145, g: 0.388, b: 0.922 },
  primaryLight: { r: 0.859, g: 0.918, b: 0.996 },
  bg: { r: 0.973, g: 0.98, b: 0.988 },
  white: { r: 1, g: 1, b: 1 },
  border: { r: 0.886, g: 0.91, b: 0.941 },
  text: { r: 0.059, g: 0.09, b: 0.165 },
  muted: { r: 0.278, g: 0.333, b: 0.412 },
  success: { r: 0.086, g: 0.639, b: 0.29 },
  warning: { r: 0.851, g: 0.467, b: 0.024 },
  newBadge: { r: 0.992, g: 0.949, b: 0.804 },
  mvpBadge: { r: 0.945, g: 0.961, b: 0.976 },
};

const DESKTOP = { w: 1440, h: 900 };
const MOBILE = { w: 390, h: 844 };
const COL_GAP = 80;
const ROW_GAP = 60;

const PAGES = [
  {
    name: "0 — Cover & Flow Map",
    frames: [
      { id: "COVER-01", title: "Cover — Doctor CRM Full Demo", type: "cover" },
      { id: "MAP-01", title: "Master Flow Map", type: "map" },
      { id: "MAP-02", title: "End-to-End Patient Journey", type: "map" },
      { id: "LEGEND-01", title: "Component Legend", type: "legend" },
    ],
  },
  {
    name: "1 — Authentication",
    frames: [
      { id: "AUTH-01", title: "Login", type: "auth", flowStart: true },
      { id: "AUTH-02", title: "Forgot Password", type: "auth" },
      { id: "AUTH-03", title: "Reset Password Email Sent", type: "auth" },
      { id: "AUTH-04", title: "Verify Clinic Email", type: "auth" },
    ],
  },
  {
    name: "2 — Super Admin",
    frames: [
      { id: "SA-01", title: "Platform Dashboard", type: "dashboard", role: "Super Admin", flowStart: true },
      { id: "SA-02", title: "Clinics List", type: "list", role: "Super Admin" },
      { id: "SA-03", title: "Create Clinic", type: "form", role: "Super Admin" },
      { id: "SA-04", title: "Edit Clinic", type: "form", role: "Super Admin" },
      { id: "SA-05", title: "Clinic Detail", type: "detail", role: "Super Admin" },
      { id: "SA-06", title: "Create Client Admin", type: "form", role: "Super Admin" },
      { id: "SA-07", title: "Platform Analytics", type: "dashboard", role: "Super Admin" },
      { id: "SA-08", title: "Subscription Plans", type: "list", role: "Super Admin", isNew: true },
    ],
  },
  {
    name: "3 — Client Admin",
    frames: [
      { id: "CA-01", title: "Clinic Dashboard", type: "dashboard", role: "Client Admin" },
      { id: "CA-02", title: "Users List", type: "list", role: "Client Admin" },
      { id: "CA-03", title: "Create Doctor", type: "form", role: "Client Admin" },
      { id: "CA-04", title: "Edit Doctor", type: "form", role: "Client Admin" },
      { id: "CA-05", title: "Create Receptionist", type: "form", role: "Client Admin" },
      { id: "CA-06", title: "Edit Receptionist", type: "form", role: "Client Admin" },
      { id: "CA-07", title: "Settings — Clinic Info", type: "form", role: "Client Admin" },
      { id: "CA-08", title: "Settings — Working Hours", type: "form", role: "Client Admin" },
      { id: "CA-09", title: "Settings — Doctor Fees", type: "form", role: "Client Admin" },
      { id: "CA-10", title: "Revenue Analytics", type: "dashboard", role: "Client Admin" },
      { id: "CA-11", title: "Patient Analytics", type: "dashboard", role: "Client Admin" },
      { id: "CA-12", title: "Doctor Performance", type: "dashboard", role: "Client Admin" },
      { id: "CA-13", title: "Audit Log Viewer", type: "list", role: "Client Admin", isNew: true },
      { id: "CA-14", title: "Branch Management", type: "list", role: "Client Admin", isNew: true },
    ],
  },
  {
    name: "4 — Reception",
    frames: [
      { id: "RC-DEMO-01", title: "Demo Start — Reception Dashboard", type: "dashboard", role: "Reception", flowStart: true },
      { id: "RC-01", title: "Reception Dashboard", type: "dashboard", role: "Reception" },
      { id: "RC-02", title: "Patients List", type: "list", role: "Reception" },
      { id: "RC-03", title: "Add Patient (modal)", type: "modal", role: "Reception" },
      { id: "RC-04", title: "Edit Patient (modal)", type: "modal", role: "Reception" },
      { id: "RC-05", title: "Patient Search (inline)", type: "list", role: "Reception" },
      { id: "RC-06", title: "Appointments List", type: "list", role: "Reception" },
      { id: "RC-07", title: "Book Appointment (modal)", type: "modal", role: "Reception" },
      { id: "RC-08", title: "Manage Appointment (drawer)", type: "modal", role: "Reception" },
      { id: "RC-09", title: "Collect Payment", type: "form", role: "Reception" },
      { id: "RC-10", title: "Payment History", type: "list", role: "Reception" },
      { id: "RC-11", title: "Doctor Queue Board", type: "queue", role: "Reception" },
      { id: "RC-12", title: "Pending Follow-ups", type: "list", role: "Reception" },
      { id: "RC-13", title: "Today's Follow-ups", type: "list", role: "Reception" },
      { id: "RC-14", title: "Patient Profile (full)", type: "detail", role: "Reception" },
      { id: "RC-15", title: "Patient Documents", type: "list", role: "Reception", isNew: true },
      { id: "RC-16", title: "Send Reminder (SMS/WhatsApp)", type: "modal", role: "Reception", isNew: true },
      { id: "RC-17", title: "Create Invoice", type: "form", role: "Reception", isNew: true },
    ],
  },
  {
    name: "5 — Doctor",
    frames: [
      { id: "DR-01", title: "Doctor Dashboard", type: "dashboard", role: "Doctor", flowStart: true },
      { id: "DR-02", title: "Queue View", type: "queue", role: "Doctor" },
      { id: "DR-03", title: "Consultation — Active", type: "consultation", role: "Doctor" },
      { id: "DR-04", title: "Consultation — Clinical Notes", type: "consultation", role: "Doctor" },
      { id: "DR-05", title: "Patient History (timeline)", type: "detail", role: "Doctor" },
      { id: "DR-06", title: "Smart Patient Snapshot (panel)", type: "detail", role: "Doctor" },
      { id: "DR-07", title: "Recommend Follow-up (modal)", type: "modal", role: "Doctor" },
      { id: "DR-08", title: "Completed Today", type: "list", role: "Doctor" },
      { id: "DR-09", title: "E-Prescription Builder", type: "form", role: "Doctor", isNew: true },
      { id: "DR-10", title: "Prescription Preview / Print", type: "detail", role: "Doctor", isNew: true },
      { id: "DR-11", title: "Order Lab Tests", type: "form", role: "Doctor", isNew: true },
      { id: "DR-12", title: "Lab Results Viewer", type: "detail", role: "Doctor", isNew: true },
    ],
  },
  {
    name: "6 — New CRM Modules",
    frames: [
      { id: "NM-01", title: "Billing — Invoice List", type: "list", role: "Admin/Reception", isNew: true },
      { id: "NM-02", title: "Billing — Invoice Detail", type: "detail", role: "Reception", isNew: true },
      { id: "NM-03", title: "Billing — Daily Closing", type: "dashboard", role: "Admin", isNew: true },
      { id: "NM-04", title: "Pharmacy — Inventory", type: "list", role: "Admin", isNew: true },
      { id: "NM-05", title: "Pharmacy — Dispense", type: "form", role: "Reception", isNew: true },
      { id: "NM-06", title: "Communications — Message Center", type: "list", role: "Admin", isNew: true },
      { id: "NM-07", title: "Communications — Template Editor", type: "form", role: "Admin", isNew: true },
      { id: "NM-08", title: "Reports — Export Center", type: "list", role: "Admin", isNew: true },
      { id: "NM-09", title: "Patient Portal — Login", type: "auth", role: "Patient", isNew: true, flowStart: true },
      { id: "NM-10", title: "Patient Portal — Book Online", type: "form", role: "Patient", isNew: true },
      { id: "NM-11", title: "Patient Portal — My Visits", type: "list", role: "Patient", isNew: true },
      { id: "NM-12", title: "Patient Portal — Download Rx", type: "detail", role: "Patient", isNew: true },
      { id: "NM-13", title: "Referrals — Outgoing/Incoming", type: "list", role: "Doctor", isNew: true },
      { id: "NM-14", title: "Membership / Health Packages", type: "list", role: "Admin", isNew: true },
    ],
  },
  {
    name: "7 — Mobile",
    frames: [
      { id: "MOB-01", title: "Login", type: "mobile-auth", mobile: true },
      { id: "MOB-02", title: "Reception Dashboard", type: "mobile-dash", mobile: true },
      { id: "MOB-03", title: "Patient List (cards)", type: "mobile-list", mobile: true },
      { id: "MOB-04", title: "Book Appointment", type: "mobile-form", mobile: true },
      { id: "MOB-05", title: "Queue (compact)", type: "mobile-queue", mobile: true },
      { id: "MOB-06", title: "Doctor Consultation", type: "mobile-consult", mobile: true },
    ],
  },
  {
    name: "8 — Components",
    frames: [
      { id: "COMP-01", title: "AppShell / Sidebar / Header", type: "components" },
      { id: "COMP-02", title: "KPI StatCards + Badges", type: "components" },
      { id: "COMP-03", title: "DataTable + Modals", type: "components" },
      { id: "COMP-04", title: "Forms + Charts placeholders", type: "components" },
    ],
  },
];

const PROTOTYPE_LINKS = [
  ["AUTH-01", "RC-DEMO-01", "Sign In"],
  ["RC-DEMO-01", "RC-03", "+ Add Patient"],
  ["RC-03", "RC-02", "Save"],
  ["RC-02", "RC-14", "Open Patient Row"],
  ["RC-14", "RC-07", "Book Appointment"],
  ["RC-07", "RC-09", "Book"],
  ["RC-09", "RC-11", "View Queue"],
  ["RC-11", "DR-02", "Continue as Doctor →"],
  ["DR-02", "DR-03", "Call Next"],
  ["DR-03", "DR-09", "Add Prescription"],
  ["DR-09", "DR-07", "Save & Continue"],
  ["DR-07", "DR-08", "Complete Consultation"],
  ["DR-08", "CA-01", "View Clinic Analytics →"],
  ["AUTH-01", "AUTH-02", "Forgot password?"],
  ["AUTH-02", "AUTH-01", "← Back to Login"],
  ["AUTH-02", "AUTH-03", "Send Reset Link"],
  ["AUTH-03", "AUTH-01", "Back to Login"],
  ["SA-01", "SA-02", "Clinics"],
  ["SA-02", "SA-03", "+ Create Clinic"],
  ["SA-03", "SA-05", "Save Clinic"],
  ["NM-09", "NM-10", "Sign In"],
  ["NM-10", "NM-11", "Confirm Booking"],
  ["NM-11", "NM-12", "Download Rx"],
  ["MOB-01", "MOB-02", "Sign In"],
  ["MOB-02", "MOB-03", "Patients"],
  ["MOB-03", "MOB-04", "Book"],
  ["MOB-04", "MOB-05", "Confirm"],
  ["MOB-05", "MOB-06", "Open Consult"],
];

const frameRegistry = {};
const hotspots = {};

let fontRegular;
let fontMedium;
let fontBold;

async function loadFonts() {
  const families = [
    ["Inter", "Regular"],
    ["Inter", "Medium"],
    ["Inter", "Bold"],
    ["Roboto", "Regular"],
    ["Roboto", "Medium"],
    ["Roboto", "Bold"],
  ];
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    fontRegular = { family: "Inter", style: "Regular" };
    fontMedium = { family: "Inter", style: "Medium" };
    fontBold = { family: "Inter", style: "Bold" };
  } catch (_) {
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    await figma.loadFontAsync({ family: "Roboto", style: "Medium" });
    await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
    fontRegular = { family: "Roboto", style: "Regular" };
    fontMedium = { family: "Roboto", style: "Medium" };
    fontBold = { family: "Roboto", style: "Bold" };
  }
}

function solid(color, opacity) {
  const paint = { type: "SOLID", color };
  if (opacity !== undefined) paint.opacity = opacity;
  return paint;
}

function rect(parent, x, y, w, h, color, radius) {
  const r = figma.createRectangle();
  r.x = x;
  r.y = y;
  r.resize(w, h);
  r.fills = [solid(color)];
  r.strokes = color === C.white ? [{ type: "SOLID", color: C.border }] : [];
  r.strokeWeight = color === C.white ? 1 : 0;
  if (radius) r.cornerRadius = radius;
  parent.appendChild(r);
  return r;
}

function label(parent, x, y, text, size, weight, color) {
  const t = figma.createText();
  t.fontName = weight === "bold" ? fontBold : weight === "medium" ? fontMedium : fontRegular;
  t.characters = text;
  t.fontSize = size || 14;
  t.fills = [solid(color || C.text)];
  t.x = x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

function button(parent, x, y, w, h, text, primary) {
  const bg = primary ? C.primary : C.white;
  const b = rect(parent, x, y, w, h, bg, 8);
  label(parent, x + 16, y + (h - 14) / 2, text, 13, "medium", primary ? C.white : C.primary);
  b.name = "Hotspot: " + text;
  return b;
}

function addBadge(parent, x, y, text, isNew) {
  const w = text.length * 7 + 20;
  rect(parent, x, y, w, 24, isNew ? C.newBadge : C.mvpBadge, 4);
  label(parent, x + 10, y + 5, text, 11, "medium", isNew ? C.warning : C.muted);
}

function addFlowStart(parent) {
  rect(parent, 24, 24, 160, 32, C.success, 6);
  label(parent, 36, 32, "▶ FLOW START", 12, "bold", C.white);
}

function buildAppShell(parent, meta) {
  const W = parent.width;
  const H = parent.height;
  rect(parent, 0, 0, 240, H, C.white);
  rect(parent, 240, 0, W - 240, 64, C.white);
  rect(parent, 240, 64, W - 240, 1, C.border);
  rect(parent, 0, 64, 240, 1, C.border);
  label(parent, 24, 22, "Doctor CRM", 16, "bold", C.primary);
  if (meta.role) label(parent, 24, 48, meta.role, 11, "regular", C.muted);
  const nav = ["Dashboard", "Patients", "Appointments", "Queue", "Billing", "Settings"];
  nav.forEach((n, i) => {
    const active = i === 0;
    if (active) rect(parent, 12, 88 + i * 40, 216, 36, C.primaryLight, 8);
    label(parent, 24, 98 + i * 40, n, 13, active ? "medium" : "regular", active ? C.primary : C.muted);
  });
  label(parent, 280, 22, meta.title, 20, "bold", C.text);
  label(parent, W - 180, 24, "Demo Clinic · User", 12, "regular", C.muted);
}

function buildDashboardContent(parent, meta) {
  const ox = 280;
  const oy = 96;
  const kpis = ["Today's Patients", "Revenue", "Queue", "Follow-ups", "No-shows"];
  kpis.forEach((k, i) => {
    const x = ox + i * 210;
    rect(parent, x, oy, 190, 88, C.white, 12);
    label(parent, x + 16, oy + 16, k, 11, "regular", C.muted);
    label(parent, x + 16, oy + 44, ["24", "₹12,400", "6", "3", "1"][i], 26, "bold", C.text);
  });
  rect(parent, ox, oy + 112, 520, 280, C.white, 12);
  label(parent, ox + 16, oy + 128, "Chart — Appointments trend", 13, "medium", C.muted);
  rect(parent, ox + 16, oy + 160, 488, 200, C.bg, 8);
  rect(parent, ox + 544, oy + 112, 520, 280, C.white, 12);
  label(parent, ox + 560, oy + 128, "Recent activity", 13, "medium", C.muted);
  for (let i = 0; i < 5; i++) {
    rect(parent, ox + 560, oy + 160 + i * 44, 488, 36, C.bg, 6);
  }
  rect(parent, ox, oy + 412, 1064, 200, C.white, 12);
  label(parent, ox + 16, oy + 428, "Data table", 13, "medium", C.muted);
  for (let r = 0; r < 4; r++) {
    rect(parent, ox + 16, oy + 456 + r * 36, 1032, 32, r === 0 ? C.primaryLight : C.bg, 4);
  }
}

function buildListContent(parent, meta) {
  const ox = 280;
  const oy = 96;
  button(parent, ox, oy, 140, 40, "+ Primary CTA", true);
  rect(parent, ox + 160, oy, 400, 40, C.white, 8);
  label(parent, ox + 176, oy + 12, "Search · filters · date · status", 12, "regular", C.muted);
  rect(parent, ox, oy + 56, 1064, 480, C.white, 12);
  for (let r = 0; r < 10; r++) {
    rect(parent, ox + 16, oy + 72 + r * 44, 1032, 36, r % 2 ? C.bg : C.white, 4);
  }
  label(parent, ox + 16, oy + 548, "Pagination · 1 2 3 …", 12, "regular", C.muted);
}

function buildAuthContent(parent, meta) {
  rect(parent, 520, 140, 400, 520, C.white, 16);
  label(parent, 560, 180, "Doctor CRM", 22, "bold", C.primary);
  label(parent, 560, 220, meta.title, 16, "medium", C.text);
  rect(parent, 560, 260, 320, 44, C.bg, 8);
  label(parent, 576, 274, "Email", 12, "regular", C.muted);
  rect(parent, 560, 320, 320, 44, C.bg, 8);
  label(parent, 576, 334, "Password", 12, "regular", C.muted);
  button(parent, 560, 400, 320, 44, "Sign In", true);
  if (meta.id === "AUTH-01") button(parent, 560, 460, 160, 32, "Forgot password?", false);
}

function buildModalContent(parent, meta) {
  buildAppShell(parent, meta);
  rect(parent, 0, 0, parent.width, parent.height, { r: 0, g: 0, b: 0 }, 0);
  parent.children[parent.children.length - 1].fills = [solid({ r: 0, g: 0, b: 0 }, 0.4)];
  rect(parent, 420, 120, 600, 560, C.white, 16);
  label(parent, 452, 152, meta.title, 18, "bold", C.text);
  for (let i = 0; i < 4; i++) {
    rect(parent, 452, 200 + i * 72, 536, 44, C.bg, 8);
  }
  button(parent, 452, 620, 120, 40, "Save", true);
  button(parent, 584, 620, 100, 40, "Cancel", false);
}

function buildConsultationContent(parent, meta) {
  buildAppShell(parent, meta);
  rect(parent, 280, 96, 1064, 120, C.primaryLight, 12);
  label(parent, 296, 112, "Smart Patient Snapshot — Rajesh Kumar, 42M", 14, "medium", C.text);
  rect(parent, 280, 232, 520, 520, C.white, 12);
  label(parent, 296, 248, "Vitals · Notes · Tabs", 13, "medium", C.muted);
  rect(parent, 816, 232, 528, 520, C.white, 12);
  label(parent, 832, 248, "Symptoms | Diagnosis | Rx | Labs | History", 12, "medium", C.muted);
  button(parent, 280, 768, 160, 44, "Follow-up", false);
  button(parent, 452, 768, 200, 44, "Complete Consultation", true);
}

function buildQueueContent(parent, meta) {
  buildAppShell(parent, meta);
  const cols = ["Waiting", "In Consult", "Completed"];
  cols.forEach((c, i) => {
    const x = 280 + i * 360;
    label(parent, x, 96, c, 14, "bold", C.text);
    rect(parent, x, 124, 340, 600, C.white, 12);
    for (let j = 0; j < 4; j++) {
      rect(parent, x + 12, 140 + j * 100, 316, 88, C.bg, 8);
      label(parent, x + 24, 156 + j * 100, "Token #" + (j + 1), 13, "medium", C.text);
    }
  });
  if (meta.id === "RC-11") {
    rect(parent, 280, 740, 1064, 48, C.primaryLight, 8);
    label(parent, 296, 756, "Switch role: Continue as Doctor →", 14, "medium", C.primary);
  }
}

function buildCoverContent(parent) {
  label(parent, 80, 120, "Doctor CRM", 48, "bold", C.primary);
  label(parent, 80, 190, "Full Flow Wireframe v2", 28, "medium", C.text);
  label(parent, 80, 240, "Stakeholder demo · MVP + proposed modules", 16, "regular", C.muted);
  label(parent, 80, 280, "June 2026 · Desktop 1440×900 · Mobile 390×844", 14, "regular", C.muted);
  rect(parent, 80, 340, 600, 400, C.white, 16);
  label(parent, 104, 368, "Primary demo path", 16, "bold", C.text);
  label(parent, 104, 400, "AUTH-01 → RC-DEMO-01 → Patient → Appt → Pay → Queue → Doctor → Rx → Analytics", 13, "regular", C.muted);
}

function buildMapContent(parent, meta) {
  label(parent, 48, 48, meta.title, 24, "bold", C.text);
  const lanes = meta.id === "MAP-01"
    ? ["Super Admin", "Client Admin", "Reception", "Doctor"]
    : ["Register", "Appointment", "Payment", "Queue", "Consult", "Rx", "Follow-up"];
  lanes.forEach((lane, i) => {
    const y = 120 + i * 160;
    rect(parent, 48, y, 200, 48, C.primaryLight, 8);
    label(parent, 64, y + 16, lane, 14, "medium", C.primary);
    for (let j = 0; j < 5; j++) {
      rect(parent, 280 + j * 200, y + 4, 160, 40, C.white, 8);
    }
  });
}

function buildLegendContent(parent) {
  label(parent, 48, 48, "Component Legend", 24, "bold", C.text);
  addBadge(parent, 48, 100, "NEW", true);
  addBadge(parent, 120, 100, "MVP", false);
  addBadge(parent, 192, 100, "P1", true);
  const items = [
    ["Primary #2563EB", C.primary],
    ["Success", C.success],
    ["Background", C.bg],
    ["Border", C.border],
  ];
  items.forEach(([name, color], i) => {
    rect(parent, 48, 160 + i * 56, 48, 48, color, 8);
    label(parent, 112, 176 + i * 56, name, 14, "regular", C.text);
  });
}

function buildComponentsContent(parent, meta) {
  label(parent, 48, 48, meta.title, 20, "bold", C.text);
  rect(parent, 48, 100, 320, 700, C.white, 12);
  rect(parent, 48, 100, 240, 700, C.white);
  label(parent, 64, 120, "Sidebar 240px", 12, "medium", C.muted);
  rect(parent, 400, 100, 960, 64, C.white, 8);
  label(parent, 416, 122, "Header 64px", 12, "medium", C.muted);
  for (let i = 0; i < 5; i++) {
    rect(parent, 400 + i * 180, 200, 160, 88, C.white, 12);
  }
}

function buildMobileFrame(parent, meta) {
  label(parent, 24, 60, meta.title, 18, "bold", C.text);
  if (meta.type === "mobile-auth") {
    rect(parent, 24, 200, 342, 44, C.bg, 8);
    rect(parent, 24, 260, 342, 44, C.bg, 8);
    button(parent, 24, 340, 342, 48, "Sign In", true);
  } else if (meta.type === "mobile-list") {
    for (let i = 0; i < 4; i++) {
      rect(parent, 24, 100 + i * 120, 342, 100, C.white, 12);
    }
  } else {
    rect(parent, 24, 100, 342, 600, C.white, 12);
    label(parent, 40, 120, meta.type.replace("mobile-", ""), 13, "medium", C.muted);
  }
}

function populateFrame(frame, meta) {
  frame.fills = [solid(C.bg)];
  label(frame, 24, 16, meta.id, 11, "medium", C.muted);
  if (meta.flowStart) addFlowStart(frame);

  if (meta.isNew) addBadge(frame, frame.width - 80, 16, "NEW", true);
  else if (meta.role && !meta.id.startsWith("COMP")) addBadge(frame, frame.width - 80, 16, "MVP", false);

  switch (meta.type) {
    case "cover":
      buildCoverContent(frame);
      break;
    case "map":
      buildMapContent(frame, meta);
      break;
    case "legend":
      buildLegendContent(frame);
      break;
    case "auth":
      buildAuthContent(frame, meta);
      break;
    case "dashboard":
      buildAppShell(frame, meta);
      buildDashboardContent(frame, meta);
      break;
    case "list":
      buildAppShell(frame, meta);
      buildListContent(frame, meta);
      break;
    case "form":
    case "detail":
      buildAppShell(frame, meta);
      buildListContent(frame, meta);
      break;
    case "modal":
      buildModalContent(frame, meta);
      break;
    case "consultation":
      buildConsultationContent(frame, meta);
      break;
    case "queue":
      buildQueueContent(frame, meta);
      break;
    case "components":
      buildComponentsContent(frame, meta);
      break;
    default:
      if (meta.mobile) buildMobileFrame(frame, meta);
      break;
  }
}

function createFrame(parent, meta, col, row, yOffset) {
  const isMobile = meta.mobile;
  const size = isMobile ? MOBILE : DESKTOP;
  const frame = figma.createFrame();
  frame.name = meta.id + " · " + meta.title;
  frame.resize(size.w, size.h);
  frame.x = 40 + col * (size.w + COL_GAP);
  frame.y = (yOffset || 48) + row * (size.h + ROW_GAP);
  populateFrame(frame, meta);
  parent.appendChild(frame);
  frameRegistry[meta.id] = frame;
  return frame;
}

function linkPrototype(fromId, toId, buttonLabel) {
  const from = frameRegistry[fromId];
  const to = frameRegistry[toId];
  if (!from || !to) return;

  let hotspot = from.findOne((n) => n.name === "Hotspot: " + buttonLabel);
  if (!hotspot) {
    const w = Math.min(220, from.width - 48);
    hotspot = button(from, 280, from.height - 72, w, 44, buttonLabel, true);
  }
  hotspot.reactions = [
    {
      trigger: { type: "ON_CLICK" },
      actions: [
        {
          type: "NODE",
          destinationId: to.id,
          navigation: "NAVIGATE",
          transition: { type: "DISSOLVE", duration: 0.2, easing: { type: "EASE_OUT" } },
        },
      ],
    },
  ];
  hotspots[fromId + "→" + toId] = hotspot;
}

async function buildWireframes() {
  await loadFonts();
  figma.notify("Building Doctor CRM wireframes…");

  const page = figma.currentPage;
  page.name = "Doctor CRM — Full Flow v2";

  for (const child of [...page.children]) {
    child.remove();
  }

  let sectionY = 0;

  for (const pageDef of PAGES) {
    const cols = pageDef.frames.some((f) => f.mobile) ? 4 : 2;
    const maxW = Math.max(...pageDef.frames.map((f) => (f.mobile ? MOBILE.w : DESKTOP.w)));
    const maxH = Math.max(...pageDef.frames.map((f) => (f.mobile ? MOBILE.h : DESKTOP.h)));
    const rows = Math.ceil(pageDef.frames.length / cols);
    const sectionW = 40 + cols * (maxW + COL_GAP);
    const sectionH = 48 + rows * (maxH + ROW_GAP) + 24;

    const section = figma.createSection();
    section.name = pageDef.name;
    section.x = 0;
    section.y = sectionY;
    section.resizeWithoutConstraints(sectionW, sectionH);
    page.appendChild(section);

    pageDef.frames.forEach((meta, i) => {
      createFrame(section, meta, i % cols, Math.floor(i / cols), 48);
    });

    sectionY += sectionH + 100;
  }

  for (const [from, to, lbl] of PROTOTYPE_LINKS) {
    linkPrototype(from, to, lbl);
  }

  figma.viewport.scrollAndZoomIntoView(page.children);
  figma.notify("Done! 84 frames on 1 page · prototype links connected.", { timeout: 5000 });
  figma.closePlugin();
}

figma.on("run", ({ command }) => {
  if (command === "build") {
    buildWireframes().catch((err) => {
      figma.notify("Error: " + err.message, { error: true });
      figma.closePlugin();
    });
  }
});

if (figma.command !== "build") {
  figma.showUI(__html__, { width: 300, height: 180, themeColors: true });

  figma.ui.onmessage = (msg) => {
    if (msg.type === "build") {
      buildWireframes().catch((err) => {
        figma.notify("Error: " + err.message, { error: true });
        figma.closePlugin();
      });
    }
  };
}
