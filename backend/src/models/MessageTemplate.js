const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageTemplate = sequelize.define(
  'MessageTemplate',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    channel: { type: DataTypes.ENUM('sms', 'email', 'whatsapp'), defaultValue: 'sms' },
    body: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: 'message_templates', underscored: true, timestamps: true }
);

module.exports = MessageTemplate;
