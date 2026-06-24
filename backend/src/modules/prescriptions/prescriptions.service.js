const { Prescription, PrescriptionItem, Consultation, Patient, User } = require('../../models');
const consultationRepository = require('../../repositories/consultation.repository');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../utils/errors');
const { validateUpsert } = require('./prescriptions.dto');

function formatItem(item) {
  return {
    id: item.id,
    medicineName: item.medicineName,
    dose: item.dose,
    duration: item.duration,
    quantity: item.quantity,
    sortOrder: item.sortOrder,
  };
}

function formatPrescription(rx) {
  const plain = rx.get ? rx.get({ plain: true }) : rx;
  return {
    id: plain.id,
    consultationId: plain.consultationId,
    patientId: plain.patientId,
    doctorId: plain.doctorId,
    notes: plain.notes,
    items: (plain.items || []).map(formatItem),
    patient: plain.patient
      ? { id: plain.patient.id, firstName: plain.patient.firstName, lastName: plain.patient.lastName }
      : undefined,
    doctor: plain.doctor
      ? { id: plain.doctor.id, firstName: plain.doctor.firstName, lastName: plain.doctor.lastName }
      : undefined,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

const includes = [
  { model: PrescriptionItem, as: 'items', separate: true, order: [['sort_order', 'ASC']] },
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName'] },
  { model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] },
];

class PrescriptionsService {
  async getByConsultation(organizationId, consultationId, actor) {
    const consultation = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    if (!consultation) throw new NotFoundError('Consultation not found');
    if (actor.role === 'doctor' && consultation.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const rx = await Prescription.findOne({
      where: { consultationId, organizationId },
      include: includes,
    });
    if (!rx) return null;
    return formatPrescription(rx);
  }

  async getByAppointment(organizationId, appointmentId, actor) {
    const consultation = await consultationRepository.findByAppointmentId(appointmentId, organizationId);
    if (!consultation) return null;
    return this.getByConsultation(organizationId, consultation.id, actor);
  }

  async upsertByAppointment(organizationId, appointmentId, body, actor, ipAddress) {
    const consultation = await consultationRepository.findByAppointmentId(appointmentId, organizationId);
    if (!consultation) throw new NotFoundError('Consultation not found');
    return this.upsert(organizationId, consultation.id, body, actor, ipAddress);
  }

  async upsert(organizationId, consultationId, body, actor, ipAddress) {
    const { error, value } = validateUpsert(body);
    if (error) throw new ValidationError('Validation failed', error);

    const consultation = await consultationRepository.findByIdInOrganization(consultationId, organizationId);
    if (!consultation) throw new NotFoundError('Consultation not found');
    if (consultation.doctorId !== actor.id) throw new ForbiddenError('Insufficient permissions');

    let rx = await Prescription.findOne({ where: { consultationId, organizationId } });
    if (!rx) {
      rx = await Prescription.create({
        organizationId,
        consultationId,
        patientId: consultation.patientId,
        doctorId: actor.id,
        notes: value.notes,
      });
    } else {
      await rx.update({ notes: value.notes });
      await PrescriptionItem.destroy({ where: { prescriptionId: rx.id } });
    }

    await PrescriptionItem.bulkCreate(
      value.items.map((item, idx) => ({
        prescriptionId: rx.id,
        medicineName: item.medicineName,
        dose: item.dose,
        duration: item.duration,
        quantity: item.quantity,
        sortOrder: item.sortOrder ?? idx,
      }))
    );

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'prescription.saved',
      entityType: 'prescription',
      entityId: rx.id,
      ipAddress,
    });

    const full = await Prescription.findByPk(rx.id, { include: includes });
    return formatPrescription(full);
  }
}

module.exports = new PrescriptionsService();
