const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrescriptionItem = sequelize.define(
  'PrescriptionItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    prescriptionId: { type: DataTypes.UUID, field: 'prescription_id', allowNull: false },
    medicineName: { type: DataTypes.STRING(255), field: 'medicine_name', allowNull: false },
    dose: DataTypes.STRING(100),
    duration: DataTypes.STRING(100),
    quantity: DataTypes.INTEGER,
    sortOrder: { type: DataTypes.INTEGER, field: 'sort_order', defaultValue: 0 },
  },
  { tableName: 'prescription_items', underscored: true, timestamps: true }
);

module.exports = PrescriptionItem;
