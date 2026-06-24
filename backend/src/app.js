const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config');
const requestIdMiddleware = require('./middleware/requestId.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const organizationsRoutes = require('./modules/organizations/organizations.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const usersRoutes = require('./modules/users/users.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const patientsRoutes = require('./modules/patients/patients.routes');
const appointmentsRoutes = require('./modules/appointments/appointments.routes');
const paymentsRoutes = require('./modules/payments/payments.routes');
const queueRoutes = require('./modules/queue/queue.routes');
const consultationsRoutes = require('./modules/consultations/consultations.routes');
const followupsRoutes = require('./modules/followups/followups.routes');
const exportsRoutes = require('./modules/exports/exports.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const platformRoutes = require('./modules/platform/platform.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const communicationsRoutes = require('./modules/communications/communications.routes');
const pharmacyRoutes = require('./modules/pharmacy/pharmacy.routes');
const labsRoutes = require('./modules/labs/labs.routes');
const { sequelize } = require('./models');
const { getRedis } = require('./config/redis');

async function createApp() {
  const app = express();

  app.use(helmet());
  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = config.cors.origin;
        if (Array.isArray(allowed) && allowed.includes(origin)) return callback(null, true);
        // Dev: any localhost port (Vite may use 5174, 5175, etc.)
        if (!config.isProduction && /^http:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/ready', async (req, res, next) => {
    try {
      await sequelize.authenticate();
      const redis = getRedis();
      const pong = await redis.ping();
      res.json({ status: 'ready', database: 'connected', redis: pong === 'PONG' ? 'connected' : 'unknown' });
    } catch (err) {
      next(err);
    }
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/organizations', organizationsRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/settings', settingsRoutes);
  app.use('/api/v1/patients', patientsRoutes);
  app.use('/api/v1/appointments', appointmentsRoutes);
  app.use('/api/v1/payments', paymentsRoutes);
  app.use('/api/v1/queue', queueRoutes);
  app.use('/api/v1/consultations', consultationsRoutes);
  app.use('/api/v1/followups', followupsRoutes);
  app.use('/api/v1/exports', exportsRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/platform', platformRoutes);
  app.use('/api/v1/invoices', billingRoutes);
  app.use('/api/v1/communications', communicationsRoutes);
  app.use('/api/v1/pharmacy', pharmacyRoutes);
  app.use('/api/v1/labs', labsRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
