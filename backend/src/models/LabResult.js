const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabResult = sequelize.define(
  'LabResult',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    labOrderId: { type: DataTypes.UUID, field: 'lab_order_id', allowNull: false, unique: true },
    resultText: { type: DataTypes.TEXT, field: 'result_text', allowNull: true },
    fileUrl: { type: DataTypes.STRING(500), field: 'file_url', allowNull: true },
    recordedAt: { type: DataTypes.DATE, field: 'recorded_at', defaultValue: DataTypes.NOW },
  },
  { tableName: 'lab_results', underscored: true, timestamps: true }
);

module.exports = LabResult;
