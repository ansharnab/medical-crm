const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '../..');

/**
 * Load env files. Test mode avoids overriding JWT/secret vars from .env.
 */
function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'test') {
    const testFile = path.join(backendRoot, '.env.test');
    if (fs.existsSync(testFile)) {
      dotenv.config({ path: testFile, override: false });
    }
    // Local dev: read TEST_DATABASE_URL from .env without clobbering test secrets
    if (!process.env.TEST_DATABASE_URL) {
      const envFile = path.join(backendRoot, '.env');
      if (fs.existsSync(envFile)) {
        dotenv.config({ path: envFile, override: false });
      }
    }
    return;
  }

  const files = [
    path.join(backendRoot, '.env'),
    path.join(backendRoot, '.env.local'),
    ...(nodeEnv !== 'development' ? [path.join(backendRoot, `.env.${nodeEnv}`)] : []),
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file, override: true });
    }
  }
}

module.exports = { loadEnv, backendRoot };
