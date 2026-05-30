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
    fields: ["name", "age", "condition", "risk", "doctor", "city"],
    required: ["name"],
    search: ["name", "condition", "doctor", "city"],
  },
  appointments: {
    table: "appointments",
    fields: ["patient", "doctor", "slot", "status"],
    required: ["patient", "doctor", "slot"],
    search: ["patient", "doctor", "status"],
  },
  doctors: {
    table: "doctors",
    fields: ["name", "dept", "patients", "utilization"],
    required: ["name", "dept"],
    search: ["name", "dept"],
  },
  staff: {
    table: "staff",
    fields: ["name", "role", "shift"],
    required: ["name", "role"],
    search: ["name", "role"],
  },
  invoices: {
    table: "invoices",
    fields: ["patient", "amount", "status"],
    required: ["patient", "amount"],
    search: ["id", "patient", "status"],
    customId: true,
  },
  inventory_items: {
    table: "inventory_items",
    fields: ["item", "unit", "onHand", "alert"],
    required: ["item"],
    search: ["item", "unit"],
  },
  kit_requests: {
    table: "kit_requests",
    fields: ["department", "requested", "eta"],
    required: ["department", "requested"],
    search: ["department", "requested"],
  },
};

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
    res.json({
      footfall: {
        labels: footfall.map((f) => f.label),
        values: footfall.map((f) => f.value),
        suffix: period === "30d" ? "patients/week" : "patients/day",
      },
      deptLoad: Object.values(grouped).slice(0, 4),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/search", auth, async (req, res) => {
  const q = `%${req.query.q || ""}%`;
  try {
    const patients = await all(
      "SELECT * FROM patients WHERE name LIKE ? OR condition LIKE ? OR doctor LIKE ? OR city LIKE ?",
      [q, q, q, q]
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
  const values = cfg.fields.map((f) => req.body[f] ?? "");
  try {
    await run(
      `INSERT INTO ${cfg.table} (id, ${cfg.fields.join(",")}) VALUES (?, ${cfg.fields.map(() => "?").join(",")})`,
      [id, ...values]
    );
    const row = await get(`SELECT * FROM ${cfg.table} WHERE id = ?`, [id]);
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
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/:entity/:id", auth, async (req, res) => {
  const cfg = ENTITIES[req.params.entity];
  if (!cfg) return res.status(400).json({ error: "Invalid entity" });
  try {
    await run(`DELETE FROM ${cfg.table} WHERE id = ?`, [req.params.id]);
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
