const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { User } = require('../src/models');
const { getRedis } = require('../src/config/redis');

let app;

beforeAll(async () => {
  app = await createApp();
  try {
    const redis = getRedis();
    if (redis.status === 'wait') await redis.connect();
  } catch {
    // Redis optional in some test envs
  }
});

describe('Auth API', () => {
  const testUser = {
    email: 'testadmin@doctorcrm.com',
    password: 'Test@123456',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'super_admin',
    status: 'active',
  };

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    await User.create({
      ...testUser,
      email: testUser.email.toLowerCase(),
      passwordHash,
      organizationId: null,
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns access token and user on valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.role).toBe('super_admin');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('requires clinic selection when same email exists in multiple verified clinics', async () => {
      const { Organization } = require('../src/models');
      const passwordHash = await bcrypt.hash('Shared@123456', 12);

      const orgA = await Organization.create({
        name: 'Clinic Alpha',
        slug: 'clinic-alpha',
        email: 'alpha@test.com',
        city: 'Mumbai',
        status: 'active',
        emailVerifiedAt: new Date(),
      });
      const orgB = await Organization.create({
        name: 'Clinic Beta',
        slug: 'clinic-beta',
        email: 'beta@test.com',
        city: 'Pune',
        status: 'active',
        emailVerifiedAt: new Date(),
      });

      await User.create({
        email: 'shared-login@test.com',
        passwordHash,
        firstName: 'Shared',
        lastName: 'Admin',
        role: 'client_admin',
        status: 'active',
        organizationId: orgA.id,
      });
      await User.create({
        email: 'shared-login@test.com',
        passwordHash,
        firstName: 'Shared',
        lastName: 'Admin',
        role: 'client_admin',
        status: 'active',
        organizationId: orgB.id,
      });

      const selectRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'shared-login@test.com', password: 'Shared@123456' });

      expect(selectRes.status).toBe(200);
      expect(selectRes.body.requiresClinicSelection).toBe(true);
      expect(selectRes.body.clinics).toHaveLength(2);

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'shared-login@test.com',
          password: 'Shared@123456',
          organizationId: orgB.id,
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.organizationId).toBe(orgB.id);
      expect(loginRes.body.accessToken).toBeDefined();
    });

    it('logs into verified clinic when same email exists in pending clinic', async () => {
      const { Organization } = require('../src/models');
      const passwordHash = await bcrypt.hash('Shared@123456', 12);

      const pendingOrg = await Organization.create({
        name: 'Pending Shared Clinic',
        slug: 'pending-shared-clinic',
        email: 'pending-shared@test.com',
        status: 'pending',
      });
      const activeOrg = await Organization.create({
        name: 'Active Shared Clinic',
        slug: 'active-shared-clinic',
        email: 'active-shared@test.com',
        status: 'active',
        emailVerifiedAt: new Date(),
      });

      await User.create({
        email: 'shared-login@test.com',
        passwordHash,
        firstName: 'Pending',
        lastName: 'Admin',
        role: 'client_admin',
        status: 'active',
        organizationId: pendingOrg.id,
      });
      await User.create({
        email: 'shared-login@test.com',
        passwordHash,
        firstName: 'Active',
        lastName: 'Admin',
        role: 'client_admin',
        status: 'active',
        organizationId: activeOrg.id,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'shared-login@test.com', password: 'Shared@123456' });

      expect(res.status).toBe(200);
      expect(res.body.user.organizationId).toBe(activeOrg.id);
    });

    it('returns 401 on invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword1' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 400 on invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns new access token with valid refresh cookie', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const cookies = loginRes.headers['set-cookie'];

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.accessToken).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user with valid access token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.mustChangePassword).toBe(false);
  });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('updates password and clears mustChangePassword flag', async () => {
      const { Organization } = require('../src/models');
      const org = await Organization.create({
        name: 'Pwd Change Clinic',
        slug: 'pwd-change-clinic',
        email: 'pwdchange@test.com',
        status: 'active',
        emailVerifiedAt: new Date(),
      });

      const passwordHash = await bcrypt.hash('Temp@123456', 12);
      await User.create({
        email: 'clientadmin@test.com',
        passwordHash,
        firstName: 'Client',
        lastName: 'Admin',
        role: 'client_admin',
        status: 'active',
        organizationId: org.id,
        mustChangePassword: true,
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'clientadmin@test.com', password: 'Temp@123456' });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.user.mustChangePassword).toBe(true);

      const changeRes = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .send({ currentPassword: 'Temp@123456', newPassword: 'NewPass@123456' });

      expect(changeRes.status).toBe(200);
      expect(changeRes.body.user.mustChangePassword).toBe(false);

      const oldLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'clientadmin@test.com', password: 'Temp@123456' });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'clientadmin@test.com', password: 'NewPass@123456' });
      expect(newLogin.status).toBe(200);
      expect(newLogin.body.user.mustChangePassword).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 204 and clears session', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', loginRes.headers['set-cookie']);

      expect(res.status).toBe(204);
    });
  });
});

describe('Health endpoints', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns ready when DB connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});

describe('RBAC middleware', () => {
  const { requireRoles } = require('../src/middleware/rbac.middleware');

  it('allows matching role', (done) => {
    const middleware = requireRoles('super_admin');
    const req = { user: { role: 'super_admin' } };
    const res = {};
    middleware(req, res, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });

  it('denies non-matching role', (done) => {
    const middleware = requireRoles('super_admin');
    const req = { user: { role: 'doctor' } };
    const res = {};
    middleware(req, res, (err) => {
      expect(err.statusCode).toBe(403);
      done();
    });
  });
});

describe('Tenant middleware', () => {
  const { tenantMiddleware } = require('../src/middleware/tenant.middleware');

  it('sets tenantId from user organization', (done) => {
    const req = { user: { role: 'doctor', organizationId: 'org-123' } };
    tenantMiddleware(req, {}, (err) => {
      expect(err).toBeUndefined();
      expect(req.tenantId).toBe('org-123');
      done();
    });
  });

  it('allows super admin without tenantId', (done) => {
    const req = { user: { role: 'super_admin' }, headers: {} };
    tenantMiddleware(req, {}, (err) => {
      expect(err).toBeUndefined();
      expect(req.tenantId).toBeNull();
      done();
    });
  });
});
