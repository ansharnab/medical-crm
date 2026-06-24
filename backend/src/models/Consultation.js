const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consultation = sequelize.define(
  'Consultation',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    appointmentId: { type: DataTypes.UUID, field: 'appointment_id', allowNull: false, unique: true },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    doctorId: { type: DataTypes.UUID, field: 'doctor_id', allowNull: false },
    symptoms: DataTypes.TEXT,
    diagnosis: DataTypes.TEXT,
    notes: DataTypes.TEXT,
    recommendations: DataTypes.TEXT,
    bpSystolic: { type: DataTypes.INTEGER, field: 'bp_systolic', allowNull: true },
    bpDiastolic: { type: DataTypes.INTEGER, field: 'bp_diastolic', allowNull: true },
    spo2: { type: DataTypes.INTEGER, allowNull: true },
    weightKg: { type: DataTypes.DECIMAL(5, 2), field: 'weight_kg', allowNull: true },
    temperatureC: { type: DataTypes.DECIMAL(4, 1), field: 'temperature_c', allowNull: true },
    startedAt: { type: DataTypes.DATE, field: 'started_at' },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
  },
  { tableName: 'consultations', underscored: true, timestamps: true }
);

module.exports = Consultation;
