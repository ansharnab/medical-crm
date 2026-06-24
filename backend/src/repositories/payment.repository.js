const { Op } = require('sequelize');
const { Payment, Patient, Appointment, User } = require('../models');

const includes = [
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'phone'] },
  { model: Appointment, as: 'appointment', attributes: ['id', 'scheduledAt', 'status'] },
  { model: User, as: 'collector', attributes: ['id', 'firstName', 'lastName'], required: false },
];

class PaymentRepository {
  async findAllInOrganization(organizationId, { page = 1, limit = 20, date, status, patientId }) {
    const where = { organizationId };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.createdAt = { [Op.between]: [start, end] };
    }
    const offset = (page - 1) * limit;
    return Payment.findAndCountAll({
      where,
      include: includes,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findByIdInOrganization(id, organizationId) {
    return Payment.findOne({ where: { id, organizationId }, include: includes });
  }

  async findByAppointmentId(appointmentId, organizationId) {
    return Payment.findOne({ where: { appointmentId, organizationId } });
  }

  async create(data) {
    return Payment.create(data);
  }

  async update(id, data) {
    const payment = await Payment.findByPk(id);
    if (!payment) return null;
    await payment.update(data);
    return payment;
  }

  async sumPaidInRange(organizationId, start, end) {
    const result = await Payment.sum('amountPaid', {
      where: {
        organizationId,
        createdAt: { [Op.between]: [start, end] },
        status: { [Op.in]: ['paid', 'partial'] },
      },
    });
    return Number(result || 0);
  }
}

module.exports = new PaymentRepository();
