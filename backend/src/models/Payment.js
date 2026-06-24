const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    appointmentId: { type: DataTypes.UUID, field: 'appointment_id', allowNull: false },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amountPaid: { type: DataTypes.DECIMAL(10, 2), field: 'amount_paid', allowNull: false, defaultValue: 0 },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'upi', 'card', 'other'),
      field: 'payment_mode',
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'partial', 'waived'),
      allowNull: false,
      defaultValue: 'pending',
    },
    collectedBy: { type: DataTypes.UUID, field: 'collected_by', allowNull: true },
    paidAt: { type: DataTypes.DATE, field: 'paid_at', allowNull: true },
    notes: DataTypes.TEXT,
  },
  { tableName: 'payments', underscored: true, timestamps: true }
);

module.exports = Payment;
