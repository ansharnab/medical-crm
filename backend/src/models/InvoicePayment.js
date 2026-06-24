const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoicePayment = sequelize.define(
  'InvoicePayment',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    invoiceId: { type: DataTypes.UUID, field: 'invoice_id', allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'upi', 'card', 'other'),
      field: 'payment_mode',
      defaultValue: 'cash',
    },
    collectedBy: { type: DataTypes.UUID, field: 'collected_by', allowNull: true },
  },
  { tableName: 'invoice_payments', underscored: true, timestamps: true, updatedAt: false }
);

module.exports = InvoicePayment;
