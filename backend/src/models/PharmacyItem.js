const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PharmacyItem = sequelize.define(
  'PharmacyItem',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    sku: DataTypes.STRING(80),
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    unit: { type: DataTypes.STRING(30), defaultValue: 'units' },
    reorderLevel: { type: DataTypes.INTEGER, field: 'reorder_level', defaultValue: 10 },
    price: DataTypes.DECIMAL(10, 2),
  },
  { tableName: 'pharmacy_items', underscored: true, timestamps: true }
);

module.exports = PharmacyItem;
