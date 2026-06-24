const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog } = require('../src/models');
const { DEFAULT_WORKING_HOURS } = require('../src/modules/settings/workingHours.defaults');

let app;
let clientAdminToken;
let demoOrgId;
let doctorId;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Organization.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

  const passwordHash = await bcrypt.hash('Test@123456', 12);

  const org = await Organization.create({
    name: 'Test Clinic',
    slug: 'test-clinic',
    email: 'test@clinic.com',
    phone: '9999999999',
    city: 'Mumbai',
    status: 'active',
    emailVerifiedAt: new Date(),
  });
  demoOrgId = org.id;

  await User.create({
    email: 'client@test.com',
    passwordHash,
    firstName: 'Client',
    lastName: 'Admin',
    role: 'client_admin',
    status: 'active',
    organizationId: org.id,
  });

  const doctor = await User.create({
    email: 'doctor@test.com',
    passwordHash,
    firstName: 'Test',
    lastName: 'Doctor',
    role: 'doctor',
    status: 'active',
    organizationId: org.id,
    specialization: 'Cardiology',
    consultationFee: 700,
  });
  doctorId = doctor.id;

  const clientLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'client@test.com', password: 'Test@123456' });
  clientAdminToken = clientLogin.body.accessToken;
});

describe('Settings API — Client Admin', () => {
  it('GET /settings/clinic returns clinic profile', async () => {
    const res = await request(app)
      .get('/api/v1/settings/clinic')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Clinic');
    expect(res.body.email).toBe('test@clinic.com');
  });

  it('PATCH /settings/clinic updates clinic info', async () => {
    const res = await request(app)
      .patch('/api/v1/settings/clinic')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ phone: '8888888888', city: 'Pune' });

    expect(res.status).toBe(200);
    expect(res.body.phone).toBe('8888888888');
    expect(res.body.city).toBe('Pune');
  });

  it('GET /settings/working-hours returns defaults when unset', async () => {
    const res = await request(app)
      .get('/api/v1/settings/working-hours')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.monday).toEqual(DEFAULT_WORKING_HOURS.monday);
  });

  it('PUT /settings/working-hours saves schedule', async () => {
    const payload = { ...DEFAULT_WORKING_HOURS, saturday: { open: '10:00', close: '13:00', closed: false } };

    const res = await request(app)
      .put('/api/v1/settings/working-hours')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.saturday.open).toBe('10:00');
  });

  it('GET /settings/doctor-fees lists doctors', async () => {
    const res = await request(app)
      .get('/api/v1/settings/doctor-fees')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].doctorId).toBe(doctorId);
  });

  it('PUT /settings/doctor-fees/:doctorId updates fee', async () => {
    const res = await request(app)
      .put(`/api/v1/settings/doctor-fees/${doctorId}`)
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ consultationFee: 950 });

    expect(res.status).toBe(200);
    expect(res.body.consultationFee).toBe(950);
  });
});

describe('Clinic Analytics API', () => {
  it('GET /analytics/clinic/dashboard returns clinic KPIs', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/clinic/dashboard')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.staff.doctors).toBeGreaterThanOrEqual(1);
    expect(res.body.patients).toBeDefined();
    expect(res.body.appointments).toBeDefined();
  });
});

describe('Settings API — RBAC', () => {
  it('returns 403 for receptionist', async () => {
    const passwordHash = await bcrypt.hash('Test@123456', 12);
    await User.create({
      email: 'reception@test.com',
      passwordHash,
      firstName: 'Rec',
      lastName: 'Eption',
      role: 'receptionist',
      status: 'active',
      organizationId: demoOrgId,
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reception@test.com', password: 'Test@123456' });

    const res = await request(app)
      .get('/api/v1/settings/clinic')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(403);
  });
});
