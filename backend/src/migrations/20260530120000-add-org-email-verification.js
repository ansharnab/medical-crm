'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('organizations');

    if (!table.email_verified_at) {
      await queryInterface.addColumn('organizations', 'email_verified_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
    if (!table.email_verification_token) {
      await queryInterface.addColumn('organizations', 'email_verification_token', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    if (!table.email_verification_expires_at) {
      await queryInterface.addColumn('organizations', 'email_verification_expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE organizations
      SET email_verified_at = COALESCE(email_verified_at, NOW())
      WHERE status = 'active' AND email_verified_at IS NULL
    `);

    await queryInterface.sequelize.query(`
      WITH ranked AS (
        SELECT id, email,
          ROW_NUMBER() OVER (PARTITION BY LOWER(email) ORDER BY created_at ASC, id ASC) AS rn
        FROM organizations
        WHERE email IS NOT NULL AND email <> ''
      )
      UPDATE organizations o
      SET email = CONCAT(SPLIT_PART(o.email, '@', 1), '+dup', r.rn - 1, '@', SPLIT_PART(o.email, '@', 2))
      FROM ranked r
      WHERE o.id = r.id AND r.rn > 1
    `);

    const [indexes] = await queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'organizations' AND indexname = 'organizations_email_unique'
    `);

    if (indexes.length === 0) {
      await queryInterface.addIndex('organizations', ['email'], {
        unique: true,
        name: 'organizations_email_unique',
      });
    }

    const [tokenIdx] = await queryInterface.sequelize.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'organizations' AND indexname = 'organizations_email_verification_token_idx'
    `);

    if (tokenIdx.length === 0) {
      await queryInterface.addIndex('organizations', ['email_verification_token'], {
        name: 'organizations_email_verification_token_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('organizations', 'organizations_email_verification_token_idx').catch(() => {});
    await queryInterface.removeIndex('organizations', 'organizations_email_unique').catch(() => {});
    await queryInterface.removeColumn('organizations', 'email_verification_expires_at').catch(() => {});
    await queryInterface.removeColumn('organizations', 'email_verification_token').catch(() => {});
    await queryInterface.removeColumn('organizations', 'email_verified_at').catch(() => {});
  },
};
