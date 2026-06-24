const appointmentRepository = require('../../repositories/appointment.repository');
const userRepository = require('../../repositories/user.repository');
const consultationRepository = require('../../repositories/consultation.repository');
const { writeAudit } = require('../audit/audit.service');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../utils/errors');

class QueueService {
  async getQueue(organizationId, query, actor) {
    const date = query.date || new Date().toISOString().slice(0, 10);
    let doctorId = query.doctorId || null;
    if (actor.role === 'doctor') doctorId = actor.id;

    const appointments = await appointmentRepository.findQueueForOrganization(organizationId, {
      doctorId,
      date,
    });

    const byDoctor = {};
    for (const appt of appointments) {
      const id = appt.doctorId;
      if (!byDoctor[id]) {
        byDoctor[id] = {
          doctorId: id,
          doctorName: appt.doctor ? `Dr. ${appt.doctor.lastName}` : 'Doctor',
          waiting: [],
          inConsultation: null,
        };
      }
      const entry = {
        appointmentId: appt.id,
        tokenNumber: appt.tokenNumber,
        patientName: appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName}` : '',
        waitingSince: appt.scheduledAt,
        status: appt.status,
      };
      if (appt.status === 'in_consultation') {
        byDoctor[id].inConsultation = entry;
      } else {
        byDoctor[id].waiting.push(entry);
      }
    }

    return { date, doctors: Object.values(byDoctor) };
  }

  async callNext(organizationId, appointmentId, actor, ipAddress) {
    const appt = await appointmentRepository.findByIdInOrganization(appointmentId, organizationId);
    if (!appt) throw new NotFoundError('Appointment not found');
    if (actor.role === 'doctor' && appt.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const inConsult = await appointmentRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 1,
      doctorId: appt.doctorId,
      status: 'in_consultation',
      date: new Date(appt.scheduledAt).toISOString().slice(0, 10),
    });
    if (inConsult.rows.some((r) => r.id !== appointmentId && r.status === 'in_consultation')) {
      throw new ConflictError('Another patient is already in consultation');
    }

    await appointmentRepository.update(appointmentId, { status: 'in_consultation' });

    let consultation = await consultationRepository.findByAppointmentId(appointmentId, organizationId);
    if (!consultation) {
      consultation = await consultationRepository.create({
        organizationId,
        appointmentId,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        startedAt: new Date(),
      });
    }

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'queue.call_next',
      entityType: 'appointment',
      entityId: appointmentId,
      ipAddress,
    });

    return {
      appointmentId,
      consultationId: consultation.id,
      status: 'in_consultation',
    };
  }
}

module.exports = new QueueService();
