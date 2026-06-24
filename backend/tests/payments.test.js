const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog, Patient, Appointment, Payment } = require('../src/models');

let app;
let clientAdminToken;
let receptionistToken;
let demoOrgId;
let doctorId;
let patientId;
let appointmentId;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Payment.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
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
    firstName: 'Pay',
    lastName: 'Patient',
    phone: '9876510001',
  });
  patientId = patient.id;

  const scheduledAt = new Date();
  scheduledAt.setUTCHours(10, 0, 0, 0);

  const appointment = await Appointment.create({
    organizationId: org.id,
    patientId,
    doctorId,
    scheduledAt,
    status: 'confirmed',
    tokenNumber: 1,
    feeAmount: 500,
  });
  appointmentId = appointment.id;

  const clientLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'client@test.com', password: 'Test@123456' });
  clientAdminToken = clientLogin.body.accessToken;

  const receptionLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'reception@test.com', password: 'Test@123456' });
  receptionistToken = receptionLogin.body.accessToken;
});

describe('Payments API', () => {
  it('POST /payments creates payment with paid status', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 500,
        paymentMode: 'cash',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('paid');
    expect(res.body.amount).toBe(500);
    expect(res.body.amountPaid).toBe(500);
  });

  it('POST /payments rejects duplicate payment for appointment', async () => {
    await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 500,
        paymentMode: 'cash',
      })
      .expect(201);

    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 500,
        paymentMode: 'cash',
      });

    expect(res.status).toBe(409);
  });

  it('PATCH /payments/:id records partial payment', async () => {
    const createRes = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 200,
        paymentMode: 'cash',
      });

    expect(createRes.body.status).toBe('partial');

    const res = await request(app)
      .patch(`/api/v1/payments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ amountPaid: 500 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');
    expect(res.body.amountPaid).toBe(500);
  });

  it('GET /payments lists payments for client admin', async () => {
    await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 500,
        paymentMode: 'upi',
      });

    const res = await request(app)
      .get('/api/v1/payments')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /payments returns 403 for client admin', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        appointmentId,
        amount: 500,
        amountPaid: 500,
        paymentMode: 'cash',
      });

    expect(res.status).toBe(403);
  });
});
