const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog, Patient, Appointment } = require('../src/models');

let app;
let clientAdminToken;
let receptionistToken;
let doctorToken;
let demoOrgId;
let doctorId;
let patientId;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Appointment.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
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

  const patient = await Patient.create({
    organizationId: org.id,
    firstName: 'Appt',
    lastName: 'Patient',
    phone: '9876500001',
  });
  patientId = patient.id;

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

describe('Appointments API', () => {
  it('POST /appointments books appointment with token and fee', async () => {
    const scheduledAt = new Date();
    scheduledAt.setUTCHours(10, 0, 0, 0);

    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        patientId,
        doctorId,
        scheduledAt: scheduledAt.toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.tokenNumber).toBe(1);
    expect(res.body.feeAmount).toBe(500);
    expect(res.body.patientId).toBe(patientId);
    expect(res.body.doctorId).toBe(doctorId);
  });

  it('POST /appointments assigns incrementing token numbers per doctor/day', async () => {
    const scheduledAt = new Date();
    scheduledAt.setUTCHours(11, 0, 0, 0);

    const first = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patientId, doctorId, scheduledAt: scheduledAt.toISOString() });

    const patient2 = await Patient.create({
      organizationId: demoOrgId,
      firstName: 'Second',
      phone: '9876500002',
    });

    const second = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patientId: patient2.id, doctorId, scheduledAt: scheduledAt.toISOString() });

    expect(first.body.tokenNumber).toBe(1);
    expect(second.body.tokenNumber).toBe(2);
  });

  it('GET /appointments scopes doctor to own appointments', async () => {
    const scheduledAt = new Date();
    scheduledAt.setUTCHours(12, 0, 0, 0);

    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patientId, doctorId, scheduledAt: scheduledAt.toISOString() });

    const otherDoctor = await User.create({
      email: 'otherdoc@test.com',
      passwordHash: await bcrypt.hash('Test@123456', 12),
      firstName: 'Other',
      lastName: 'Doctor',
      role: 'doctor',
      status: 'active',
      organizationId: demoOrgId,
      consultationFee: 400,
    });

    const patient2 = await Patient.create({
      organizationId: demoOrgId,
      firstName: 'Other',
      phone: '9876500003',
    });

    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        patientId: patient2.id,
        doctorId: otherDoctor.id,
        scheduledAt: scheduledAt.toISOString(),
      });

    const res = await request(app)
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((a) => a.doctorId === doctorId)).toBe(true);
  });

  it('POST /appointments/:id/cancel cancels appointment', async () => {
    const scheduledAt = new Date();
    scheduledAt.setUTCHours(14, 0, 0, 0);

    const createRes = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patientId, doctorId, scheduledAt: scheduledAt.toISOString() });

    const res = await request(app)
      .post(`/api/v1/appointments/${createRes.body.id}/cancel`)
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelled/i);

    const updated = await Appointment.findByPk(createRes.body.id);
    expect(updated.status).toBe('cancelled');
  });

  it('POST /appointments returns 403 for doctor', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId,
        doctorId,
        scheduledAt: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });
});
