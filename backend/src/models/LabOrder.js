const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabOrder = sequelize.define(
  'LabOrder',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    consultationId: { type: DataTypes.UUID, field: 'consultation_id', allowNull: true },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    doctorId: { type: DataTypes.UUID, field: 'doctor_id', allowNull: false },
    testName: { type: DataTypes.STRING(255), field: 'test_name', allowNull: false },
    status: {
      type: DataTypes.ENUM('ordered', 'sample_collected', 'processing', 'completed', 'cancelled'),
      defaultValue: 'ordered',
    },
    notes: DataTypes.TEXT,
  },
  { tableName: 'lab_orders', underscored: true, timestamps: true }
);

module.exports = LabOrder;
