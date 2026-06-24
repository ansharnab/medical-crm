const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define(
  'Invoice',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    appointmentId: { type: DataTypes.UUID, field: 'appointment_id', allowNull: true },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    gstRate: { type: DataTypes.DECIMAL(5, 2), field: 'gst_rate', defaultValue: 0 },
    gstAmount: { type: DataTypes.DECIMAL(10, 2), field: 'gst_amount', defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paidAmount: { type: DataTypes.DECIMAL(10, 2), field: 'paid_amount', defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'cancelled'),
      defaultValue: 'pending',
    },
    notes: DataTypes.TEXT,
    createdBy: { type: DataTypes.UUID, field: 'created_by', allowNull: true },
  },
  { tableName: 'invoices', underscored: true, timestamps: true }
);

module.exports = Invoice;
