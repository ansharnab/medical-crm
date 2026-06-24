const followupRepository = require('../../repositories/followup.repository');
const consultationRepository = require('../../repositories/consultation.repository');
const patientsService = require('../patients/patients.service');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../utils/errors');
const { validateCreateFollowup, validateUpdateFollowup } = require('./followups.dto');

function formatFollowup(f) {
  return {
    id: f.id,
    patientId: f.patientId,
    consultationId: f.consultationId,
    doctorId: f.doctorId,
    dueDate: f.dueDate,
    status: f.status,
    notes: f.notes,
    completedAt: f.completedAt,
    patient: f.patient
      ? {
          id: f.patient.id,
          firstName: f.patient.firstName,
          lastName: f.patient.lastName,
          phone: f.patient.phone,
        }
      : undefined,
    doctor: f.doctor
      ? { id: f.doctor.id, firstName: f.doctor.firstName, lastName: f.doctor.lastName }
      : undefined,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

function getDoctorScope(actor) {
  return actor.role === 'doctor' ? actor.id : null;
}

class FollowupsService {
  async list(organizationId, query, actor) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await followupRepository.findAllInOrganization(organizationId, {
      page,
      limit,
      status: query.status,
      dueDate: query.dueDate,
      filter: query.filter,
      doctorScopeId: getDoctorScope(actor),
    });
    return {
      data: rows.map(formatFollowup),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateFollowup(body);
    if (error) throw new ValidationError('Validation failed', error);

    const consultation = await consultationRepository.findByIdInOrganization(
      value.consultationId,
      organizationId
    );
    if (!consultation) throw new NotFoundError('Consultation not found');
    if (consultation.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const followup = await followupRepository.create({
      organizationId,
      patientId: consultation.patientId,
      consultationId: value.consultationId,
      doctorId: actor.id,
      dueDate: value.dueDate,
      notes: value.notes,
      status: 'pending',
    });

    await patientsService.invalidateSnapshot(organizationId, consultation.patientId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'followup.created',
      entityType: 'followup',
      entityId: followup.id,
      metadata: { consultationId: value.consultationId, dueDate: value.dueDate },
      ipAddress,
    });

    const full = await followupRepository.findByIdInOrganization(followup.id, organizationId);
    return formatFollowup(full);
  }

  async update(organizationId, followupId, body, actor, ipAddress) {
    const { error, value } = validateUpdateFollowup(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await followupRepository.findByIdInOrganization(followupId, organizationId);
    if (!existing) throw new NotFoundError('Follow-up not found');

    if (actor.role === 'doctor' && existing.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const updates = { ...value };
    if (value.status === 'completed' && existing.status !== 'completed') {
      updates.completedAt = new Date();
    }

    await followupRepository.update(followupId, updates);
    await patientsService.invalidateSnapshot(organizationId, existing.patientId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'followup.updated',
      entityType: 'followup',
      entityId: followupId,
      metadata: value,
      ipAddress,
    });

    const updated = await followupRepository.findByIdInOrganization(followupId, organizationId);
    return formatFollowup(updated);
  }
}

module.exports = new FollowupsService();
