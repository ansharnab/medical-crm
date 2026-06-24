'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('patients', {
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
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: true },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      address: { type: Sequelize.TEXT, allowNull: true },
      blood_group: { type: Sequelize.STRING(5), allowNull: true },
      emergency_contact: { type: Sequelize.STRING(20), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('patients', ['organization_id', 'phone'], { unique: true });
    await queryInterface.addIndex('patients', ['organization_id', 'last_name', 'first_name']);

    await queryInterface.createTable('appointments', {
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
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      scheduled_at: { type: Sequelize.DATE, allowNull: false },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 15 },
      status: {
        type: Sequelize.ENUM(
          'scheduled',
          'confirmed',
          'waiting',
          'in_consultation',
          'completed',
          'cancelled',
          'no_show'
        ),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      token_number: { type: Sequelize.INTEGER, allowNull: true },
      fee_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      booked_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('appointments', ['organization_id', 'scheduled_at']);
    await queryInterface.addIndex('appointments', ['organization_id', 'doctor_id', 'scheduled_at']);
    await queryInterface.addIndex('appointments', ['organization_id', 'patient_id']);
    await queryInterface.addIndex('appointments', ['organization_id', 'status']);

    await queryInterface.createTable('consultations', {
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
      appointment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'appointments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      symptoms: { type: Sequelize.TEXT, allowNull: true },
      diagnosis: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      recommendations: { type: Sequelize.TEXT, allowNull: true },
      started_at: { type: Sequelize.DATE, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('consultations', ['organization_id', 'patient_id', 'completed_at']);
    await queryInterface.addIndex('consultations', ['organization_id', 'doctor_id']);

    await queryInterface.createTable('payments', {
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
      appointment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'appointments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      amount_paid: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_mode: {
        type: Sequelize.ENUM('cash', 'upi', 'card', 'other'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'partial', 'waived'),
        allowNull: false,
        defaultValue: 'pending',
      },
      collected_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('payments', ['organization_id', 'status']);
    await queryInterface.addIndex('payments', ['organization_id', 'created_at']);
    await queryInterface.addIndex('payments', ['organization_id', 'patient_id']);
    await queryInterface.addIndex('payments', ['appointment_id'], { unique: true });

    await queryInterface.createTable('followups', {
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
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      consultation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'consultations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('followups', ['organization_id', 'due_date', 'status']);
    await queryInterface.addIndex('followups', ['organization_id', 'patient_id']);

    await queryInterface.sequelize.query(`
      CREATE VIEW patient_snapshots AS
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
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS patient_snapshots;');
    await queryInterface.dropTable('followups');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('consultations');
    await queryInterface.dropTable('appointments');
    await queryInterface.dropTable('patients');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_patients_gender";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_appointments_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_payment_mode";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payments_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_followups_status";');
  },
};
