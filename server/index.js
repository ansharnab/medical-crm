const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { run, all, get, init } = require("./db");

const app = express();
const SECRET = process.env.JWT_SECRET || "mediccare_secret_2026";
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const ENTITIES = {
  patients: {
    table: "patients",
    fields: ["name", "age", "condition", "risk", "doctor", "city", "phone", "email", "bloodGroup", "createdAt"],
    required: ["name"],
  },
  appointments: {
    table: "appointments",
    fields: ["patient", "doctor", "slot", "status", "notes"],
    required: ["patient", "doctor", "slot"],
  },
  doctors: {
    table: "doctors",
    fields: ["name", "dept", "patients", "utilization", "phone", "email"],
    required: ["name", "dept"],
  },
  staff: {
    table: "staff",
    fields: ["name", "role", "shift"],
    required: ["name", "role"],
  },
  invoices: {
    table: "invoices",
    fields: ["patient", "amount", "status", "dueDate"],
    required: ["patient", "amount"],
    customId: true,
  },
  inventory_items: {
    table: "inventory_items",
    fields: ["item", "unit", "onHand", "alert"],
    required: ["item"],
  },
  kit_requests: {
    table: "kit_requests",
    fields: ["department", "requested", "eta"],
    required: ["department", "requested"],
  },
  departments: {
    table: "departments",
    fields: ["name", "head", "bedCapacity", "occupied", "floor"],
    required: ["name"],
  },
  lab_reports: {
    table: "lab_reports",
    fields: ["patient", "testName", "result", "status", "reportDate", "doctor"],
    required: ["patient", "testName"],
  },
  prescriptions: {
    table: "prescriptions",
    fields: ["patient", "medicine", "dosage", "duration", "doctor", "status"],
    required: ["patient", "medicine"],
  },
};

async function logActivity(user, action, entity, details) {
  await run(
    "INSERT INTO activity_log (id, userName, action, entity, details, createdAt) VALUES (?,?,?,?,?,?)",
    [uuidv4(), user.name || user.email, action, entity, details, new Date().toISOString()]
  );
}

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, SECRET, {
      expiresIn: "8h",
    });
    await logActivity({ name: user.name, email: user.email }, "login", "auth", `${user.name} signed in`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await get("SELECT id, email, name, role FROM users WHERE id = ?", [req.user.id]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.get("/api/dashboard", auth, async (req, res) => {
  try {
    const period = req.query.period === "30d" ? "30d" : "7d";
    const footfall = await all(
      "SELECT label, value FROM footfall WHERE period = ? ORDER BY sortOrder",
      [period]
    );
    const doctors = await all("SELECT dept, utilization FROM doctors");
    const deptLoad = doctors.map((d) => {
      const pct = parseInt(String(d.utilization).replace("%", ""), 10) || 0;
      const dept = d.dept.includes("Surgery") ? "Surgery" : d.dept;
      return { dept, pct };
    });
    const grouped = {};
    for (const row of deptLoad) {
      if (!grouped[row.dept] || grouped[row.dept].pct < row.pct) grouped[row.dept] = row;
    }
    const bedStats = await get(
      "SELECT COALESCE(SUM(bedCapacity),0) as total, COALESCE(SUM(occupied),0) as occupied FROM departments"
    );
    res.json({
      footfall: {
        labels: footfall.map((f) => f.label),
        values: footfall.map((f) => f.value),
        suffix: period === "30d" ? "patients/week" : "patients/day",
      },
      deptLoad: Object.values(grouped).slice(0, 4),
      bedOccupancy: bedStats.total
        ? Math.round((bedStats.occupied / bedStats.total) * 100)
        : 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/notifications", auth, async (req, res) => {
  try {
    const notifications = [];
    const criticalPatients = await all("SELECT name, condition FROM patients WHERE risk = 'danger'");
    criticalPatients.forEach((p) =>
      notifications.push({ type: "danger", title: "High Risk Patient", message: `${p.name} — ${p.condition}` })
    );
    const lowStock = await all("SELECT item, alert FROM inventory_items WHERE alert IN ('Low','Critical')");
    lowStock.forEach((i) =>
      notifications.push({ type: i.alert === "Critical" ? "danger" : "warn", title: "Stock Alert", message: `${i.item} — ${i.alert}` })
    );
    const pendingAppts = await all("SELECT patient, slot FROM appointments WHERE status = 'Pending'");
    pendingAppts.slice(0, 3).forEach((a) =>
      notifications.push({ type: "info", title: "Pending Appointment", message: `${a.patient} at ${a.slot}` })
    );
    const dueInvoices = await all("SELECT id, patient, amount FROM invoices WHERE status = 'Due'");
    dueInvoices.forEach((i) =>
      notifications.push({ type: "warn", title: "Unpaid Invoice", message: `${i.id} — ${i.patient} (₹${i.amount})` })
    );
    const criticalLabs = await all("SELECT patient, testName FROM lab_reports WHERE status = 'Critical'");
    criticalLabs.forEach((l) =>
      notifications.push({ type: "danger", title: "Critical Lab Result", message: `${l.patient} — ${l.testName}` })
    );
    res.json(notifications.slice(0, 12));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/activity", auth, async (req, res) => {
  try {
    const rows = await all("SELECT * FROM activity_log ORDER BY createdAt DESC LIMIT 20");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/search", auth, async (req, res) => {
  const q = `%${req.query.q || ""}%`;
  try {
    const patients = await all(
      "SELECT * FROM patients WHERE name LIKE ? OR condition LIKE ? OR doctor LIKE ? OR city LIKE ? OR phone LIKE ?",
      [q, q, q, q, q]
    );
    const invoices = await all(
      "SELECT * FROM invoices WHERE id LIKE ? OR patient LIKE ? OR status LIKE ?",
      [q, q, q]
    );
    res.json({ patients, invoices });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/export/summary", auth, async (req, res) => {
  try {
    const patients = await get("SELECT COUNT(*) as c FROM patients");
    const appointments = await get("SELECT COUNT(*) as c FROM appointments");
    const unpaid = await get("SELECT COALESCE(SUM(amount),0) as total FROM invoices WHERE status != 'Paid'");
    res.json({
      generatedAt: new Date().toISOString(),
      clinic: "MaatriDev MedicCare",
      role: req.user.role,
      patients: patients.c,
      appointments: appointments.c,
      outstandingRevenueINR: unpaid.total,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function validate(entity, body) {
  const cfg = ENTITIES[entity];
  const missing = cfg.required.filter((f) => body[f] === undefined || body[f] === "");
  if (missing.length) return `Missing: ${missing.join(", ")}`;
  return null;
}

app.get("/api/:entity", auth, async (req, res) => {
  const cfg = ENTITIES[req.params.entity];
  if (!cfg) return res.status(400).json({ error: "Invalid entity" });
  try {
    const rows = await all(`SELECT * FROM ${cfg.table} ORDER BY rowid DESC`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/:entity", auth, async (req, res) => {
  const entity = req.params.entity;
  const cfg = ENTITIES[entity];
  if (!cfg) return res.status(400).json({ error: "Invalid entity" });
  const err = validate(entity, req.body);
  if (err) return res.status(400).json({ error: err });
  const id = entity === "invoices" && req.body.id ? req.body.id : uuidv4();
  const body = { ...req.body };
  if (entity === "patients" && !body.createdAt) body.createdAt = new Date().toISOString().slice(0, 10);
  const values = cfg.fields.map((f) => body[f] ?? "");
  try {
    await run(
      `INSERT INTO ${cfg.table} (id, ${cfg.fields.join(",")}) VALUES (?, ${cfg.fields.map(() => "?").join(",")})`,
      [id, ...values]
    );
    const row = await get(`SELECT * FROM ${cfg.table} WHERE id = ?`, [id]);
    const label = row.name || row.patient || row.item || row.testName || id;
    await logActivity(req.user, "create", entity, `Created ${label}`);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/:entity/:id", auth, async (req, res) => {
  const entity = req.params.entity;
  const cfg = ENTITIES[entity];
  if (!cfg) return res.status(400).json({ error: "Invalid entity" });
  const err = validate(entity, req.body);
  if (err) return res.status(400).json({ error: err });
  const sets = cfg.fields.map((f) => `${f} = ?`).join(", ");
  const values = cfg.fields.map((f) => req.body[f] ?? "");
  try {
    await run(`UPDATE ${cfg.table} SET ${sets} WHERE id = ?`, [...values, req.params.id]);
    const row = await get(`SELECT * FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    const label = row?.name || row?.patient || row?.item || req.params.id;
    await logActivity(req.user, "update", entity, `Updated ${label}`);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/:entity/:id", auth, async (req, res) => {
  const cfg = ENTITIES[req.params.entity];
  if (!cfg) return res.status(400).json({ error: "Invalid entity" });
  try {
    const row = await get(`SELECT * FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    await run(`DELETE FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
    const label = row?.name || row?.patient || row?.item || req.params.id;
    await logActivity(req.user, "delete", entity, `Removed ${label}`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const root = path.resolve(__dirname, "..");
app.use(express.static(root));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

init()
  .then(() => {
    app.listen(PORT, () => console.log(`MedicCare CRM running at http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("DB init failed:", e);
    process.exit(1);
  });
