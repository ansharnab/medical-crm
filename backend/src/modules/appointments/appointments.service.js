const appointmentRepository = require('../../repositories/appointment.repository');
const patientRepository = require('../../repositories/patient.repository');
const userRepository = require('../../repositories/user.repository');
const organizationRepository = require('../../repositories/organization.repository');
const { DEFAULT_WORKING_HOURS, DAYS } = require('../settings/workingHours.defaults');
const { writeAudit } = require('../audit/audit.service');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require('../../utils/errors');
const { validateCreateAppointment, validateUpdateAppointment } = require('./appointments.dto');

function formatAppointment(appt) {
  return {
    id: appt.id,
    patientId: appt.patientId,
    doctorId: appt.doctorId,
    scheduledAt: appt.scheduledAt,
    durationMinutes: appt.durationMinutes,
    status: appt.status,
    tokenNumber: appt.tokenNumber,
    feeAmount: appt.feeAmount ? Number(appt.feeAmount) : null,
    notes: appt.notes,
    patient: appt.patient
      ? {
          id: appt.patient.id,
          firstName: appt.patient.firstName,
          lastName: appt.patient.lastName,
          phone: appt.patient.phone,
        }
      : undefined,
    doctor: appt.doctor
      ? {
          id: appt.doctor.id,
          firstName: appt.doctor.firstName,
          lastName: appt.doctor.lastName,
          specialization: appt.doctor.specialization,
        }
      : undefined,
    payment: appt.payment
      ? {
          id: appt.payment.id,
          status: appt.payment.status,
          amount: Number(appt.payment.amount),
          amountPaid: Number(appt.payment.amountPaid),
        }
      : undefined,
    createdAt: appt.createdAt,
    updatedAt: appt.updatedAt,
  };
}

function getDoctorScope(actor) {
  return actor.role === 'doctor' ? actor.id : null;
}

class AppointmentsService {
  async list(organizationId, query, actor) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await appointmentRepository.findAllInOrganization(organizationId, {
      page,
      limit,
      date: query.date,
      doctorId: query.doctorId,
      status: query.status,
      patientId: query.patientId,
      doctorScopeId: getDoctorScope(actor),
    });
    return {
      data: rows.map(formatAppointment),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async getById(organizationId, appointmentId, actor) {
    const appt = await appointmentRepository.findByIdInOrganization(appointmentId, organizationId);
    if (!appt) throw new NotFoundError('Appointment not found');
    if (actor.role === 'doctor' && appt.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }
    return formatAppointment(appt);
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateAppointment(body);
    if (error) throw new ValidationError('Validation failed', error);

    const patient = await patientRepository.findByIdInOrganization(value.patientId, organizationId);
    if (!patient) throw new NotFoundError('Patient not found');

    const doctor = await userRepository.findByIdInOrganization(value.doctorId, organizationId);
    if (!doctor || doctor.role !== 'doctor' || doctor.status !== 'active') {
      throw new NotFoundError('Doctor not found');
    }

    const dateStr = new Date(value.scheduledAt).toISOString().slice(0, 10);
    const tokenNumber = await appointmentRepository.getNextTokenNumber(
      organizationId,
      value.doctorId,
      dateStr
    );

    const appt = await appointmentRepository.create({
      organizationId,
      patientId: value.patientId,
      doctorId: value.doctorId,
      scheduledAt: value.scheduledAt,
      durationMinutes: value.durationMinutes || 15,
      status: 'confirmed',
      tokenNumber,
      feeAmount: doctor.consultationFee,
      notes: value.notes,
      bookedBy: actor.id,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'appointment.created',
      entityType: 'appointment',
      entityId: appt.id,
      metadata: { patientId: value.patientId, doctorId: value.doctorId },
      ipAddress,
    });

    const full = await appointmentRepository.findByIdInOrganization(appt.id, organizationId);
    return formatAppointment(full);
  }

  async update(organizationId, appointmentId, body, actor, ipAddress) {
    const { error, value } = validateUpdateAppointment(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await appointmentRepository.findByIdInOrganization(appointmentId, organizationId);
    if (!existing) throw new NotFoundError('Appointment not found');
    if (actor.role === 'doctor' && existing.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    if (value.doctorId) {
      const doctor = await userRepository.findByIdInOrganization(value.doctorId, organizationId);
      if (!doctor || doctor.role !== 'doctor') throw new NotFoundError('Doctor not found');
    }

    await appointmentRepository.update(appointmentId, value);
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'appointment.updated',
      entityType: 'appointment',
      entityId: appointmentId,
      metadata: value,
      ipAddress,
    });

    const updated = await appointmentRepository.findByIdInOrganization(appointmentId, organizationId);
    return formatAppointment(updated);
  }

  async cancel(organizationId, appointmentId, actor, ipAddress) {
    const existing = await appointmentRepository.findByIdInOrganization(appointmentId, organizationId);
    if (!existing) throw new NotFoundError('Appointment not found');

    await appointmentRepository.update(appointmentId, { status: 'cancelled' });
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'appointment.cancelled',
      entityType: 'appointment',
      entityId: appointmentId,
      ipAddress,
    });

    return { message: 'Appointment cancelled successfully' };
  }

  async getAvailableSlots(organizationId, query) {
    const { doctorId, date } = query;
    if (!doctorId || !date) {
      throw new ValidationError('doctorId and date are required', [
        { field: 'doctorId', message: 'Required' },
        { field: 'date', message: 'Required' },
      ]);
    }

    const doctor = await userRepository.findByIdInOrganization(doctorId, organizationId);
    if (!doctor || doctor.role !== 'doctor') throw new NotFoundError('Doctor not found');

    const org = await organizationRepository.findById(organizationId);
    const hours = org?.workingHours || DEFAULT_WORKING_HOURS;
    const jsDay = new Date(`${date}T12:00:00`).getDay();
    const dayName = DAYS[jsDay === 0 ? 6 : jsDay - 1];
    const dayHours = hours[dayName] || DEFAULT_WORKING_HOURS.monday;

    if (dayHours.closed) {
      return { date, doctorId, slots: [], closed: true };
    }

    const [openH, openM] = dayHours.open.split(':').map(Number);
    const [closeH, closeM] = dayHours.close.split(':').map(Number);
    const slotMinutes = 30;
    const slots = [];

    let cursor = openH * 60 + openM;
    const end = closeH * 60 + closeM;

    while (cursor + slotMinutes <= end) {
      const h = Math.floor(cursor / 60);
      const m = cursor % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      cursor += slotMinutes;
    }

    const { Op } = require('sequelize');
    const start = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);
    const { rows } = await appointmentRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 200,
      doctorId,
      date,
    });

    const bookedTimes = new Set(
      rows
        .filter((a) => a.status !== 'cancelled')
        .map((a) => {
          const d = new Date(a.scheduledAt);
          return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        })
    );

    return {
      date,
      doctorId,
      closed: false,
      slots: slots.map((time) => ({ time, available: !bookedTimes.has(time) })),
    };
  }
}

module.exports = new AppointmentsService();
module.exports.formatAppointment = formatAppointment;
