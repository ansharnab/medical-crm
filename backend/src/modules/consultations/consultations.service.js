const consultationRepository = require('../../repositories/consultation.repository');
const appointmentRepository = require('../../repositories/appointment.repository');
const patientsService = require('../patients/patients.service');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../utils/errors');
const { validateStart, validateUpdate } = require('./consultations.dto');

function formatConsultation(c) {
  return {
    id: c.id,
    appointmentId: c.appointmentId,
    patientId: c.patientId,
    doctorId: c.doctorId,
    symptoms: c.symptoms,
    diagnosis: c.diagnosis,
    notes: c.notes,
    recommendations: c.recommendations,
    bpSystolic: c.bpSystolic,
    bpDiastolic: c.bpDiastolic,
    spo2: c.spo2,
    weightKg: c.weightKg != null ? Number(c.weightKg) : null,
    temperatureC: c.temperatureC != null ? Number(c.temperatureC) : null,
    startedAt: c.startedAt,
    completedAt: c.completedAt,
    doctor: c.doctor
      ? { id: c.doctor.id, name: `${c.doctor.firstName} ${c.doctor.lastName}` }
      : undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

class ConsultationsService {
  async start(organizationId, body, actor, ipAddress) {
    const { error, value } = validateStart(body);
    if (error) throw new ValidationError('Validation failed', error);

    const appt = await appointmentRepository.findByIdInOrganization(value.appointmentId, organizationId);
    if (!appt) throw new NotFoundError('Appointment not found');
    if (appt.doctorId !== actor.id) throw new ForbiddenError('Insufficient permissions');

    let consultation = await consultationRepository.findByAppointmentId(value.appointmentId, organizationId);
    if (!consultation) {
      consultation = await consultationRepository.create({
        organizationId,
        appointmentId: value.appointmentId,
        patientId: appt.patientId,
        doctorId: actor.id,
        startedAt: new Date(),
      });
    }

    await appointmentRepository.update(value.appointmentId, { status: 'in_consultation' });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'consultation.started',
      entityType: 'consultation',
      entityId: consultation.id,
      ipAddress,
    });

    const full = await consultationRepository.findByIdInOrganization(consultation.id, organizationId);
    return formatConsultation(full);
  }

  async update(organizationId, consultationId, body, actor, ipAddress) {
    const { error, value } = validateUpdate(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    if (!existing) throw new NotFoundError('Consultation not found');
    if (existing.doctorId !== actor.id) throw new ForbiddenError('Insufficient permissions');

    await consultationRepository.update(consultationId, value);
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'consultation.updated',
      entityType: 'consultation',
      entityId: consultationId,
      metadata: value,
      ipAddress,
    });

    const updated = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    return formatConsultation(updated);
  }

  async complete(organizationId, consultationId, actor, ipAddress) {
    const existing = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    if (!existing) throw new NotFoundError('Consultation not found');
    if (existing.doctorId !== actor.id) throw new ForbiddenError('Insufficient permissions');

    const completedAt = new Date();
    await consultationRepository.update(consultationId, { completedAt });
    await appointmentRepository.update(existing.appointmentId, { status: 'completed' });
    await patientsService.invalidateSnapshot(organizationId, existing.patientId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'consultation.completed',
      entityType: 'consultation',
      entityId: consultationId,
      ipAddress,
    });

    const updated = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    return formatConsultation(updated);
  }

  async getPatientHistory(organizationId, patientId, query, actor) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await consultationRepository.findByPatient(organizationId, patientId, {
      page,
      limit,
    });
    if (actor.role === 'doctor') {
      // doctors can view any patient history in their clinic per RBAC
    }
    return {
      data: rows.map(formatConsultation),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }
}

module.exports = new ConsultationsService();
