const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define(
  'Prescription',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    consultationId: { type: DataTypes.UUID, field: 'consultation_id', allowNull: false, unique: true },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    doctorId: { type: DataTypes.UUID, field: 'doctor_id', allowNull: false },
    notes: DataTypes.TEXT,
  },
  { tableName: 'prescriptions', underscored: true, timestamps: true }
);

module.exports = Prescription;
