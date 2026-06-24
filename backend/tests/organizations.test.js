const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User, Organization, AuditLog } = require('../src/models');
const { generateVerificationToken, getVerificationExpiry } = require('../src/modules/email/email.service');

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

describe('Organizations API — Super Admin', () => {
  it('GET /organizations lists clinics with pagination meta', async () => {
    const res = await request(app)
      .get('/api/v1/organizations?page=1&limit=10')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.page).toBe(1);
  });

  it('POST /organizations creates pending clinic and sends verification', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'New City Clinic',
        email: 'new@cityclinic.com',
        city: 'Pune',
        state: 'Maharashtra',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New City Clinic');
    expect(res.body.status).toBe('pending');
    expect(res.body.emailVerified).toBe(false);
    expect(res.body.verificationEmailSent).toBe(true);
  });

  it('POST /organizations rejects duplicate clinic email', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Duplicate Clinic',
        email: 'test@clinic.com',
      });

    expect(res.status).toBe(409);
  });

  it('GET /organizations/verify-email activates clinic', async () => {
    const token = generateVerificationToken();
    const org = await Organization.create({
      name: 'Verify Clinic',
      slug: 'verify-clinic',
      email: 'verify@clinic.com',
      status: 'pending',
      emailVerificationToken: token,
      emailVerificationExpiresAt: getVerificationExpiry(),
    });

    const res = await request(app).get(`/api/v1/organizations/verify-email?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.organization.status).toBe('active');
    expect(res.body.organization.emailVerified).toBe(true);

    await org.reload();
    expect(org.status).toBe('active');
  });

  it('PATCH /organizations/:id suspends clinic', async () => {
    const res = await request(app)
      .patch(`/api/v1/organizations/${demoOrgId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'suspended' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('suspended');
  });

  it('POST /organizations/:id/client-admins creates admin for verified clinic', async () => {
    const org = await Organization.create({
      name: 'Admin Test Clinic',
      slug: 'admin-test-clinic',
      email: 'adminclinic@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    const res = await request(app)
      .post(`/api/v1/organizations/${org.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'newadmin@clinic.com',
        firstName: 'New',
        lastName: 'Admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('client_admin');
    expect(res.body.credentialsEmailSent).toBe(true);
    expect(res.body.devPassword).toBeDefined();

    const createdUser = await User.findOne({ where: { email: 'newadmin@clinic.com' } });
    expect(createdUser.mustChangePassword).toBe(true);
  });

  it('POST /organizations/:id/client-admins/:userId/resend-password sends new password', async () => {
    const org = await Organization.create({
      name: 'Resend Password Clinic',
      slug: 'resend-password-clinic',
      email: 'resendpwd@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    const createRes = await request(app)
      .post(`/api/v1/organizations/${org.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'resendadmin@clinic.com',
        firstName: 'Resend',
        lastName: 'Admin',
      });

    const res = await request(app)
      .post(`/api/v1/organizations/${org.id}/client-admins/${createRes.body.id}/resend-password`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/temporary password/i);
    expect(res.body.devPassword).toBeDefined();

    const updatedUser = await User.findByPk(createRes.body.id);
    expect(updatedUser.mustChangePassword).toBe(true);
  });

  it('PATCH /organizations/:id/client-admins/:userId updates client admin', async () => {
    const org = await Organization.create({
      name: 'Update Admin Clinic',
      slug: 'update-admin-clinic',
      email: 'updateadmin@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    const createRes = await request(app)
      .post(`/api/v1/organizations/${org.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'patchadmin@clinic.com',
        firstName: 'Patch',
        lastName: 'Admin',
      });

    const res = await request(app)
      .patch(`/api/v1/organizations/${org.id}/client-admins/${createRes.body.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ firstName: 'Updated', phone: '9999999999' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.phone).toBe('9999999999');
  });

  it('DELETE /organizations/:id/client-admins/:userId deletes client admin', async () => {
    const org = await Organization.create({
      name: 'Delete Admin Clinic',
      slug: 'delete-admin-clinic',
      email: 'deleteadminclinic@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    const createRes = await request(app)
      .post(`/api/v1/organizations/${org.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'removeadmin@clinic.com',
        firstName: 'Remove',
        lastName: 'Admin',
      });

    const res = await request(app)
      .delete(`/api/v1/organizations/${org.id}/client-admins/${createRes.body.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);

    const deletedUser = await User.findByPk(createRes.body.id);
    expect(deletedUser).toBeNull();
  });

  it('DELETE /organizations/:id hard deletes clinic and its users', async () => {
    const org = await Organization.create({
      name: 'Delete Me Clinic',
      slug: 'delete-me-clinic',
      email: 'deleteme@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    await User.create({
      email: 'deleteadmin@test.com',
      passwordHash: await bcrypt.hash('Test@123456', 12),
      firstName: 'Delete',
      lastName: 'Admin',
      role: 'client_admin',
      status: 'active',
      organizationId: org.id,
    });

    const res = await request(app)
      .delete(`/api/v1/organizations/${org.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);

    const deletedOrg = await Organization.findByPk(org.id);
    const remainingUsers = await User.count({ where: { organizationId: org.id } });
    expect(deletedOrg).toBeNull();
    expect(remainingUsers).toBe(0);
  });

  it('POST /organizations/:id/client-admins rejects duplicate user email in same clinic', async () => {
    const res = await request(app)
      .post(`/api/v1/organizations/${demoOrgId}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'client@test.com',
        firstName: 'Dup',
        lastName: 'Admin',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/already registered in this clinic/i);
  });

  it('POST /organizations/:id/client-admins allows same email in different clinics', async () => {
    const orgA = await Organization.create({
      name: 'Clinic A',
      slug: 'clinic-a-scope',
      email: 'clinica@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });
    const orgB = await Organization.create({
      name: 'Clinic B',
      slug: 'clinic-b-scope',
      email: 'clinicb@test.com',
      status: 'active',
      emailVerifiedAt: new Date(),
    });

    await request(app)
      .post(`/api/v1/organizations/${orgA.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'shared@staff.com',
        firstName: 'Shared',
        lastName: 'Admin',
      })
      .expect(201);

    const res = await request(app)
      .post(`/api/v1/organizations/${orgB.id}/client-admins`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        email: 'shared@staff.com',
        firstName: 'Shared',
        lastName: 'Admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('shared@staff.com');
  });
});

describe('Organizations API — RBAC & tenant isolation', () => {
  it('returns 403 for client admin listing organizations', async () => {
    const res = await request(app)
      .get('/api/v1/organizations')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 403 for client admin creating organization', async () => {
    const res = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${clientAdminToken}`)
      .send({ name: 'Hack Clinic', email: 'hack@test.com' });

    expect(res.status).toBe(403);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/organizations');
    expect(res.status).toBe(401);
  });
});

describe('Platform Analytics API', () => {
  it('returns platform stats for super admin', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/platform')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.clinics).toBeDefined();
    expect(res.body.users).toBeDefined();
  });

  it('returns 403 for client admin', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/platform')
      .set('Authorization', `Bearer ${clientAdminToken}`);

    expect(res.status).toBe(403);
  });
});
