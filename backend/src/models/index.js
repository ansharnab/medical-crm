const sequelize = require('../config/database');
const Organization = require('./Organization');
const User = require('./User');
const AuditLog = require('./AuditLog');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Consultation = require('./Consultation');
const Payment = require('./Payment');
const Followup = require('./Followup');
const PlatformSettings = require('./PlatformSettings');
const Prescription = require('./Prescription');
const PrescriptionItem = require('./PrescriptionItem');
const Invoice = require('./Invoice');
const InvoicePayment = require('./InvoicePayment');
const MessageTemplate = require('./MessageTemplate');
const MessageLog = require('./MessageLog');
const PharmacyItem = require('./PharmacyItem');
const LabOrder = require('./LabOrder');
const LabResult = require('./LabResult');

Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Organization.hasMany(Patient, { foreignKey: 'organizationId', as: 'patients' });
Patient.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Patient.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Organization.hasMany(Appointment, { foreignKey: 'organizationId', as: 'appointments' });
Appointment.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(User, { foreignKey: 'bookedBy', as: 'bookedByUser' });
Appointment.hasOne(Payment, { foreignKey: 'appointmentId', as: 'payment' });

Organization.hasMany(Consultation, { foreignKey: 'organizationId', as: 'consultations' });
Consultation.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Consultation.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Consultation.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Consultation.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

Organization.hasMany(Payment, { foreignKey: 'organizationId', as: 'payments' });
Payment.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Payment.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Payment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Payment.belongsTo(User, { foreignKey: 'collectedBy', as: 'collector' });

Organization.hasMany(Followup, { foreignKey: 'organizationId', as: 'followups' });
Followup.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Followup.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Followup.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });
Followup.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

Consultation.hasOne(Prescription, { foreignKey: 'consultationId', as: 'prescription' });
Prescription.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId', as: 'items' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });

Organization.hasMany(Invoice, { foreignKey: 'organizationId', as: 'invoices' });
Invoice.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Invoice.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Invoice.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
Invoice.hasMany(InvoicePayment, { foreignKey: 'invoiceId', as: 'payments' });
InvoicePayment.belongsTo(Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

Organization.hasMany(MessageTemplate, { foreignKey: 'organizationId', as: 'messageTemplates' });
Organization.hasMany(MessageLog, { foreignKey: 'organizationId', as: 'messageLogs' });
MessageLog.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Organization.hasMany(PharmacyItem, { foreignKey: 'organizationId', as: 'pharmacyItems' });

Organization.hasMany(LabOrder, { foreignKey: 'organizationId', as: 'labOrders' });
LabOrder.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
LabOrder.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
LabOrder.belongsTo(Consultation, { foreignKey: 'consultationId', as: 'consultation' });
LabOrder.hasOne(LabResult, { foreignKey: 'labOrderId', as: 'result' });
LabResult.belongsTo(LabOrder, { foreignKey: 'labOrderId', as: 'labOrder' });

module.exports = {
  sequelize,
  Organization,
  User,
  AuditLog,
  Patient,
  Appointment,
  Consultation,
  Payment,
  Followup,
  PlatformSettings,
  Prescription,
  PrescriptionItem,
  Invoice,
  InvoicePayment,
  MessageTemplate,
  MessageLog,
  PharmacyItem,
  LabOrder,
  LabResult,
};
