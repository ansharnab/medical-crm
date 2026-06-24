const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    doctorId: { type: DataTypes.UUID, field: 'doctor_id', allowNull: false },
    scheduledAt: { type: DataTypes.DATE, field: 'scheduled_at', allowNull: false },
    durationMinutes: {
      type: DataTypes.INTEGER,
      field: 'duration_minutes',
      allowNull: false,
      defaultValue: 15,
    },
    status: {
      type: DataTypes.ENUM(
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
    tokenNumber: { type: DataTypes.INTEGER, field: 'token_number', allowNull: true },
    feeAmount: { type: DataTypes.DECIMAL(10, 2), field: 'fee_amount', allowNull: true },
    notes: DataTypes.TEXT,
    bookedBy: { type: DataTypes.UUID, field: 'booked_by', allowNull: true },
  },
  { tableName: 'appointments', underscored: true, timestamps: true }
);

module.exports = Appointment;
