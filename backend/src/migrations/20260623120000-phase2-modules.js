'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('consultations', 'bp_systolic', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('consultations', 'bp_diastolic', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('consultations', 'spo2', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('consultations', 'weight_kg', { type: Sequelize.DECIMAL(5, 2), allowNull: true });
    await queryInterface.addColumn('consultations', 'temperature_c', { type: Sequelize.DECIMAL(4, 1), allowNull: true });

    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      consultation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'consultations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'patients', key: 'id' } },
      doctor_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('prescription_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      prescription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'prescriptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      medicine_name: { type: Sequelize.STRING(255), allowNull: false },
      dose: { type: Sequelize.STRING(100), allowNull: true },
      duration: { type: Sequelize.STRING(100), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'patients', key: 'id' } },
      appointment_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'appointments', key: 'id' } },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      gst_rate: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      gst_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      paid_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('pending', 'partial', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('invoices', ['organization_id', 'status']);

    await queryInterface.createTable('invoice_payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'invoices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_mode: {
        type: Sequelize.ENUM('cash', 'upi', 'card', 'other'),
        allowNull: false,
        defaultValue: 'cash',
      },
      collected_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('message_templates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(120), allowNull: false },
      channel: { type: Sequelize.ENUM('sms', 'email', 'whatsapp'), allowNull: false, defaultValue: 'sms' },
      body: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('message_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'patients', key: 'id' } },
      channel: { type: Sequelize.ENUM('sms', 'email', 'whatsapp'), allowNull: false },
      recipient: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      status: {
        type: Sequelize.ENUM('queued', 'sent', 'failed', 'dev_logged'),
        allowNull: false,
        defaultValue: 'queued',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('message_logs', ['organization_id', 'created_at']);

    await queryInterface.createTable('pharmacy_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      sku: { type: Sequelize.STRING(80), allowNull: true },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      unit: { type: Sequelize.STRING(30), allowNull: true, defaultValue: 'units' },
      reorder_level: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 10 },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('pharmacy_items', ['organization_id', 'name']);

    await queryInterface.createTable('lab_orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      organization_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      consultation_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'consultations', key: 'id' } },
      patient_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'patients', key: 'id' } },
      doctor_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      test_name: { type: Sequelize.STRING(255), allowNull: false },
      status: {
        type: Sequelize.ENUM('ordered', 'sample_collected', 'processing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'ordered',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('lab_orders', ['organization_id', 'status']);

    await queryInterface.createTable('lab_results', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      lab_order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'lab_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      result_text: { type: Sequelize.TEXT, allowNull: true },
      file_url: { type: Sequelize.STRING(500), allowNull: true },
      recorded_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lab_results');
    await queryInterface.dropTable('lab_orders');
    await queryInterface.dropTable('pharmacy_items');
    await queryInterface.dropTable('message_logs');
    await queryInterface.dropTable('message_templates');
    await queryInterface.dropTable('invoice_payments');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('prescription_items');
    await queryInterface.dropTable('prescriptions');
    await queryInterface.removeColumn('consultations', 'temperature_c');
    await queryInterface.removeColumn('consultations', 'weight_kg');
    await queryInterface.removeColumn('consultations', 'spo2');
    await queryInterface.removeColumn('consultations', 'bp_diastolic');
    await queryInterface.removeColumn('consultations', 'bp_systolic');
  },
};
