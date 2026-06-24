const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageLog = sequelize.define(
  'MessageLog',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    patientId: { type: DataTypes.UUID, field: 'patient_id', allowNull: true },
    channel: { type: DataTypes.ENUM('sms', 'email', 'whatsapp'), allowNull: false },
    recipient: { type: DataTypes.STRING(255), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('queued', 'sent', 'failed', 'dev_logged'),
      defaultValue: 'queued',
    },
  },
  { tableName: 'message_logs', underscored: true, timestamps: true, updatedAt: false }
);

module.exports = MessageLog;
