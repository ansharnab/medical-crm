const sqlite3 = require("sqlite3").verbose();
const path = require("path");
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

const init = async () => {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, role TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, name TEXT, age INTEGER, condition TEXT,
    risk TEXT, doctor TEXT, city TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY, patient TEXT, doctor TEXT, slot TEXT, status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY, name TEXT, dept TEXT, patients INTEGER, utilization TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY, name TEXT, role TEXT, shift TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY, patient TEXT, amount REAL, status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY, item TEXT, unit TEXT, onHand INTEGER, alert TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS kit_requests (
    id TEXT PRIMARY KEY, department TEXT, requested TEXT, eta TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS footfall (
    id TEXT PRIMARY KEY, period TEXT, label TEXT, value INTEGER, sortOrder INTEGER
  )`);

  const userCount = await get("SELECT COUNT(*) as c FROM users");
  if (!userCount.c) await seed();
};

const seed = async () => {
  const hash = await bcrypt.hash("admin123", 10);
  await run("INSERT INTO users (id,email,password,name,role) VALUES (?,?,?,?,?)", [
    uuidv4(),
    "admin@mediccare.com",
    hash,
    "Admin User",
    "admin",
  ]);

  const hashDoc = await bcrypt.hash("doctor123", 10);
  await run("INSERT INTO users (id,email,password,name,role) VALUES (?,?,?,?,?)", [
    uuidv4(),
    "doctor@mediccare.com",
    hashDoc,
    "Dr. R. Nair",
    "doctor",
  ]);

  const patients = [
    ["Ananya Sharma", 31, "Migraine", "warn", "Dr. R. Nair", "Bengaluru"],
    ["Rahul Verma", 52, "Hypertension", "ok", "Dr. S. Iqbal", "Delhi"],
    ["Neha Kapoor", 44, "Type 2 Diabetes", "warn", "Dr. R. Nair", "Pune"],
    ["Meenakshi Iyer", 67, "Post-op Recovery", "danger", "Dr. K. Rao", "Chennai"],
  ];
  for (const p of patients) {
    await run(
      "INSERT INTO patients (id,name,age,condition,risk,doctor,city) VALUES (?,?,?,?,?,?,?)",
      [uuidv4(), ...p]
    );
  }

  const appointments = [
    ["Ananya Sharma", "Dr. R. Nair", "2026-05-12 14:30", "Confirmed"],
    ["Rahul Verma", "Dr. S. Iqbal", "2026-05-12 16:00", "Pending"],
    ["Meenakshi Iyer", "Dr. K. Rao", "2026-05-13 10:00", "Critical Follow-up"],
  ];
  for (const a of appointments) {
    await run("INSERT INTO appointments (id,patient,doctor,slot,status) VALUES (?,?,?,?,?)", [
      uuidv4(),
      ...a,
    ]);
  }

  const doctors = [
    ["Dr. R. Nair", "Neurology", 18, "78%"],
    ["Dr. S. Iqbal", "Cardiology", 23, "84%"],
    ["Dr. K. Rao", "General Surgery", 12, "63%"],
    ["Dr. P. Singh", "Pediatrics", 16, "72%"],
  ];
  for (const d of doctors) {
    await run("INSERT INTO doctors (id,name,dept,patients,utilization) VALUES (?,?,?,?,?)", [
      uuidv4(),
      ...d,
    ]);
  }

  const staff = [
    ["Priya Menon", "Nurse", "Morning"],
    ["Arvind Kumar", "Lab Technician", "Evening"],
  ];
  for (const s of staff) {
    await run("INSERT INTO staff (id,name,role,shift) VALUES (?,?,?,?)", [uuidv4(), ...s]);
  }

  const invoices = [
    ["INV-IND-2901", "Rahul Verma", 4200, "Paid"],
    ["INV-IND-2902", "Meenakshi Iyer", 18500, "Insurance Review"],
    ["INV-IND-2903", "Ananya Sharma", 2650, "Due"],
  ];
  for (const i of invoices) {
    await run("INSERT INTO invoices (id,patient,amount,status) VALUES (?,?,?,?)", [...i]);
  }

  const inventory = [
    ["Insulin Vials", "Cold Storage", 28, "Low"],
    ["Surgical Gloves", "Boxes", 104, "Good"],
    ["IV Fluid", "Packs", 12, "Critical"],
  ];
  for (const item of inventory) {
    await run("INSERT INTO inventory_items (id,item,unit,onHand,alert) VALUES (?,?,?,?,?)", [
      uuidv4(),
      ...item,
    ]);
  }

  const kits = [
    ["ER", "BP cuffs x6", "Today 18:00"],
    ["OT", "Sutures x20", "Tomorrow 09:00"],
    ["Pediatrics", "Nebulizer kits x10", "Today 16:30"],
  ];
  for (const k of kits) {
    await run("INSERT INTO kit_requests (id,department,requested,eta) VALUES (?,?,?,?)", [
      uuidv4(),
      ...k,
    ]);
  }

  const footfall7d = [
    ["Mon", 48],
    ["Tue", 61],
    ["Wed", 55],
    ["Thu", 72],
    ["Fri", 67],
    ["Sat", 75],
    ["Sun", 82],
  ];
  for (let i = 0; i < footfall7d.length; i++) {
    const [label, value] = footfall7d[i];
    await run("INSERT INTO footfall (id,period,label,value,sortOrder) VALUES (?,?,?,?,?)", [
      uuidv4(), "7d", label, value, i,
    ]);
  }

  const footfall30d = [
    ["W1", 420],
    ["W2", 465],
    ["W3", 438],
    ["W4", 501],
  ];
  for (let i = 0; i < footfall30d.length; i++) {
    const [label, value] = footfall30d[i];
    await run("INSERT INTO footfall (id,period,label,value,sortOrder) VALUES (?,?,?,?,?)", [
      uuidv4(), "30d", label, value, i,
    ]);
  }
};

module.exports = { db, run, all, get, init };
