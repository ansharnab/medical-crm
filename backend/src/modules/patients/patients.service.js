const { QueryTypes } = require('sequelize');
const patientRepository = require('../../repositories/patient.repository');
const consultationRepository = require('../../repositories/consultation.repository');
const { writeAudit } = require('../audit/audit.service');
const { getRedis } = require('../../config/redis');
const { sequelize } = require('../../models');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../utils/errors');
const { validateCreatePatient, validateUpdatePatient } = require('./patients.dto');

const SNAPSHOT_TTL = 300;

function formatPatient(patient) {
  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    address: patient.address,
    bloodGroup: patient.bloodGroup,
    emergencyContact: patient.emergencyContact,
    notes: patient.notes,
    organizationId: patient.organizationId,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

class PatientsService {
  async list(organizationId, query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await patientRepository.findAllInOrganization(organizationId, {
      page,
      limit,
      search: query.search,
    });
    return {
      data: rows.map(formatPatient),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async getById(organizationId, patientId) {
    const patient = await patientRepository.findByIdInOrganization(patientId, organizationId);
    if (!patient) throw new NotFoundError('Patient not found');
    return formatPatient(patient);
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreatePatient(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await patientRepository.findByPhoneInOrganization(value.phone, organizationId);
    if (existing) throw new ConflictError('A patient with this phone number already exists in this clinic');

    const patient = await patientRepository.create({
      ...value,
      organizationId,
      createdBy: actor.id,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'patient.created',
      entityType: 'patient',
      entityId: patient.id,
      metadata: { phone: patient.phone },
      ipAddress,
    });

    return formatPatient(patient);
  }

  async update(organizationId, patientId, body, actor, ipAddress) {
    const { error, value } = validateUpdatePatient(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await patientRepository.findByIdInOrganization(patientId, organizationId);
    if (!existing) throw new NotFoundError('Patient not found');

    if (value.phone && value.phone !== existing.phone) {
      const dup = await patientRepository.findByPhoneInOrganization(value.phone, organizationId, patientId);
      if (dup) throw new ConflictError('A patient with this phone number already exists in this clinic');
    }

    await patientRepository.update(patientId, value);
    await this.invalidateSnapshot(organizationId, patientId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'patient.updated',
      entityType: 'patient',
      entityId: patientId,
      metadata: value,
      ipAddress,
    });

    const updated = await patientRepository.findByIdInOrganization(patientId, organizationId);
    return formatPatient(updated);
  }

  async getSnapshot(organizationId, patientId) {
    const patient = await patientRepository.findByIdInOrganization(patientId, organizationId);
    if (!patient) throw new NotFoundError('Patient not found');

    const cacheKey = `snapshot:${organizationId}:${patientId}`;
    try {
      const redis = getRedis();
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis optional in dev
    }

    const rows = await sequelize.query(
      `SELECT * FROM patient_snapshots WHERE patient_id = :patientId AND organization_id = :organizationId`,
      { replacements: { patientId, organizationId }, type: QueryTypes.SELECT }
    );
    const snapshot = rows[0] || {};

    const recent = await consultationRepository.findRecentByPatient(organizationId, patientId, 3);
    const result = {
      patientId,
      totalVisits: parseInt(snapshot.total_visits, 10) || 0,
      lastVisitDate: snapshot.last_visit_date || null,
      lastDoctorName: snapshot.last_doctor_name || null,
      lastDiagnosis: snapshot.last_diagnosis || null,
      pendingFollowupsCount: parseInt(snapshot.pending_followups_count, 10) || 0,
      recentConsultations: recent.map((c) => ({
        id: c.id,
        completedAt: c.completedAt,
        doctorName: c.doctor ? `Dr. ${c.doctor.lastName}` : null,
        diagnosis: c.diagnosis,
        notes: c.notes,
      })),
    };

    try {
      const redis = getRedis();
      await redis.setex(cacheKey, SNAPSHOT_TTL, JSON.stringify(result));
    } catch {
      // ignore
    }

    return result;
  }

  async invalidateSnapshot(organizationId, patientId) {
    try {
      const redis = getRedis();
      await redis.del(`snapshot:${organizationId}:${patientId}`);
    } catch {
      // ignore
    }
  }
}

module.exports = new PatientsService();
