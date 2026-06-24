const organizationRepository = require('../../repositories/organization.repository');
const userRepository = require('../../repositories/user.repository');
const { writeAudit } = require('../audit/audit.service');
const {
  validateUpdateClinic,
  validateWorkingHours,
  validateUpdateDoctorFee,
} = require('./settings.dto');
const { DEFAULT_WORKING_HOURS } = require('./workingHours.defaults');
const { ValidationError, NotFoundError } = require('../../utils/errors');

function formatClinic(org) {
  return {
    id: org.id,
    name: org.name,
    email: org.email,
    phone: org.phone,
    addressLine1: org.addressLine1,
    addressLine2: org.addressLine2,
    city: org.city,
    state: org.state,
    pincode: org.pincode,
    timezone: org.timezone,
    status: org.status,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

class SettingsService {
  async getClinic(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    return formatClinic(org);
  }

  async updateClinic(organizationId, body, actor, ipAddress) {
    const { error, value } = validateUpdateClinic(body);
    if (error) throw new ValidationError('Validation failed', error);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    await organizationRepository.update(organizationId, value);
    const updated = await organizationRepository.findById(organizationId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'settings.clinic_updated',
      entityType: 'organization',
      entityId: organizationId,
      metadata: value,
      ipAddress,
    });

    return formatClinic(updated);
  }

  async getWorkingHours(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    return org.workingHours || DEFAULT_WORKING_HOURS;
  }

  async updateWorkingHours(organizationId, body, actor, ipAddress) {
    const { error, value } = validateWorkingHours(body);
    if (error) throw new ValidationError('Validation failed', error);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    await organizationRepository.update(organizationId, { workingHours: value });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'settings.working_hours_updated',
      entityType: 'organization',
      entityId: organizationId,
      metadata: value,
      ipAddress,
    });

    return value;
  }

  async getDoctorFees(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const { rows } = await userRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 100,
      role: 'doctor',
    });

    return rows.map((doctor) => ({
      doctorId: doctor.id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee ? Number(doctor.consultationFee) : null,
      status: doctor.status,
    }));
  }

  async updateDoctorFee(organizationId, doctorId, body, actor, ipAddress) {
    const { error, value } = validateUpdateDoctorFee(body);
    if (error) throw new ValidationError('Validation failed', error);

    const doctor = await userRepository.findByIdInOrganization(doctorId, organizationId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new NotFoundError('Doctor not found');
    }

    await userRepository.update(doctorId, { consultationFee: value.consultationFee });
    const updated = await userRepository.findByIdInOrganization(doctorId, organizationId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'settings.doctor_fee_updated',
      entityType: 'user',
      entityId: doctorId,
      metadata: { consultationFee: value.consultationFee },
      ipAddress,
    });

    return {
      doctorId: updated.id,
      name: `${updated.firstName} ${updated.lastName}`,
      consultationFee: Number(updated.consultationFee),
    };
  }
}

module.exports = new SettingsService();
