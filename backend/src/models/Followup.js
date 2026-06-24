const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Followup = sequelize.define(
  'Followup',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    consultationId: { type: DataTypes.UUID, field: 'consultation_id', allowNull: true },
    doctorId: { type: DataTypes.UUID, field: 'doctor_id', allowNull: false },
    dueDate: { type: DataTypes.DATEONLY, field: 'due_date', allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: DataTypes.TEXT,
    completedAt: { type: DataTypes.DATE, field: 'completed_at', allowNull: true },
  },
  { tableName: 'followups', underscored: true, timestamps: true }
);

module.exports = Followup;
