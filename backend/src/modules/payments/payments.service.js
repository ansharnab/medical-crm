const paymentRepository = require('../../repositories/payment.repository');
const appointmentRepository = require('../../repositories/appointment.repository');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError, ConflictError } = require('../../utils/errors');
const { validateCreatePayment, validateUpdatePayment, deriveStatus } = require('./payments.dto');

function formatPayment(payment) {
  return {
    id: payment.id,
    appointmentId: payment.appointmentId,
    patientId: payment.patientId,
    amount: Number(payment.amount),
    amountPaid: Number(payment.amountPaid),
    paymentMode: payment.paymentMode,
    status: payment.status,
    paidAt: payment.paidAt,
    notes: payment.notes,
    patient: payment.patient
      ? { id: payment.patient.id, firstName: payment.patient.firstName, lastName: payment.patient.lastName, phone: payment.patient.phone }
      : undefined,
    appointment: payment.appointment
      ? { id: payment.appointment.id, scheduledAt: payment.appointment.scheduledAt, status: payment.appointment.status }
      : undefined,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

class PaymentsService {
  async list(organizationId, query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await paymentRepository.findAllInOrganization(organizationId, {
      page,
      limit,
      date: query.date,
      status: query.status,
      patientId: query.patientId,
    });
    return {
      data: rows.map(formatPayment),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreatePayment(body);
    if (error) throw new ValidationError('Validation failed', error);

    const appt = await appointmentRepository.findByIdInOrganization(value.appointmentId, organizationId);
    if (!appt) throw new NotFoundError('Appointment not found');

    const existing = await paymentRepository.findByAppointmentId(value.appointmentId, organizationId);
    if (existing) throw new ConflictError('Payment already exists for this appointment');

    const status = deriveStatus(value.amount, value.amountPaid, value.status);
    const payment = await paymentRepository.create({
      organizationId,
      appointmentId: value.appointmentId,
      patientId: appt.patientId,
      amount: value.amount,
      amountPaid: value.amountPaid,
      paymentMode: value.paymentMode,
      status,
      collectedBy: actor.id,
      paidAt: status === 'paid' || status === 'partial' ? new Date() : null,
      notes: value.notes,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'payment.created',
      entityType: 'payment',
      entityId: payment.id,
      metadata: { appointmentId: value.appointmentId, status },
      ipAddress,
    });

    const full = await paymentRepository.findByIdInOrganization(payment.id, organizationId);
    return formatPayment(full);
  }

  async update(organizationId, paymentId, body, actor, ipAddress) {
    const { error, value } = validateUpdatePayment(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await paymentRepository.findByIdInOrganization(paymentId, organizationId);
    if (!existing) throw new NotFoundError('Payment not found');

    const amountPaid = value.amountPaid != null ? value.amountPaid : Number(existing.amountPaid);
    const amount = Number(existing.amount);
    const status = deriveStatus(amount, amountPaid, value.status || existing.status);

    await paymentRepository.update(paymentId, {
      ...value,
      amountPaid,
      status,
      paidAt: status === 'paid' || status === 'partial' ? new Date() : existing.paidAt,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'payment.updated',
      entityType: 'payment',
      entityId: paymentId,
      metadata: value,
      ipAddress,
    });

    const updated = await paymentRepository.findByIdInOrganization(paymentId, organizationId);
    return formatPayment(updated);
  }
}

module.exports = new PaymentsService();
