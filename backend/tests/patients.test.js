const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog, Patient } = require('../src/models');

let app;
let clientAdminToken;
let receptionistToken;
let doctorToken;
let demoOrgId;
let doctorId;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Patient.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Organization.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

  const passwordHash = await bcrypt.hash('Test@123456', 12);

  const org = await Organization.create({
    name: 'Test Clinic',
    slug: 'test-clinic',
    email: 'test@clinic.com',
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
    firstName: 'Jane',
    lastName: 'Doctor',
    role: 'doctor',
    status: 'active',
    organizationId: org.id,
    consultationFee: 500,
  });
  doctorId = doctor.id;

  await User.create({
    email: 'reception@test.com',
    passwordHash,
    firstName: 'Reception',
    lastName: 'Staff',
    role: 'receptionist',
    status: 'active',
    organizationId: org.id,
  });

  const clientLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'client@test.com', password: 'Test@123456' });
  clientAdminToken = clientLogin.body.accessToken;

  const receptionLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'reception@test.com', password: 'Test@123456' });
  receptionistToken = receptionLogin.body.accessToken;

  const doctorLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'doctor@test.com', password: 'Test@123456' });
  doctorToken = doctorLogin.body.accessToken;
});

describe('Patients API', () => {
  it('POST /patients creates patient as receptionist', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        firstName: 'Rajesh',
        lastName: 'Kumar',
        phone: '9876543210',
        gender: 'male',
      });

    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe('Rajesh');
    expect(res.body.phone).toBe('9876543210');
  });

  it('POST /patients rejects duplicate phone in same clinic', async () => {
    await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ firstName: 'First', phone: '9999888877' })
      .expect(201);

    const res = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ firstName: 'Second', phone: '9999888877' });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/phone/i);
  });

  it('GET /patients lists patients for client admin', async () => {
    await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ firstName: 'List', phone: '1111222233' });

    const res = await request(app)
      .get('/api/v1/patients')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('POST /patients returns 403 for client admin', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ firstName: 'No', phone: '5555666677' });

    expect(res.status).toBe(403);
  });

  it('GET /patients/:id/snapshot returns snapshot for doctor', async () => {
    const createRes = await request(app)
      .post('/api/v1/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ firstName: 'Snap', lastName: 'Shot', phone: '4444333322' });

    const res = await request(app)
      .get(`/api/v1/patients/${createRes.body.id}/snapshot`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.patientId).toBe(createRes.body.id);
    expect(res.body.totalVisits).toBe(0);
    expect(Array.isArray(res.body.recentConsultations)).toBe(true);
  });

  it('GET /patients/:id/snapshot returns 403 for client admin', async () => {
    const patient = await Patient.create({
      organizationId: demoOrgId,
      firstName: 'No',
      phone: '3333222211',
    });

    const res = await request(app)
      .get(`/api/v1/patients/${patient.id}/snapshot`)
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(403);
  });
});
