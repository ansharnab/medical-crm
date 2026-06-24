'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeIndex('users', ['email']).catch(() => {});
    await queryInterface.removeConstraint('users', 'users_email_key').catch(() => {});

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_super_admin_unique
      ON users (LOWER(email))
      WHERE organization_id IS NULL
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_organization_email_unique
      ON users (organization_id, LOWER(email))
      WHERE organization_id IS NOT NULL
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS users_email_lookup_idx
      ON users (LOWER(email))
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS users_email_lookup_idx');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS users_organization_email_unique');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS users_email_super_admin_unique');

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_key' });
  },
};
