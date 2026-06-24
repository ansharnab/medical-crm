const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      field: 'organization_id',
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING(50),
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id',
    },
    metadata: DataTypes.JSONB,
    ipAddress: {
      type: DataTypes.INET,
      field: 'ip_address',
    },
  },
  {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = AuditLog;
