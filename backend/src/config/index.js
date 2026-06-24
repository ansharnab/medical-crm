const { loadEnv } = require('./load-env');
loadEnv();

const { resolveProfile, buildConnectionUrl, defaultDbName } = require('./db-url');

const nodeEnv = process.env.NODE_ENV || 'development';
const dbProfile = resolveProfile();
const isTest = dbProfile === 'test';

const config = {
  env: nodeEnv,
  port: parseInt(process.env.PORT, 10) || 4000,
  isProduction: dbProfile === 'production',
  isStaging: dbProfile === 'staging',
  isTest,
  dbProfile,
  db: {
    url: buildConnectionUrl(dbProfile),
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || defaultDbName(dbProfile),
    user: process.env.DB_USER || 'doctorcrm',
    password: process.env.DB_PASSWORD || 'doctorcrm',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-min-32-characters',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-characters',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:5173'],
  },
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    refreshName: 'refreshToken',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  seed: {
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'admin@doctorcrm.com',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
  },
  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  email: {
    from: process.env.EMAIL_FROM || 'MaatriDev <info@maatridev.com>',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
  },
  messaging: {
    supportPhone: process.env.SUPPORT_PHONE || '9211611187',
    supportEmail: process.env.SUPPORT_EMAIL || 'info@maatridev.com',
    smsProvider: process.env.SMS_PROVIDER || 'stub',
    msg91AuthKey: process.env.MSG91_AUTH_KEY || '',
    smsSenderId: process.env.SMS_SENDER_ID || 'MAATRD',
    whatsappProvider: process.env.WHATSAPP_PROVIDER || 'stub',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioSmsFrom: process.env.TWILIO_SMS_FROM || '',
    twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  },
};

module.exports = config;
