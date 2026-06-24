const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog } = require('../src/models');
const { DEFAULT_WORKING_HOURS } = require('../src/modules/settings/workingHours.defaults');

let app;
let superAdminToken;
let clientAdminToken;
let demoOrgId;

beforeAll(async () => {
  app = await createApp();
});

beforeEach(async () => {
  await AuditLog.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Organization.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

  const passwordHash = await bcrypt.hash('Test@123456', 12);

  await User.create({
    email: 'super@test.com',
    passwordHash,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    status: 'active',
    organizationId: null,
  });

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

  const superLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'super@test.com', password: 'Test@123456' });
  superAdminToken = superLogin.body.accessToken;

  const clientLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'client@test.com', password: 'Test@123456' });
  clientAdminToken = clientLogin.body.accessToken;
});

describe('Users API — Client Admin', () => {
  it('POST /users creates doctor with auto-generated credentials', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'doctor@test.com',
        firstName: 'Jane',
        lastName: 'Doctor',
        role: 'doctor',
        specialization: 'General Medicine',
        consultationFee: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('doctor@test.com');
    expect(res.body.role).toBe('doctor');
    expect(res.body.mustChangePassword).toBe(true);
    expect(res.body.credentialsEmailSent).toBe(true);
    expect(res.body.password).toBeUndefined();
  });

  it('POST /users creates receptionist', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'reception@test.com',
        firstName: 'Rita',
        lastName: 'Desk',
        role: 'receptionist',
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('receptionist');
  });

  it('GET /users lists doctors and receptionists with pagination', async () => {
    await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'doctor2@test.com',
        firstName: 'Doc',
        lastName: 'Two',
        role: 'doctor',
      });

    const res = await request(app)
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.every((user) => ['doctor', 'receptionist'].includes(user.role))).toBe(true);
  });

  it('PATCH /users/:id updates staff user', async () => {
    const created = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'patch@test.com',
        firstName: 'Patch',
        lastName: 'Me',
        role: 'doctor',
      });

    const res = await request(app)
      .patch(`/api/v1/users/${created.body.id}`)
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ firstName: 'Updated', status: 'disabled' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.status).toBe('disabled');
  });

  it('DELETE /users/:id removes staff user', async () => {
    const created = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'delete@test.com',
        firstName: 'Delete',
        lastName: 'Me',
        role: 'receptionist',
      });

    const res = await request(app)
      .delete(`/api/v1/users/${created.body.id}`)
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/users/${created.body.id}`)
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(getRes.status).toBe(404);
  });

  it('POST /users/:id/resend-password rotates credentials', async () => {
    const created = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'resend@test.com',
        firstName: 'Resend',
        lastName: 'Pass',
        role: 'receptionist',
      });

    const res = await request(app)
      .post(`/api/v1/users/${created.body.id}/resend-password`)
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/temporary password/i);
  });

  it('rejects duplicate email within same clinic', async () => {
    await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'dup@test.com',
        firstName: 'First',
        lastName: 'User',
        role: 'doctor',
      });

    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'dup@test.com',
        firstName: 'Second',
        lastName: 'User',
        role: 'receptionist',
      });

    expect(res.status).toBe(409);
  });
});

describe('Users API — RBAC & tenant isolation', () => {
  it('allows receptionist to list active doctors for booking', async () => {
    const passwordHash = await bcrypt.hash('Test@123456', 12);
    await User.create({
      email: 'bookdoctor@test.com',
      passwordHash,
      firstName: 'Book',
      lastName: 'Doctor',
      role: 'doctor',
      status: 'active',
      organizationId: demoOrgId,
      consultationFee: 500,
    });

    await User.create({
      email: 'bookreception@test.com',
      passwordHash,
      firstName: 'Book',
      lastName: 'Desk',
      role: 'receptionist',
      status: 'active',
      organizationId: demoOrgId,
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bookreception@test.com', password: 'Test@123456' });

    const res = await request(app)
      .get('/api/v1/users?role=doctor&status=active')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.every((u) => u.role === 'doctor')).toBe(true);
    expect(res.body.data[0].email).toBeUndefined();
  });

  it('returns 403 for super admin without tenant context', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 403 for doctor role', async () => {
    const passwordHash = await bcrypt.hash('Test@123456', 12);
    await User.create({
      email: 'doctor@test.com',
      passwordHash,
      firstName: 'Doc',
      lastName: 'Tor',
      role: 'doctor',
      status: 'active',
      organizationId: demoOrgId,
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'doctor@test.com', password: 'Test@123456' });

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${login.body.accessToken}`);

    expect(res.status).toBe(403);
  });

  it('prevents cross-tenant user access', async () => {
    const orgB = await Organization.create({
      name: 'Other Clinic',
      slug: 'other-clinic',
      email: 'other@clinic.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    const passwordHash = await bcrypt.hash('Test@123456', 12);
    await User.create({
      email: 'otheradmin@test.com',
      passwordHash,
      firstName: 'Other',
      lastName: 'Admin',
      role: 'client_admin',
      status: 'active',
      organizationId: orgB.id,
    });

    const created = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({
        email: 'isolated@test.com',
        firstName: 'Iso',
        lastName: 'Lated',
        role: 'doctor',
      });

    const otherLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'otheradmin@test.com', password: 'Test@123456' });

    const res = await request(app)
      .get(`/api/v1/users/${created.body.id}`)
      .set('Authorization', `Bearer ${otherLogin.body.accessToken}`);

    expect(res.status).toBe(404);
  });
});
