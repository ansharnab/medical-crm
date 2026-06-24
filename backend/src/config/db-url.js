const { loadEnv } = require('./load-env');

loadEnv();

const PROFILE_DB = {
  development: { name: 'doctor_crm', urlEnv: 'DATABASE_URL' },
  test: { name: 'doctor_crm_test', urlEnv: 'TEST_DATABASE_URL' },
  staging: { name: 'doctor_crm_staging', urlEnv: 'STAGING_DATABASE_URL' },
  production: { name: 'doctor_crm_production', urlEnv: 'PRODUCTION_DATABASE_URL' },
};

function resolveProfile() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'test' || nodeEnv === 'production' || nodeEnv === 'staging') {
    return nodeEnv;
  }
  const profile = process.env.DB_PROFILE;
  if (profile && PROFILE_DB[profile]) return profile;
  return 'development';
}

function buildConnectionUrl(profile = resolveProfile()) {
  const cfg = PROFILE_DB[profile] || PROFILE_DB.development;
  const dedicated = process.env[cfg.urlEnv];
  if (dedicated) return dedicated;

  if (profile === 'production' && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (profile === 'development' && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const user = process.env.DB_USER || 'doctorcrm';
  const pass = process.env.DB_PASSWORD || 'doctorcrm';
  const dbName = process.env.DB_NAME || cfg.name;
  const auth = pass ? `${user}:${pass}` : user;
  return `postgres://${auth}@${host}:${port}/${dbName}`;
}

function defaultDbName(profile = resolveProfile()) {
  return PROFILE_DB[profile]?.name || 'doctor_crm';
}

function pgAdminConfig() {
  const devUrl = process.env.DATABASE_URL || buildConnectionUrl('development');
  const parsed = new URL(devUrl.replace(/^postgresql:/, 'postgres:'));
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: 'postgres',
  };
}

function maskDbUrl(url) {
  try {
    const u = new URL(url.replace(/^postgresql:/, 'postgres:'));
    return `${u.protocol}//${u.username ? `${u.username}@` : ''}${u.host}${u.pathname}`;
  } catch {
    return '(invalid url)';
  }
}

module.exports = {
  PROFILE_DB,
  resolveProfile,
  buildConnectionUrl,
  defaultDbName,
  pgAdminConfig,
  maskDbUrl,
};
