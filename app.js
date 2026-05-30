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

const state = {
  view: "dashboard",
  role: "admin",
  chartPeriod: "7d",
  searchQuery: "",
  patients: [],
  appointments: [],
  doctors: [],
  staff: [],
  invoices: [],
  inventoryItems: [],
  kitRequests: [],
  dashboard: { footfall: { labels: [], values: [], suffix: "" }, deptLoad: [] },
};

let undoTimer = null;
let undoAction = null;

const menu = document.getElementById("menu");
const titleEl = document.getElementById("view-title");
const descEl = document.getElementById("view-description");
const kpiGrid = document.getElementById("kpi-grid");
const workspace = document.getElementById("workspace");
const sidebar = document.getElementById("sidebar");
const roleSelect = document.getElementById("role-select");
const chartTooltip = document.getElementById("chart-tooltip");
const appEl = document.querySelector(".app");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userLabel = document.getElementById("user-label");

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
  return ROLE_CONFIG[state.role]?.views || ROLE_CONFIG.admin.views;
}

function ensureAllowedView() {
  if (!allowedViews().includes(state.view)) state.view = "dashboard";
}

async function loadAllData() {
  const [patients, appointments, doctors, staff, invoices, inventoryItems, kitRequests, dashboard] = await Promise.all([
    API.list("patients"),
    API.list("appointments"),
    API.list("doctors"),
    API.list("staff"),
    API.list("invoices"),
    API.list("inventory_items"),
    API.list("kit_requests"),
    API.dashboard(state.chartPeriod),
  ]);
  state.patients = patients;
  state.appointments = appointments;
  state.doctors = doctors;
  state.staff = staff;
  state.invoices = invoices;
  state.inventoryItems = inventoryItems;
  state.kitRequests = kitRequests;
  state.dashboard = dashboard;
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
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function renderCharts() {
  const opd = state.dashboard.footfall;
  const max = Math.max(...(opd.values || [1]), 1);
  const deptLoad = state.dashboard.deptLoad?.length
    ? state.dashboard.deptLoad
    : [
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
          ${(opd.values || [])
            .map(
              (v, i) => `
              <div class="mini-chart__col">
                <div class="mini-chart__bar-wrap">
                  <div class="mini-chart__bar" data-tooltip="${opd.labels[i]}: ${v} ${opd.suffix || ""}" style="height:${Math.max(12, (v / max) * 100)}%"></div>
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
    </section>`;
}

function renderDashboard() {
  return `${renderCharts()}
    <section class="split">
      <article class="panel">
        <h3>Today's Appointments</h3>
        ${table(
          ["Patient", "Doctor", "Slot", "Status"],
          state.appointments.map((a) => `<tr><td>${a.patient}</td><td>${a.doctor}</td><td>${a.slot}</td><td>${statusBadge(a.status)}</td></tr>`)
        )}
      </article>
      <article class="panel">
        <h3>Triage Queue</h3>
        ${table(
          ["Patient", "Condition", "City", "Assigned To", "Priority"],
          state.patients.map((p) => `<tr><td>${p.name}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td><td>${riskBadge(p.risk)}</td></tr>`)
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
          (p) => `<tr>
            <td>${p.name}</td><td>${p.age}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td><td>${riskBadge(p.risk)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="edit-patient" data-id="${p.id}" ${canModify ? "" : "disabled"}>Edit</button>
              <button class="btn mini-btn btn--danger" data-action="delete-patient" data-id="${p.id}" ${canModify ? "" : "disabled"}>Delete</button>
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
          (a) => `<tr>
            <td>${a.patient}</td><td>${a.doctor}</td><td>${a.slot}</td><td>${statusBadge(a.status)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="reschedule-appointment" data-id="${a.id}">Reschedule</button>
              <button class="btn mini-btn btn--danger" data-action="cancel-appointment" data-id="${a.id}">Cancel</button>
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
            (d) =>
              `<tr><td>${d.name}</td><td>${d.dept}</td><td>${d.patients}</td><td>${d.utilization}</td><td><button class="btn mini-btn btn--danger" data-action="remove-doctor" data-id="${d.id}" ${canModify ? "" : "disabled"}>Remove</button></td></tr>`
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
            (s) =>
              `<tr><td>${s.name}</td><td>${s.role}</td><td>${s.shift}</td><td><button class="btn mini-btn btn--danger" data-action="remove-staff" data-id="${s.id}" ${canModify ? "" : "disabled"}>Remove</button></td></tr>`
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
          (i) => `<tr>
            <td>${i.id}</td><td>${i.patient}</td><td>${formatINR(i.amount)}</td><td>${statusBadge(i.status)}</td>
            <td><div class="row-actions">
              <button class="btn mini-btn" data-action="mark-paid" data-id="${i.id}" ${canModify ? "" : "disabled"}>Mark Paid</button>
              <button class="btn mini-btn" data-action="mark-partial" data-id="${i.id}" ${canModify ? "" : "disabled"}>Partial</button>
              <button class="btn mini-btn btn--danger" data-action="remove-invoice" data-id="${i.id}" ${canModify ? "" : "disabled"}>Remove</button>
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
            (r) =>
              `<tr><td>${r.item}</td><td>${r.unit}</td><td>${r.onHand}</td><td>${statusBadge(r.alert)}</td><td><button class="btn mini-btn btn--danger" data-action="remove-inventory-item" data-id="${r.id}" ${canModify ? "" : "disabled"}>Remove</button></td></tr>`
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
            (r) =>
              `<tr><td>${r.department}</td><td>${r.requested}</td><td>${r.eta}</td><td><button class="btn mini-btn btn--danger" data-action="remove-kit-request" data-id="${r.id}" ${canModify ? "" : "disabled"}>Remove</button></td></tr>`
          )
        )}
      </article>
    </section>`;
}

async function renderSearchResults(query) {
  try {
    const { patients, invoices } = await API.search(query);
    workspace.innerHTML = `<article class="panel">
        <h3>Search Results</h3>
        <p>Patients: ${patients.length} | Invoices: ${invoices.length}</p>
        ${
          patients.length
            ? table(
                ["Name", "Condition", "City", "Doctor"],
                patients.map((p) => `<tr><td>${p.name}</td><td>${p.condition}</td><td>${p.city}</td><td>${p.doctor}</td></tr>`)
              )
            : "<p>No matching patients found.</p>"
        }
      </article>`;
  } catch (e) {
    showToast(e.message);
  }
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

function findById(list, id) {
  return list.find((x) => x.id === id);
}

function openPatientDialog(mode, id) {
  if (mode === "edit") {
    const patient = findById(state.patients, id);
    patientFormTitle.textContent = "Edit Patient";
    patientForm.patientId.value = id;
    patientForm.name.value = patient.name;
    patientForm.age.value = patient.age;
    patientForm.condition.value = patient.condition;
    patientForm.city.value = patient.city;
    patientForm.doctor.value = patient.doctor;
    patientForm.risk.value = patient.risk;
  } else {
    patientFormTitle.textContent = "Add Patient";
    patientForm.reset();
    patientForm.patientId.value = "";
    patientForm.risk.value = "ok";
  }
  patientDialog.showModal();
}

async function refresh() {
  await loadAllData();
  render();
}

function showApp(user) {
  state.role = user.role in ROLE_CONFIG ? user.role : "admin";
  userLabel.textContent = user.name || user.email;
  appEl.classList.remove("hidden");
  loginDialog.close();
  refresh();
}

function showLogin() {
  appEl.classList.add("hidden");
  loginDialog.showModal();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(loginForm);
  try {
    const { token, user } = await API.login(String(fd.get("email")), String(fd.get("password")));
    setAuth(token, user);
    showApp(user);
    showToast(`Welcome, ${user.name || user.email}`);
  } catch (err) {
    showToast(err.message);
  }
});

logoutBtn.addEventListener("click", () => {
  clearAuth();
  showLogin();
});

quickAddBtn.addEventListener("click", () => quickAddDialog.showModal());

secondaryActionBtn.addEventListener("click", async () => {
  try {
    const exportPayload = await API.exportSummary();
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "maatridev-summary.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Summary exported successfully");
  } catch (e) {
    showToast(e.message);
  }
});

appointmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return appointmentForm.closest("dialog").close();
  const form = new FormData(appointmentForm);
  try {
    await API.create("appointments", {
      patient: String(form.get("patient")),
      doctor: String(form.get("doctor")),
      slot: String(form.get("slot")).replace("T", " "),
      status: "Pending",
    });
    appointmentForm.closest("dialog").close();
    appointmentForm.reset();
    state.view = "appointments";
    state.searchQuery = "";
    await refresh();
    showToast("Appointment created");
  } catch (e) {
    showToast(e.message);
  }
});

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return patientDialog.close();
  const form = new FormData(patientForm);
  const payload = {
    name: String(form.get("name")).trim(),
    age: Number(form.get("age")),
    condition: String(form.get("condition")).trim(),
    city: String(form.get("city")).trim(),
    doctor: String(form.get("doctor")).trim(),
    risk: String(form.get("risk")),
  };
  const id = form.get("patientId");
  try {
    if (id) await API.update("patients", id, payload);
    else await API.create("patients", payload);
    patientDialog.close();
    state.view = "patients";
    state.searchQuery = "";
    await refresh();
    showToast(id ? "Patient updated" : "Patient added");
  } catch (e) {
    showToast(e.message);
  }
});

doctorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return doctorDialog.close();
  const form = new FormData(doctorForm);
  try {
    await API.create("doctors", {
      name: String(form.get("name")).trim(),
      dept: String(form.get("dept")).trim(),
      patients: Number(form.get("patients")),
      utilization: String(form.get("utilization")).trim(),
    });
    doctorDialog.close();
    doctorForm.reset();
    await refresh();
    showToast("Doctor added");
  } catch (e) {
    showToast(e.message);
  }
});

staffForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return staffDialog.close();
  const form = new FormData(staffForm);
  try {
    await API.create("staff", {
      name: String(form.get("name")).trim(),
      role: String(form.get("role")).trim(),
      shift: String(form.get("shift")).trim(),
    });
    staffDialog.close();
    staffForm.reset();
    await refresh();
    showToast("Staff member added");
  } catch (e) {
    showToast(e.message);
  }
});

invoiceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return invoiceDialog.close();
  const form = new FormData(invoiceForm);
  try {
    await API.create("invoices", {
      id: `INV-IND-${Math.floor(1000 + Math.random() * 9000)}`,
      patient: String(form.get("patient")).trim(),
      amount: Number(form.get("amount")),
      status: String(form.get("status")),
    });
    invoiceDialog.close();
    invoiceForm.reset();
    await refresh();
    showToast("Invoice added");
  } catch (e) {
    showToast(e.message);
  }
});

inventoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return inventoryDialog.close();
  const form = new FormData(inventoryForm);
  try {
    await API.create("inventory_items", {
      item: String(form.get("item")).trim(),
      unit: String(form.get("unit")).trim(),
      onHand: Number(form.get("onHand")),
      alert: String(form.get("alert")),
    });
    inventoryDialog.close();
    inventoryForm.reset();
    await refresh();
    showToast("Inventory item added");
  } catch (e) {
    showToast(e.message);
  }
});

kitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (event.submitter?.value === "cancel") return kitDialog.close();
  const form = new FormData(kitForm);
  try {
    await API.create("kit_requests", {
      department: String(form.get("department")).trim(),
      requested: String(form.get("requested")).trim(),
      eta: String(form.get("eta")).trim(),
    });
    kitDialog.close();
    kitForm.reset();
    await refresh();
    showToast("Kit request added");
  } catch (e) {
    showToast(e.message);
  }
});

workspace.addEventListener("change", async (event) => {
  if (event.target.matches('[data-action="chart-period"]')) {
    state.chartPeriod = event.target.value;
    state.dashboard = await API.dashboard(state.chartPeriod);
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

workspace.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;
  const action = trigger.dataset.action;
  const id = trigger.dataset.id;

  if (action === "add-patient") return openPatientDialog("add");
  if (action === "edit-patient") return openPatientDialog("edit", id);

  if (action === "delete-patient") {
    const removed = findById(state.patients, id);
    if (!window.confirm(`Delete patient "${removed.name}"?`)) return;
    try {
      await API.remove("patients", id);
      await refresh();
      showToast("Patient deleted", {
        undo: async () => {
          await API.create("patients", removed);
          await refresh();
          showToast("Delete undone");
        },
        duration: 5000,
      });
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "reschedule-appointment") {
    const appt = findById(state.appointments, id);
    const before = { ...appt };
    const current = before.slot.replace(" ", "T");
    const next = window.prompt("Enter new slot (YYYY-MM-DDTHH:mm)", current);
    if (!next) return;
    try {
      await API.update("appointments", id, { ...before, slot: next.replace("T", " "), status: "Rescheduled" });
      await refresh();
      showToast("Appointment rescheduled", {
        undo: async () => {
          await API.update("appointments", id, before);
          await refresh();
          showToast("Reschedule undone");
        },
        duration: 5000,
      });
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "cancel-appointment") {
    const appt = findById(state.appointments, id);
    const before = { ...appt };
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await API.update("appointments", id, { ...appt, status: "Cancelled" });
      await refresh();
      showToast("Appointment cancelled", {
        undo: async () => {
          await API.update("appointments", id, before);
          await refresh();
          showToast("Cancellation undone");
        },
        duration: 5000,
      });
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "mark-paid") {
    const inv = findById(state.invoices, id);
    try {
      await API.update("invoices", id, { ...inv, status: "Paid" });
      await refresh();
      showToast("Invoice marked as paid");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "mark-partial") {
    const inv = findById(state.invoices, id);
    try {
      await API.update("invoices", id, { ...inv, status: "Partially Paid" });
      await refresh();
      showToast("Invoice marked as partial");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "add-doctor") {
    doctorForm.reset();
    return doctorDialog.showModal();
  }

  if (action === "remove-doctor") {
    if (!window.confirm("Remove this doctor?")) return;
    try {
      await API.remove("doctors", id);
      await refresh();
      showToast("Doctor removed");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "add-staff") {
    staffForm.reset();
    return staffDialog.showModal();
  }

  if (action === "remove-staff") {
    if (!window.confirm("Remove this staff member?")) return;
    try {
      await API.remove("staff", id);
      await refresh();
      showToast("Staff member removed");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "add-invoice") {
    invoiceForm.reset();
    return invoiceDialog.showModal();
  }

  if (action === "remove-invoice") {
    if (!window.confirm("Remove this invoice?")) return;
    try {
      await API.remove("invoices", id);
      await refresh();
      showToast("Invoice removed");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "add-inventory-item") {
    inventoryForm.reset();
    return inventoryDialog.showModal();
  }

  if (action === "remove-inventory-item") {
    if (!window.confirm("Remove this inventory item?")) return;
    try {
      await API.remove("inventory_items", id);
      await refresh();
      showToast("Inventory item removed");
    } catch (e) {
      showToast(e.message);
    }
    return;
  }

  if (action === "add-kit-request") {
    kitForm.reset();
    return kitDialog.showModal();
  }

  if (action === "remove-kit-request") {
    if (!window.confirm("Remove this kit request?")) return;
    try {
      await API.remove("kit_requests", id);
      await refresh();
      showToast("Kit request removed");
    } catch (e) {
      showToast(e.message);
    }
  }
});

globalSearchInput.addEventListener("input", (event) => {
  state.searchQuery = event.target.value.trim();
  renderWorkspace();
});

roleSelect.addEventListener("change", (event) => {
  state.role = event.target.value;
  render();
  showToast(`Role switched to ${ROLE_CONFIG[state.role].label}`);
});

menuToggleBtn.addEventListener("click", () => sidebar.classList.toggle("open"));

async function boot() {
  const token = getToken();
  if (!token) return showLogin();
  try {
    const user = await API.me();
    setAuth(token, user);
    showApp(user);
  } catch {
    clearAuth();
    showLogin();
  }
}

boot();
