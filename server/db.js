const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const dbPath = path.resolve(__dirname, "mediccare.db");
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

async function ensureColumn(table, column, type) {
  const cols = await all(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

const init = async () => {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  for (const stmt of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await run(stmt);
  }

  await ensureColumn("patients", "phone", "TEXT");
  await ensureColumn("patients", "email", "TEXT");
  await ensureColumn("patients", "bloodGroup", "TEXT");
  await ensureColumn("patients", "createdAt", "TEXT");
  await ensureColumn("doctors", "phone", "TEXT");
  await ensureColumn("doctors", "email", "TEXT");
  await ensureColumn("appointments", "notes", "TEXT");
  await ensureColumn("invoices", "dueDate", "TEXT");

  const userCount = await get("SELECT COUNT(*) as c FROM users");
  if (!userCount.c) await seedAll();
  else await seedExtras();
};

const seedAll = async () => {
  await seedUsers();
  await seedDepartments();
  await seedPatients();
  await seedAppointments();
  await seedDoctors();
  await seedStaff();
  await seedInvoices();
  await seedInventory();
  await seedKits();
  await seedFootfall();
  await seedLabReports();
  await seedPrescriptions();
  await seedActivity();
};

const seedExtras = async () => {
  const checks = [
    ["departments", seedDepartments],
    ["lab_reports", seedLabReports],
    ["prescriptions", seedPrescriptions],
    ["activity_log", seedActivity],
  ];
  for (const [table, fn] of checks) {
    const row = await get(`SELECT COUNT(*) as c FROM ${table}`);
    if (!row.c) await fn();
  }
  const deptRow = await get("SELECT COUNT(*) as c FROM departments");
  if (!deptRow.c) await seedDepartments();
};

const seedUsers = async () => {
  const users = [
    ["admin@mediccare.com", "admin123", "Admin User", "admin"],
    ["doctor@mediccare.com", "doctor123", "Dr. R. Nair", "doctor"],
    ["reception@mediccare.com", "reception123", "Priya Reception", "receptionist"],
  ];
  for (const [email, pass, name, role] of users) {
    const hash = await bcrypt.hash(pass, 10);
    await run("INSERT INTO users (id,email,password,name,role) VALUES (?,?,?,?,?)", [
      uuidv4(), email, hash, name, role,
    ]);
  }
};

const seedDepartments = async () => {
  const depts = [
    ["Cardiology", "Dr. S. Iqbal", 40, 34, "Floor 2"],
    ["Neurology", "Dr. R. Nair", 30, 23, "Floor 3"],
    ["Pediatrics", "Dr. P. Singh", 25, 18, "Floor 1"],
    ["General Surgery", "Dr. K. Rao", 35, 22, "Floor 4"],
    ["Emergency", "Dr. A. Mehta", 20, 17, "Ground"],
  ];
  for (const d of depts) {
    await run("INSERT INTO departments (id,name,head,bedCapacity,occupied,floor) VALUES (?,?,?,?,?,?)", [
      uuidv4(), ...d,
    ]);
  }
};

const seedPatients = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const patients = [
    ["Ananya Sharma", 31, "Migraine", "warn", "Dr. R. Nair", "Bengaluru", "+91 98765 43210", "ananya@email.com", "B+"],
    ["Rahul Verma", 52, "Hypertension", "ok", "Dr. S. Iqbal", "Delhi", "+91 98765 43211", "rahul@email.com", "O+"],
    ["Neha Kapoor", 44, "Type 2 Diabetes", "warn", "Dr. R. Nair", "Pune", "+91 98765 43212", "neha@email.com", "A+"],
    ["Meenakshi Iyer", 67, "Post-op Recovery", "danger", "Dr. K. Rao", "Chennai", "+91 98765 43213", "meena@email.com", "AB+"],
    ["Vikram Singh", 28, "Fracture", "warn", "Dr. K. Rao", "Jaipur", "+91 98765 43214", "vikram@email.com", "B-"],
    ["Sunita Patel", 39, "Asthma", "ok", "Dr. P. Singh", "Ahmedabad", "+91 98765 43215", "sunita@email.com", "O-"],
  ];
  for (const p of patients) {
    await run(
      "INSERT INTO patients (id,name,age,condition,risk,doctor,city,phone,email,bloodGroup,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [uuidv4(), ...p, today]
    );
  }
};

const seedAppointments = async () => {
  const appointments = [
    ["Ananya Sharma", "Dr. R. Nair", "2026-05-30 14:30", "Confirmed", "Follow-up for migraine"],
    ["Rahul Verma", "Dr. S. Iqbal", "2026-05-30 16:00", "Pending", "BP check"],
    ["Meenakshi Iyer", "Dr. K. Rao", "2026-05-31 10:00", "Critical Follow-up", "Post-op review"],
    ["Vikram Singh", "Dr. K. Rao", "2026-05-30 11:00", "Confirmed", "X-ray review"],
    ["Sunita Patel", "Dr. P. Singh", "2026-05-31 09:30", "Pending", "Routine check"],
  ];
  for (const a of appointments) {
    await run("INSERT INTO appointments (id,patient,doctor,slot,status,notes) VALUES (?,?,?,?,?,?)", [
      uuidv4(), ...a,
    ]);
  }
};

const seedDoctors = async () => {
  const doctors = [
    ["Dr. R. Nair", "Neurology", 18, "78%", "+91 90001 00001", "rnair@mediccare.com"],
    ["Dr. S. Iqbal", "Cardiology", 23, "84%", "+91 90001 00002", "siqbal@mediccare.com"],
    ["Dr. K. Rao", "General Surgery", 12, "63%", "+91 90001 00003", "krao@mediccare.com"],
    ["Dr. P. Singh", "Pediatrics", 16, "72%", "+91 90001 00004", "psingh@mediccare.com"],
  ];
  for (const d of doctors) {
    await run("INSERT INTO doctors (id,name,dept,patients,utilization,phone,email) VALUES (?,?,?,?,?,?,?)", [
      uuidv4(), ...d,
    ]);
  }
};

const seedStaff = async () => {
  const staff = [
    ["Priya Menon", "Nurse", "Morning"],
    ["Arvind Kumar", "Lab Technician", "Evening"],
    ["Kavita Desai", "Receptionist", "Morning"],
    ["Rajesh Nair", "Pharmacist", "Evening"],
  ];
  for (const s of staff) {
    await run("INSERT INTO staff (id,name,role,shift) VALUES (?,?,?,?)", [uuidv4(), ...s]);
  }
};

const seedInvoices = async () => {
  const invoices = [
    ["INV-IND-2901", "Rahul Verma", 4200, "Paid", "2026-05-01"],
    ["INV-IND-2902", "Meenakshi Iyer", 18500, "Insurance Review", "2026-05-15"],
    ["INV-IND-2903", "Ananya Sharma", 2650, "Due", "2026-05-20"],
    ["INV-IND-2904", "Vikram Singh", 8900, "Due", "2026-05-25"],
  ];
  for (const i of invoices) {
    await run("INSERT INTO invoices (id,patient,amount,status,dueDate) VALUES (?,?,?,?,?)", [...i]);
  }
};

const seedInventory = async () => {
  const inventory = [
    ["Insulin Vials", "Cold Storage", 28, "Low"],
    ["Surgical Gloves", "Boxes", 104, "Good"],
    ["IV Fluid", "Packs", 12, "Critical"],
    ["Paracetamol 500mg", "Strips", 45, "Low"],
    ["Oxygen Cylinders", "Units", 8, "Critical"],
  ];
  for (const item of inventory) {
    await run("INSERT INTO inventory_items (id,item,unit,onHand,alert) VALUES (?,?,?,?,?)", [
      uuidv4(), ...item,
    ]);
  }
};

const seedKits = async () => {
  const kits = [
    ["ER", "BP cuffs x6", "Today 18:00"],
    ["OT", "Sutures x20", "Tomorrow 09:00"],
    ["Pediatrics", "Nebulizer kits x10", "Today 16:30"],
  ];
  for (const k of kits) {
    await run("INSERT INTO kit_requests (id,department,requested,eta) VALUES (?,?,?,?)", [uuidv4(), ...k]);
  }
};

const seedFootfall = async () => {
  const footfall7d = [["Mon", 48], ["Tue", 61], ["Wed", 55], ["Thu", 72], ["Fri", 67], ["Sat", 75], ["Sun", 82]];
  for (let i = 0; i < footfall7d.length; i++) {
    const [label, value] = footfall7d[i];
    await run("INSERT INTO footfall (id,period,label,value,sortOrder) VALUES (?,?,?,?,?)", [
      uuidv4(), "7d", label, value, i,
    ]);
  }
  const footfall30d = [["W1", 420], ["W2", 465], ["W3", 438], ["W4", 501]];
  for (let i = 0; i < footfall30d.length; i++) {
    const [label, value] = footfall30d[i];
    await run("INSERT INTO footfall (id,period,label,value,sortOrder) VALUES (?,?,?,?,?)", [
      uuidv4(), "30d", label, value, i,
    ]);
  }
};

const seedLabReports = async () => {
  const reports = [
    ["Rahul Verma", "Lipid Profile", "Total Cholesterol: 220 mg/dL", "Abnormal", "2026-05-28", "Dr. S. Iqbal"],
    ["Ananya Sharma", "MRI Brain", "No significant abnormality", "Normal", "2026-05-27", "Dr. R. Nair"],
    ["Meenakshi Iyer", "CBC", "WBC elevated", "Critical", "2026-05-29", "Dr. K. Rao"],
    ["Neha Kapoor", "HbA1c", "7.2%", "Abnormal", "2026-05-26", "Dr. R. Nair"],
    ["Vikram Singh", "X-Ray Leg", "Hairline fracture detected", "Abnormal", "2026-05-30", "Dr. K. Rao"],
  ];
  for (const r of reports) {
    await run("INSERT INTO lab_reports (id,patient,testName,result,status,reportDate,doctor) VALUES (?,?,?,?,?,?,?)", [
      uuidv4(), ...r,
    ]);
  }
};

const seedPrescriptions = async () => {
  const rx = [
    ["Ananya Sharma", "Sumatriptan", "50mg twice daily", "7 days", "Dr. R. Nair", "Active"],
    ["Rahul Verma", "Amlodipine", "5mg once daily", "30 days", "Dr. S. Iqbal", "Active"],
    ["Neha Kapoor", "Metformin", "500mg twice daily", "30 days", "Dr. R. Nair", "Active"],
    ["Meenakshi Iyer", "Paracetamol", "650mg as needed", "5 days", "Dr. K. Rao", "Active"],
    ["Sunita Patel", "Salbutamol Inhaler", "2 puffs as needed", "14 days", "Dr. P. Singh", "Active"],
  ];
  for (const p of rx) {
    await run("INSERT INTO prescriptions (id,patient,medicine,dosage,duration,doctor,status) VALUES (?,?,?,?,?,?,?)", [
      uuidv4(), ...p,
    ]);
  }
};

const seedActivity = async () => {
  const logs = [
    ["System", "init", "database", "Database seeded with demo data"],
    ["Admin User", "create", "patient", "Registered Meenakshi Iyer — High Risk"],
    ["Dr. R. Nair", "update", "appointment", "Confirmed appointment for Ananya Sharma"],
    ["Admin User", "create", "invoice", "Invoice INV-IND-2902 pending insurance review"],
  ];
  const now = new Date().toISOString();
  for (const l of logs) {
    await run("INSERT INTO activity_log (id,userName,action,entity,details,createdAt) VALUES (?,?,?,?,?,?)", [
      uuidv4(), ...l, now,
    ]);
  }
};

module.exports = { db, run, all, get, init };
