const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      field: 'password_hash',
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      field: 'first_name',
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      field: 'last_name',
      allowNull: false,
    },
    phone: DataTypes.STRING(20),
    role: {
      type: DataTypes.ENUM('super_admin', 'client_admin', 'doctor', 'receptionist'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'disabled'),
      defaultValue: 'active',
    },
    specialization: DataTypes.STRING(100),
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'consultation_fee',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at',
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      field: 'must_change_password',
      defaultValue: false,
    },
  },
  {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['passwordHash'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['passwordHash'] },
      },
    },
  }
);

module.exports = User;
