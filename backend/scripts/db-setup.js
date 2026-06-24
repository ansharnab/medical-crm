#!/usr/bin/env node
/**
 * Create PostgreSQL databases and run migrations per environment.
 *
 * Usage:
 *   npm run db:setup              # dev + test
 *   npm run db:setup -- --all     # dev + test + staging
 *   npm run db:setup -- --test-only
 *   npm run db:setup -- --staging-only
 *   npm run db:setup -- --seed
 */
const { execSync } = require('child_process');
const path = require('path');
const { Client } = require('pg');
const { loadEnv, backendRoot } = require('../src/config/load-env');
const { buildConnectionUrl, pgAdminConfig, PROFILE_DB } = require('../src/config/db-url');

const seed = process.argv.includes('--seed');
const testOnly = process.argv.includes('--test-only');
const stagingOnly = process.argv.includes('--staging-only');
const all = process.argv.includes('--all');
const backendDir = path.resolve(__dirname, '..');

loadEnv();

async function ensureDatabase(dbName) {
  const client = new Client(pgAdminConfig());
  await client.connect();
  const { rows } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database: ${dbName}`);
  } else {
    console.log(`Database exists: ${dbName}`);
  }
  await client.end();
}

function run(cmd, env = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, {
    cwd: backendDir,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

function migrateProfile(profile) {
  const cfg = PROFILE_DB[profile];
  const url = buildConnectionUrl(profile);
  console.log(`\nMigrating ${profile} DB (${cfg.name})...`);
  run('npx sequelize-cli db:migrate', {
    NODE_ENV: profile,
    [cfg.urlEnv]: url,
    DB_NAME: cfg.name,
  });
}

async function main() {
  console.log('=== Doctor CRM DB Setup ===\n');

  if (stagingOnly) {
    await ensureDatabase(PROFILE_DB.staging.name);
    migrateProfile('staging');
  } else if (testOnly) {
    await ensureDatabase(PROFILE_DB.test.name);
    migrateProfile('test');
  } else {
    await ensureDatabase(PROFILE_DB.development.name);
    await ensureDatabase(PROFILE_DB.test.name);
    if (all) {
      await ensureDatabase(PROFILE_DB.staging.name);
    }

    migrateProfile('development');
    if (seed) {
      console.log('\nSeeding development DB...');
      run('node src/seeders/run-seed.js');
    }
    migrateProfile('test');
    if (all) {
      migrateProfile('staging');
    }
  }

  console.log('\nDone.');
  console.log('  Dev:        doctor_crm            → DATABASE_URL');
  console.log('  Test:       doctor_crm_test       → TEST_DATABASE_URL');
  console.log('  Staging:    doctor_crm_staging    → STAGING_DATABASE_URL');
  console.log('  Production: doctor_crm_production → PRODUCTION_DATABASE_URL');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
