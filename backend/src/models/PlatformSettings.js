const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlatformSettings = sequelize.define(
  'PlatformSettings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    productName: {
      type: DataTypes.STRING(255),
      field: 'product_name',
      defaultValue: 'Doctor CRM',
    },
    platformOwner: {
      type: DataTypes.STRING(255),
      field: 'platform_owner',
      defaultValue: 'MaatriDev Technologies',
    },
    supportEmail: {
      type: DataTypes.STRING(255),
      field: 'support_email',
      defaultValue: 'support@doctorcrm.com',
    },
    defaultTimezone: {
      type: DataTypes.STRING(50),
      field: 'default_timezone',
      defaultValue: 'Asia/Kolkata',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR',
    },
    maintenanceMode: {
      type: DataTypes.BOOLEAN,
      field: 'maintenance_mode',
      defaultValue: false,
    },
  },
  {
    tableName: 'platform_settings',
    underscored: true,
    timestamps: true,
  }
);

module.exports = PlatformSettings;
