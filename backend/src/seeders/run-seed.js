const { loadEnv } = require('../config/load-env');
loadEnv();

const config = require('../config');
const { sequelize, User, Organization } = require('../models');
const { hashPassword } = require('../modules/auth/auth.service');
const logger = require('../utils/logger');

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Demo@123456';

const DEMO_CLINIC = {
  name: 'Demo Clinic',
  slug: 'demo-clinic',
  email: 'contact@democlinic.com',
  phone: '+919876543210',
  city: 'Mumbai',
  state: 'Maharashtra',
  status: 'active',
};

const DEMO_USERS = [
  {
    email: 'admin@democlinic.com',
    firstName: 'Ravi',
    lastName: 'Sharma',
    role: 'client_admin',
    phone: '+919876543211',
  },
  {
    email: 'doctor@democlinic.com',
    firstName: 'Priya',
    lastName: 'Patel',
    role: 'doctor',
    phone: '+919876543212',
    specialization: 'General Medicine',
    consultationFee: 500,
  },
  {
    email: 'reception@democlinic.com',
    firstName: 'Anita',
    lastName: 'Desai',
    role: 'receptionist',
    phone: '+919876543213',
  },
];

async function ensureUser({ email, password, ...fields }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.scope('withPassword').findOne({ where: { email: normalizedEmail } });

  if (existing) {
    logger.info('User already exists', { email: normalizedEmail, role: existing.role });
    return existing;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    status: 'active',
    ...fields,
  });

  logger.info('User created', { email: normalizedEmail, role: user.role });
  return user;
}

async function seed() {
  if (config.dbProfile !== 'development' && process.env.ALLOW_SEED !== 'true') {
    logger.error(`Seed blocked on "${config.dbProfile}" database. Use dev DB or set ALLOW_SEED=true.`);
    process.exit(1);
  }

  await sequelize.authenticate();

  await ensureUser({
    email: config.seed.superAdminEmail,
    password: config.seed.superAdminPassword,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    organizationId: null,
  });

  let clinic = await Organization.findOne({ where: { slug: DEMO_CLINIC.slug } });
  if (!clinic) {
    clinic = await Organization.create({
      ...DEMO_CLINIC,
      emailVerifiedAt: new Date(),
    });
    logger.info('Demo clinic created', { slug: clinic.slug, id: clinic.id });
  } else {
    logger.info('Demo clinic already exists', { slug: clinic.slug, id: clinic.id });
  }

  for (const demoUser of DEMO_USERS) {
    await ensureUser({
      ...demoUser,
      password: DEMO_PASSWORD,
      organizationId: clinic.id,
    });
  }

  // Sample patients for pilot demo (Sprint 8)
  const { Patient } = require('../models');
  const samplePatients = [
    { firstName: 'Rajesh', lastName: 'Kumar', phone: '+919111111111', gender: 'male' },
    { firstName: 'Priya', lastName: 'Singh', phone: '+919222222222', gender: 'female' },
    { firstName: 'Amit', lastName: 'Verma', phone: '+919333333333', gender: 'male' },
  ];
  for (const p of samplePatients) {
    const exists = await Patient.findOne({ where: { organizationId: clinic.id, phone: p.phone } });
    if (!exists) {
      await Patient.create({ ...p, organizationId: clinic.id });
      logger.info('Sample patient created', { phone: p.phone });
    }
  }

  const { MessageTemplate } = require('../models');
  const defaultTemplates = [
    { name: 'Appointment reminder', channel: 'sms', body: 'Reminder: Your appointment is scheduled today. Please arrive 10 min early.' },
    { name: 'Follow-up due', channel: 'sms', body: 'Your follow-up visit is due. Please call 9211611187 to book.' },
    { name: 'Payment pending', channel: 'whatsapp', body: 'You have a pending payment at the clinic. Contact reception or visit portal.doctorcrm.com' },
    { name: 'Invoice email', channel: 'email', body: 'Your invoice is ready. Please visit the clinic or reply to this email for assistance.' },
  ];
  for (const tpl of defaultTemplates) {
    const exists = await MessageTemplate.findOne({ where: { organizationId: clinic.id, name: tpl.name } });
    if (!exists) {
      await MessageTemplate.create({ organizationId: clinic.id, ...tpl });
    }
  }

  logger.info('Seed complete — use demo credentials from README to test each role');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seed failed', { error: err.message, stack: err.stack });
    process.exit(1);
  });
