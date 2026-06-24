const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define(
  'Patient',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    organizationId: { type: DataTypes.UUID, field: 'organization_id', allowNull: false },
    firstName: { type: DataTypes.STRING(100), field: 'first_name', allowNull: false },
    lastName: { type: DataTypes.STRING(100), field: 'last_name', allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    email: DataTypes.STRING(255),
    dateOfBirth: { type: DataTypes.DATEONLY, field: 'date_of_birth' },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
    },
    address: DataTypes.TEXT,
    bloodGroup: { type: DataTypes.STRING(5), field: 'blood_group' },
    emergencyContact: { type: DataTypes.STRING(20), field: 'emergency_contact' },
    notes: DataTypes.TEXT,
    createdBy: { type: DataTypes.UUID, field: 'created_by', allowNull: true },
  },
  { tableName: 'patients', underscored: true, timestamps: true }
);

module.exports = Patient;
