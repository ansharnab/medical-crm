-- MaatriDev MedicCare CRM Database Schema
-- SQLite3 | Auto-created on first run

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK(role IN ('admin','doctor','receptionist'))
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  head TEXT,
  bedCapacity INTEGER DEFAULT 0,
  occupied INTEGER DEFAULT 0,
  floor TEXT
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  condition TEXT,
  risk TEXT CHECK(risk IN ('ok','warn','danger')),
  doctor TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  bloodGroup TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  doctor TEXT NOT NULL,
  slot TEXT NOT NULL,
  status TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dept TEXT,
  patients INTEGER DEFAULT 0,
  utilization TEXT,
  phone TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  shift TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT,
  dueDate TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  unit TEXT,
  onHand INTEGER DEFAULT 0,
  alert TEXT
);

CREATE TABLE IF NOT EXISTS kit_requests (
  id TEXT PRIMARY KEY,
  department TEXT,
  requested TEXT,
  eta TEXT
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  testName TEXT NOT NULL,
  result TEXT,
  status TEXT,
  reportDate TEXT,
  doctor TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient TEXT NOT NULL,
  medicine TEXT NOT NULL,
  dosage TEXT,
  duration TEXT,
  doctor TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS footfall (
  id TEXT PRIMARY KEY,
  period TEXT,
  label TEXT,
  value INTEGER,
  sortOrder INTEGER
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  userName TEXT,
  action TEXT,
  entity TEXT,
  details TEXT,
  createdAt TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_risk ON patients(risk);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(createdAt);
