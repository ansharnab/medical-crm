process.env.NODE_ENV = 'test';

const { loadEnv } = require('../src/config/load-env');
loadEnv();

// Force stable secrets so tokens stay valid for the full test run
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

const { sequelize } = require('../src/models');

const PATIENT_SNAPSHOTS_VIEW = `
  CREATE OR REPLACE VIEW patient_snapshots AS
  SELECT
    p.id AS patient_id,
    p.organization_id,
    COUNT(c.id) FILTER (WHERE c.completed_at IS NOT NULL) AS total_visits,
    MAX(c.completed_at) AS last_visit_date,
    (
      SELECT u.first_name || ' ' || u.last_name
      FROM consultations c2
      JOIN users u ON u.id = c2.doctor_id
      WHERE c2.patient_id = p.id AND c2.organization_id = p.organization_id
      ORDER BY c2.completed_at DESC NULLS LAST
      LIMIT 1
    ) AS last_doctor_name,
    (
      SELECT c2.diagnosis
      FROM consultations c2
      WHERE c2.patient_id = p.id AND c2.organization_id = p.organization_id
      ORDER BY c2.completed_at DESC NULLS LAST
      LIMIT 1
    ) AS last_diagnosis,
    (
      SELECT COUNT(*)::int
      FROM followups f
      WHERE f.patient_id = p.id AND f.organization_id = p.organization_id AND f.status = 'pending'
    ) AS pending_followups_count
  FROM patients p
  LEFT JOIN consultations c ON c.patient_id = p.id AND c.organization_id = p.organization_id
  GROUP BY p.id, p.organization_id;
`;

async function ensureClinicalViews() {
  await sequelize.query(PATIENT_SNAPSHOTS_VIEW);
}

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await ensureClinicalViews();
});

afterAll(async () => {
  await sequelize.close();
  const { disconnectRedis } = require('../src/config/redis');
  await disconnectRedis();
});
