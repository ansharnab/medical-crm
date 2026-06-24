const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define(
  'Organization',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: DataTypes.STRING(20),
    addressLine1: {
      type: DataTypes.STRING(255),
      field: 'address_line1',
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      field: 'address_line2',
    },
    city: DataTypes.STRING(100),
    state: DataTypes.STRING(100),
    pincode: DataTypes.STRING(10),
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata',
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'pending'),
      defaultValue: 'pending',
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: 'email_verified_at',
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      field: 'email_verification_token',
    },
    emailVerificationExpiresAt: {
      type: DataTypes.DATE,
      field: 'email_verification_expires_at',
    },
    workingHours: {
      type: DataTypes.JSONB,
      field: 'working_hours',
    },
    settings: DataTypes.JSONB,
    subscriptionPlan: {
      type: DataTypes.STRING(50),
      field: 'subscription_plan',
      defaultValue: 'starter',
    },
    subscriptionStatus: {
      type: DataTypes.STRING(50),
      field: 'subscription_status',
      defaultValue: 'trial',
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      field: 'trial_ends_at',
    },
  },
  {
    tableName: 'organizations',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Organization;
