const STORAGE_KEY = "maatridev-mediccare-crm-v1";

const ROLE_CONFIG = {
  admin: { label: "Admin", views: ["dashboard", "patients", "appointments", "doctors", "billing", "inventory"] },
  doctor: { label: "Doctor", views: ["dashboard", "patients", "appointments", "doctors"] },
  receptionist: { label: "Receptionist", views: ["dashboard", "patients", "appointments", "billing"] },
};

const menuItems = [
  { id: "dashboard", label: "Dashboard", description: "Daily operations and clinical overview" },
  { id: "patients", label: "Patients", description: "Patient profiles and priority triage list" },
  { id: "appointments", label: "Appointments", description: "Doctor schedules and slot planning" },
  { id: "doctors", label: "Doctors & Staff", description: "Provider roster, department and load" },
  { id: "billing", label: "Billing", description: "Invoices, payments and insurance follow-up" },
  { id: "inventory", label: "Inventory", description: "Pharmacy and consumables monitoring" },
];

const defaultState = {
  view: "dashboard",
  role: "admin",
  chartPeriod: "7d",
  searchQuery: "",
  patients: [
    { name: "Ananya Sharma", age: 31, condition: "Migraine", risk: "warn", doctor: "Dr. R. Nair", city: "Bengaluru" },
    { name: "Rahul Verma", age: 52, condition: "Hypertension", risk: "ok", doctor: "Dr. S. Iqbal", city: "Delhi" },
    { name: "Neha Kapoor", age: 44, condition: "Type 2 Diabetes", risk: "warn", doctor: "Dr. R. Nair", city: "Pune" },
    { name: "Meenakshi Iyer", age: 67, condition: "Post-op Recovery", risk: "danger", doctor: "Dr. K. Rao", city: "Chennai" },
  ],
  appointments: [
    { patient: "Ananya Sharma", doctor: "Dr. R. Nair", slot: "2026-05-12 14:30", status: "Confirmed" },
    { patient: "Rahul Verma", doctor: "Dr. S. Iqbal", slot: "2026-05-12 16:00", status: "Pending" },
    { patient: "Meenakshi Iyer", doctor: "Dr. K. Rao", slot: "2026-05-13 10:00", status: "Critical Follow-up" },
  ],
  doctors: [
    { name: "Dr. R. Nair", dept: "Neurology", patients: 18, utilization: "78%" },
    { name: "Dr. S. Iqbal", dept: "Cardiology", patients: 23, utilization: "84%" },
    { name: "Dr. K. Rao", dept: "General Surgery", patients: 12, utilization: "63%" },
    { name: "Dr. P. Singh", dept: "Pediatrics", patients: 16, utilization: "72%" },
  ],
  staff: [
    { name: "Priya Menon", role: "Nurse", shift: "Morning" },
    { name: "Arvind Kumar", role: "Lab Technician", shift: "Evening" },
  ],
  invoices: [
    { id: "INV-IND-2901", patient: "Rahul Verma", amount: 4200, status: "Paid" },
    { id: "INV-IND-2902", patient: "Meenakshi Iyer", amount: 18500, status: "Insurance Review" },
    { id: "INV-IND-2903", patient: "Ananya Sharma", amount: 2650, status: "Due" },
  ],
  inventoryItems: [
    { item: "Insulin Vials", unit: "Cold Storage", onHand: 28, alert: "Low" },
    { item: "Surgical Gloves", unit: "Boxes", onHand: 104, alert: "Good" },
    { item: "IV Fluid", unit: "Packs", onHand: 12, alert: "Critical" },
  ],
  kitRequests: [
    { department: "ER", requested: "BP cuffs x6", eta: "Today 18:00" },
    { department: "OT", requested: "Sutures x20", eta: "Tomorrow 09:00" },
    { department: "Pediatrics", requested: "Nebulizer kits x10", eta: "Today 16:30" },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const saved = JSON.parse(raw);
    const next = { ...structuredClone(defaultState), ...saved, searchQuery: "" };
    if (!ROLE_CONFIG[next.role]) next.role = "admin";
    next.appointments = (next.appointments || []).filter(
      (a) => a && String(a.patient || "").trim() && String(a.doctor || "").trim() && String(a.slot || "").trim()
    );
    return next;
  } catch {
    return structuredClone(defaultState);
  }
}

const state = loadState();
let undoTimer = null;
let undoAction = null;

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, searchQuery: "" }));
}

const menu = document.getElementById("menu");
const titleEl = document.getElementById("view-title");
const descEl = document.getElementById("view-description");
const kpiGrid = document.getElementById("kpi-grid");
const workspace = document.getElementById("workspace");
const sidebar = document.getElementById("sidebar");
const roleSelect = document.getElementById("role-select");
const chartTooltip = document.getElementById("chart-tooltip");

const toastEl = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastUndoBtn = document.getElementById("toast-undo-btn");

const quickAddDialog = document.getElementById("quick-add-dialog");
const appointmentForm = document.getElementById("appointment-form");
const quickAddBtn = document.getElementById("quick-add-btn");
const secondaryActionBtn = document.getElementById("secondary-action-btn");
const globalSearchInput = document.getElementById("global-search");
const menuToggleBtn = document.getElementById("menu-toggle-btn");
const patientDialog = document.getElementById("patient-dialog");
const patientForm = document.getElementById("patient-form");
const patientFormTitle = document.getElementById("patient-form-title");
const doctorDialog = document.getElementById("doctor-dialog");
const doctorForm = document.getElementById("doctor-form");
const staffDialog = document.getElementById("staff-dialog");
const staffForm = document.getElementById("staff-form");
const invoiceDialog = document.getElementById("invoice-dialog");
const invoiceForm = document.getElementById("invoice-form");
const inventoryDialog = document.getElementById("inventory-dialog");
const inventoryForm = document.getElementById("inventory-form");
const kitDialog = document.getElementById("kit-dialog");
const kitForm = document.getElementById("kit-form");

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function showToast(message, options = {}) {
  toastMessage.textContent = message;
  toastEl.classList.add("show");
  toastUndoBtn.classList.remove("show");
  toastUndoBtn.onclick = null;
  if (undoTimer) clearTimeout(undoTimer);

  if (options.undo) {
    undoAction = options.undo;
    toastUndoBtn.classList.add("show");
    toastUndoBtn.onclick = () => {
      if (undoAction) undoAction();
      undoAction = null;
      toastEl.classList.remove("show");
      toastUndoBtn.classList.remove("show");
    };
  }

  undoTimer = window.setTimeout(() => {
    undoAction = null;
    toastEl.classList.remove("show");
    toastUndoBtn.classList.remove("show");
  }, options.duration || 2600);
}

function riskBadge(value) {
  const map = { ok: "Stable", warn: "Monitor", danger: "High Risk" };
  return `<span class="badge badge--${value}">${map[value] || "Unknown"}</span>`;
}

function statusBadge(status) {
  const val = status.toLowerCase();
  if (val.includes("paid") || val.includes("confirmed") || val.includes("good")) return `<span class="badge badge--ok">${status}</span>`;
  if (val.includes("pending") || val.includes("review") || val.includes("low") || val.includes("part") || val.includes("rescheduled")) {
    return `<span class="badge badge--warn">${status}</span>`;
  }
  return `<span class="badge badge--danger">${status}</span>`;
}

function allowedViews() {
  return ROLE_CONFIG[state.role].views;
}

function ensureAllowedView() {
  if (!allowedViews().includes(state.view)) state.view = "dashboard";
}

function renderMenu() {
  menu.innerHTML = "";
  menuItems
    .filter((item) => allowedViews().includes(item.id))
    .forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = item.label;
      if (item.id === state.view) btn.classList.add("active");
      btn.addEventListener("click", () => {
        state.view = item.id;
        render();
        sidebar.classList.remove("open");
      });
      menu.appendChild(btn);
    });
}

function renderKpis() {
  const priorityCount = state.patients.filter((p) => p.risk !== "ok").length;
  const unpaid = state.invoices.filter((i) => i.status !== "Paid").reduce((sum, row) => sum + row.amount, 0);
  const kpis = [
    { title: "Active Patients", value: state.patients.length },
    { title: "Today's Appointments", value: state.appointments.length },
    { title: "Doctors On Duty", value: state.doctors.length },
    { title: "High Priority Cases", value: priorityCount },
    { title: "Outstanding Revenue", value: formatINR(unpaid) },
  ];
  kpiGrid.innerHTML = kpis
    .map((k) => `<article class="card"><p class="card__title">${k.title}</p><p class="card__value">${k.value}</p></article>`)
    .join("");
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join(
    ""
  )}</tbody></table></div>`;
}

function chartDataForPeriod() {
  if (state.chartPeriod === "30d") {
    return { labels: ["W1", "W2", "W3", "W4"], values: [420, 465, 438, 501], suffix: "patients/week" };
  }
  return { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [48, 61, 55, 72, 67, 75, 82], suffix: "patients/day" };
}

function renderCharts() {
  const opd = chartDataForPeriod();
  const max = Math.max(...opd.values, 1);
  const deptLoad = [
    { dept: "Cardiology", pct: 84 },
    { dept: "Neurology", pct: 78 },
    { dept: "Pediatrics", pct: 72 },
    { dept: "Surgery", pct: 63 },
  ];
  return `
    <section class="split">
      <article class="panel">
        <div class="panel__head">
          <h3>OPD Footfall</h3>
          <select data-action="chart-period">
            <option value="7d" ${state.chartPeriod === "7d" ? "selected" : ""}>7 Days</option>
            <option value="30d" ${state.chartPeriod === "30d" ? "selected" : ""}>30 Days</option>
          </select>
        </div>
        <div class="mini-chart">
          ${opd.values
            .map(
              (v, i) => `
              <div class="mini-chart__col">
                <div class="mini-chart__bar-wrap">
                  <div class="mini-chart__bar" data-tooltip="${opd.labels[i]}: ${v} ${opd.suffix}" style="height:${Math.max(
                    12,
                    (v / max) * 100
                  )}%"></div>
                </div>
                <span>${opd.labels[i]}</span>
              </div>`
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        <h3>Department Load</h3>
        <div class="load-list">
          ${deptLoad
            .map(
              (d) => `
              <div class="load-list__row">
                <div class="load-list__meta"><span>${d.dept}</span><strong>${d.pct}%</strong></div>
                <div class="load-list__track"><div class="load-list__fill" data-tooltip="${d.dept}: ${d.pct}% utilization" style="width:${d.pct}%"></div></div>
              </div>`
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderDashboard() {
  return `${renderCharts()}
    <section class="split">
      <article class="panel">
        <h3>Today's Appointments</h3>
        ${table(
          ["Patient", "Doctor", "Slot", "Status"],
          state.appointments.map(
            (a) => `<tr><td>${a.patient}</td><td>${a.doctor}</td><td>${a.slot}</td><td>${statusBadge(a.status)}</td></tr>`
          )
        )}
      </article>
      <article class="panel">
        <h3>Triage Queue</h3>
        ${table(
          ["Patient", "Condition", "City", "Assigned To", "Priority"],
          state.patients.map(
            (p) =>
              `<tr><td>${p.name}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td><td>${riskBadge(p.risk)}</td></tr>`
          )
        )}
      </article>
    </section>`;
}

function renderPatients() {
  const canModify = state.role !== "doctor";
  return `<article class="panel">
      <div class="panel__head">
        <h3>Patient Registry</h3>
        ${canModify ? '<button class="btn btn--primary" data-action="add-patient">+ Add Patient</button>' : '<span class="badge badge--warn">Read Only</span>'}
      </div>
      ${table(
        ["Name", "Age", "Condition", "City", "Assigned Doctor", "Risk", "Actions"],
        state.patients.map(
          (p, idx) => `<tr>
            <td>${p.name}</td><td>${p.age}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td><td>${riskBadge(p.risk)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="edit-patient" data-index="${idx}" ${canModify ? "" : "disabled"}>Edit</button>
              <button class="btn mini-btn btn--danger" data-action="delete-patient" data-index="${idx}" ${canModify ? "" : "disabled"}>Delete</button>
            </div></td>
          </tr>`
        )
      )}
    </article>`;
}

function renderAppointments() {
  return `<article class="panel">
      <h3>Appointment Schedule</h3>
      ${table(
        ["Patient", "Doctor", "Date & Time", "Status", "Actions"],
        state.appointments.map(
          (a, idx) => `<tr>
            <td>${a.patient}</td><td>${a.doctor}</td><td>${a.slot}</td><td>${statusBadge(a.status)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="reschedule-appointment" data-index="${idx}">Reschedule</button>
              <button class="btn mini-btn btn--danger" data-action="cancel-appointment" data-index="${idx}">Cancel</button>
            </div></td>
          </tr>`
        )
      )}
    </article>`;
}

function renderDoctors() {
  const canModify = state.role === "admin";
  return `<section class="split">
      <article class="panel">
        <div class="panel__head">
          <h3>Provider Capacity</h3>
          ${canModify ? '<button class="btn btn--primary" data-action="add-doctor">+ Add Doctor</button>' : '<span class="badge badge--warn">Read Only</span>'}
        </div>
        ${table(
          ["Name", "Department", "Current Patients", "Utilization", "Actions"],
          state.doctors.map(
            (d, idx) =>
              `<tr><td>${d.name}</td><td>${d.dept}</td><td>${d.patients}</td><td>${d.utilization}</td><td><button class="btn mini-btn btn--danger" data-action="remove-doctor" data-index="${idx}" ${
                canModify ? "" : "disabled"
              }>Remove</button></td></tr>`
          )
        )}
      </article>
      <article class="panel">
        <div class="panel__head">
          <h3>Staff Roster</h3>
          ${canModify ? '<button class="btn btn--primary" data-action="add-staff">+ Add Staff</button>' : '<span class="badge badge--warn">Read Only</span>'}
        </div>
        ${table(
          ["Name", "Role", "Shift", "Actions"],
          state.staff.map(
            (s, idx) =>
              `<tr><td>${s.name}</td><td>${s.role}</td><td>${s.shift}</td><td><button class="btn mini-btn btn--danger" data-action="remove-staff" data-index="${idx}" ${
                canModify ? "" : "disabled"
              }>Remove</button></td></tr>`
          )
        )}
      </article>
    </section>`;
}

function renderBilling() {
  const canModify = state.role !== "doctor";
  return `<article class="panel">
      <div class="panel__head">
        <h3>Invoice & Insurance Desk</h3>
        ${canModify ? '<button class="btn btn--primary" data-action="add-invoice">+ Add Invoice</button>' : '<span class="badge badge--warn">Read Only</span>'}
      </div>
      ${table(
        ["Invoice", "Patient", "Amount", "Status", "Actions"],
        state.invoices.map(
          (i, idx) => `<tr>
            <td>${i.id}</td><td>${i.patient}</td><td>${formatINR(i.amount)}</td><td>${statusBadge(i.status)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="mark-paid" data-index="${idx}" ${canModify ? "" : "disabled"}>Mark Paid</button>
              <button class="btn mini-btn" data-action="mark-partial" data-index="${idx}" ${canModify ? "" : "disabled"}>Partial</button>
              <button class="btn mini-btn btn--danger" data-action="remove-invoice" data-index="${idx}" ${canModify ? "" : "disabled"}>Remove</button>
            </div></td>
          </tr>`
        )
      )}
    </article>`;
}

function renderInventory() {
  const canModify = state.role !== "doctor";
  return `<section class="split">
      <article class="panel">
        <div class="panel__head">
          <h3>Medication Stock Alerts</h3>
          ${canModify ? '<button class="btn btn--primary" data-action="add-inventory-item">+ Add Item</button>' : '<span class="badge badge--warn">Read Only</span>'}
        </div>
        ${table(
          ["Item", "Unit", "On Hand", "Alert", "Actions"],
          state.inventoryItems.map(
            (r, idx) =>
              `<tr><td>${r.item}</td><td>${r.unit}</td><td>${r.onHand}</td><td>${statusBadge(r.alert)}</td><td><button class="btn mini-btn btn--danger" data-action="remove-inventory-item" data-index="${idx}" ${
                canModify ? "" : "disabled"
              }>Remove</button></td></tr>`
          )
        )}
      </article>
      <article class="panel">
        <div class="panel__head">
          <h3>Department Kit Requests</h3>
          ${canModify ? '<button class="btn btn--primary" data-action="add-kit-request">+ Add Request</button>' : '<span class="badge badge--warn">Read Only</span>'}
        </div>
        ${table(
          ["Department", "Requested", "ETA", "Actions"],
          state.kitRequests.map(
            (r, idx) =>
              `<tr><td>${r.department}</td><td>${r.requested}</td><td>${r.eta}</td><td><button class="btn mini-btn btn--danger" data-action="remove-kit-request" data-index="${idx}" ${
                canModify ? "" : "disabled"
              }>Remove</button></td></tr>`
          )
        )}
      </article>
    </section>`;
}

function renderSearchResults(query) {
  const q = query.toLowerCase();
  const matchedPatients = state.patients.filter((p) => [p.name, p.condition, p.doctor, p.city].join(" ").toLowerCase().includes(q));
  const matchedInvoices = state.invoices.filter((i) => [i.id, i.patient, i.status].join(" ").toLowerCase().includes(q));
  workspace.innerHTML = `<article class="panel">
      <h3>Search Results</h3>
      <p>Patients: ${matchedPatients.length} | Invoices: ${matchedInvoices.length}</p>
      ${
        matchedPatients.length
          ? table(
              ["Name", "Condition", "City", "Doctor"],
              matchedPatients.map((p) => `<tr><td>${p.name}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td></tr>`)
            )
          : "<p>No matching patients found.</p>"
      }
    </article>`;
}

function renderWorkspace() {
  if (state.searchQuery) return renderSearchResults(state.searchQuery);
  if (state.view === "dashboard") workspace.innerHTML = renderDashboard();
  else if (state.view === "patients") workspace.innerHTML = renderPatients();
  else if (state.view === "appointments") workspace.innerHTML = renderAppointments();
  else if (state.view === "doctors") workspace.innerHTML = renderDoctors();
  else if (state.view === "billing") workspace.innerHTML = renderBilling();
  else workspace.innerHTML = renderInventory();
}

function render() {
  ensureAllowedView();
  roleSelect.value = state.role;
  const active = menuItems.find((x) => x.id === state.view);
  titleEl.textContent = `${active.label} (${ROLE_CONFIG[state.role].label})`;
  descEl.textContent = active.description;
  renderMenu();
  renderKpis();
  renderWorkspace();
}

function openPatientDialog(mode, index) {
  if (mode === "edit") {
    const patient = state.patients[index];
    patientFormTitle.textContent = "Edit Patient";
    patientForm.patientIndex.value = index;
    patientForm.name.value = patient.name;
    patientForm.age.value = patient.age;
    patientForm.condition.value = patient.condition;
    patientForm.city.value = patient.city;
    patientForm.doctor.value = patient.doctor;
    patientForm.risk.value = patient.risk;
  } else {
    patientFormTitle.textContent = "Add Patient";
    patientForm.reset();
    patientForm.patientIndex.value = "";
    patientForm.risk.value = "ok";
  }
  patientDialog.showModal();
}

quickAddBtn.addEventListener("click", () => quickAddDialog.showModal());

secondaryActionBtn.addEventListener("click", () => {
  const exportPayload = {
    generatedAt: new Date().toISOString(),
    clinic: "MaatriDev MedicCare",
    role: state.role,
    patients: state.patients.length,
    appointments: state.appointments.length,
    outstandingRevenueINR: state.invoices.filter((i) => i.status !== "Paid").reduce((sum, i) => sum + i.amount, 0),
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "maatridev-summary.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Summary exported successfully");
});

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    quickAddDialog.close();
    return;
  }
  const form = new FormData(appointmentForm);
  state.appointments.unshift({
    patient: String(form.get("patient")),
    doctor: String(form.get("doctor")),
    slot: String(form.get("slot")).replace("T", " "),
    status: "Pending",
  });
  quickAddDialog.close();
  appointmentForm.reset();
  state.view = "appointments";
  state.searchQuery = "";
  persistState();
  render();
  showToast("Appointment created");
});

patientForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    patientDialog.close();
    return;
  }
  const form = new FormData(patientForm);
  const payload = {
    name: String(form.get("name")).trim(),
    age: Number(form.get("age")),
    condition: String(form.get("condition")).trim(),
    city: String(form.get("city")).trim(),
    doctor: String(form.get("doctor")).trim(),
    risk: String(form.get("risk")),
  };
  const idx = form.get("patientIndex");
  if (idx !== "") {
    state.patients[Number(idx)] = payload;
    showToast("Patient updated");
  } else {
    state.patients.unshift(payload);
    showToast("Patient added");
  }
  patientDialog.close();
  persistState();
  state.view = "patients";
  state.searchQuery = "";
  render();
});

doctorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    doctorDialog.close();
    return;
  }
  const form = new FormData(doctorForm);
  state.doctors.unshift({
    name: String(form.get("name")).trim(),
    dept: String(form.get("dept")).trim(),
    patients: Number(form.get("patients")),
    utilization: String(form.get("utilization")).trim(),
  });
  doctorDialog.close();
  doctorForm.reset();
  persistState();
  render();
  showToast("Doctor added");
});

staffForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    staffDialog.close();
    return;
  }
  const form = new FormData(staffForm);
  state.staff.unshift({
    name: String(form.get("name")).trim(),
    role: String(form.get("role")).trim(),
    shift: String(form.get("shift")).trim(),
  });
  staffDialog.close();
  staffForm.reset();
  persistState();
  render();
  showToast("Staff member added");
});

invoiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    invoiceDialog.close();
    return;
  }
  const form = new FormData(invoiceForm);
  state.invoices.unshift({
    id: `INV-IND-${Math.floor(1000 + Math.random() * 9000)}`,
    patient: String(form.get("patient")).trim(),
    amount: Number(form.get("amount")),
    status: String(form.get("status")),
  });
  invoiceDialog.close();
  invoiceForm.reset();
  persistState();
  render();
  showToast("Invoice added");
});

inventoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    inventoryDialog.close();
    return;
  }
  const form = new FormData(inventoryForm);
  state.inventoryItems.unshift({
    item: String(form.get("item")).trim(),
    unit: String(form.get("unit")).trim(),
    onHand: Number(form.get("onHand")),
    alert: String(form.get("alert")),
  });
  inventoryDialog.close();
  inventoryForm.reset();
  persistState();
  render();
  showToast("Inventory item added");
});

kitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.submitter && event.submitter.value === "cancel") {
    kitDialog.close();
    return;
  }
  const form = new FormData(kitForm);
  state.kitRequests.unshift({
    department: String(form.get("department")).trim(),
    requested: String(form.get("requested")).trim(),
    eta: String(form.get("eta")).trim(),
  });
  kitDialog.close();
  kitForm.reset();
  persistState();
  render();
  showToast("Kit request added");
});

workspace.addEventListener("change", (event) => {
  if (event.target.matches('[data-action="chart-period"]')) {
    state.chartPeriod = event.target.value;
    persistState();
    renderWorkspace();
  }
});

workspace.addEventListener("mouseover", (event) => {
  const t = event.target.closest("[data-tooltip]");
  if (!t) return;
  chartTooltip.textContent = t.dataset.tooltip;
  chartTooltip.classList.add("show");
});

workspace.addEventListener("mousemove", (event) => {
  if (!chartTooltip.classList.contains("show")) return;
  chartTooltip.style.left = `${event.clientX + 12}px`;
  chartTooltip.style.top = `${event.clientY + 12}px`;
});

workspace.addEventListener("mouseout", (event) => {
  if (event.target.closest("[data-tooltip]")) chartTooltip.classList.remove("show");
});

workspace.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  const index = Number(trigger.dataset.index);

  if (action === "add-patient") return openPatientDialog("add");
  if (action === "edit-patient") return openPatientDialog("edit", index);

  if (action === "delete-patient") {
    const removed = state.patients[index];
    if (!window.confirm(`Delete patient "${removed.name}"?`)) return;
    state.patients.splice(index, 1);
    persistState();
    render();
    return showToast("Patient deleted", {
      undo: () => {
        state.patients.splice(index, 0, removed);
        persistState();
        render();
        showToast("Delete undone");
      },
      duration: 5000,
    });
  }

  if (action === "reschedule-appointment") {
    const before = { ...state.appointments[index] };
    const current = before.slot.replace(" ", "T");
    const next = window.prompt("Enter new slot (YYYY-MM-DDTHH:mm)", current);
    if (!next) return;
    state.appointments[index].slot = next.replace("T", " ");
    state.appointments[index].status = "Rescheduled";
    persistState();
    render();
    return showToast("Appointment rescheduled", {
      undo: () => {
        state.appointments[index] = before;
        persistState();
        render();
        showToast("Reschedule undone");
      },
      duration: 5000,
    });
  }

  if (action === "cancel-appointment") {
    const before = { ...state.appointments[index] };
    if (!window.confirm("Cancel this appointment?")) return;
    state.appointments[index].status = "Cancelled";
    persistState();
    render();
    return showToast("Appointment cancelled", {
      undo: () => {
        state.appointments[index] = before;
        persistState();
        render();
        showToast("Cancellation undone");
      },
      duration: 5000,
    });
  }

  if (action === "mark-paid") {
    state.invoices[index].status = "Paid";
    persistState();
    render();
    return showToast("Invoice marked as paid");
  }

  if (action === "mark-partial") {
    state.invoices[index].status = "Partially Paid";
    persistState();
    render();
    return showToast("Invoice marked as partial");
  }

  if (action === "add-doctor") {
    doctorForm.reset();
    return doctorDialog.showModal();
  }

  if (action === "remove-doctor") {
    if (!window.confirm("Remove this doctor?")) return;
    state.doctors.splice(index, 1);
    persistState();
    render();
    return showToast("Doctor removed");
  }

  if (action === "add-staff") {
    staffForm.reset();
    return staffDialog.showModal();
  }

  if (action === "remove-staff") {
    if (!window.confirm("Remove this staff member?")) return;
    state.staff.splice(index, 1);
    persistState();
    render();
    return showToast("Staff member removed");
  }

  if (action === "add-invoice") {
    invoiceForm.reset();
    return invoiceDialog.showModal();
  }

  if (action === "remove-invoice") {
    if (!window.confirm("Remove this invoice?")) return;
    state.invoices.splice(index, 1);
    persistState();
    render();
    return showToast("Invoice removed");
  }

  if (action === "add-inventory-item") {
    inventoryForm.reset();
    return inventoryDialog.showModal();
  }

  if (action === "remove-inventory-item") {
    if (!window.confirm("Remove this inventory item?")) return;
    state.inventoryItems.splice(index, 1);
    persistState();
    render();
    return showToast("Inventory item removed");
  }

  if (action === "add-kit-request") {
    kitForm.reset();
    return kitDialog.showModal();
  }

  if (action === "remove-kit-request") {
    if (!window.confirm("Remove this kit request?")) return;
    state.kitRequests.splice(index, 1);
    persistState();
    render();
    return showToast("Kit request removed");
  }
});

globalSearchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value.trim();
  renderWorkspace();
});

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  persistState();
  render();
  showToast(`Role switched to ${ROLE_CONFIG[state.role].label}`);
});

menuToggleBtn.addEventListener("click", () => sidebar.classList.toggle("open"));

render();
