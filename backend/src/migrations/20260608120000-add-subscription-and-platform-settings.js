'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('organizations', 'subscription_plan', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'starter',
    });
    await queryInterface.addColumn('organizations', 'subscription_status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'trial',
    });
    await queryInterface.addColumn('organizations', 'trial_ends_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.createTable('platform_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        defaultValue: 1,
      },
      product_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Doctor CRM',
      },
      platform_owner: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'MaatriDev Technologies',
      },
      support_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'support@doctorcrm.com',
      },
      default_timezone: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Asia/Kolkata',
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INR',
      },
      maintenance_mode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    const now = new Date();
    await queryInterface.bulkInsert('platform_settings', [
      {
        id: 1,
        product_name: 'Doctor CRM',
        platform_owner: 'MaatriDev Technologies',
        support_email: 'support@doctorcrm.com',
        default_timezone: 'Asia/Kolkata',
        currency: 'INR',
        maintenance_mode: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('platform_settings');
    await queryInterface.removeColumn('organizations', 'trial_ends_at');
    await queryInterface.removeColumn('organizations', 'subscription_status');
    await queryInterface.removeColumn('organizations', 'subscription_plan');
  },
};
