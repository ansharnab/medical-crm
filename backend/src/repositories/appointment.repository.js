const { Op } = require('sequelize');
const { Appointment, Patient, User, Payment } = require('../models');

const defaultIncludes = [
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'phone'] },
  {
    model: User,
    as: 'doctor',
    attributes: ['id', 'firstName', 'lastName', 'specialization', 'consultationFee'],
  },
];

class AppointmentRepository {
  async findAllInOrganization(organizationId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      date,
      doctorId,
      status,
      patientId,
      doctorScopeId,
    } = filters;

    const where = { organizationId };
    if (doctorId) where.doctorId = doctorId;
    if (doctorScopeId) where.doctorId = doctorScopeId;
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.scheduledAt = { [Op.between]: [start, end] };
    }

    const offset = (page - 1) * limit;
    return Appointment.findAndCountAll({
      where,
      include: defaultIncludes,
      order: [['scheduledAt', 'ASC']],
      limit,
      offset,
    });
  }

  async findByIdInOrganization(id, organizationId) {
    return Appointment.findOne({
      where: { id, organizationId },
      include: [...defaultIncludes, { model: Payment, as: 'payment', required: false }],
    });
  }

  async getNextTokenNumber(organizationId, doctorId, date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const maxToken = await Appointment.max('tokenNumber', {
      where: {
        organizationId,
        doctorId,
        scheduledAt: { [Op.between]: [start, end] },
        status: { [Op.notIn]: ['cancelled'] },
      },
    });
    return (maxToken || 0) + 1;
  }

  async create(data) {
    return Appointment.create(data);
  }

  async update(id, data) {
    const appt = await Appointment.findByPk(id);
    if (!appt) return null;
    await appt.update(data);
    return appt;
  }

  async findQueueForOrganization(organizationId, { doctorId, date }) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const where = {
      organizationId,
      scheduledAt: { [Op.between]: [start, end] },
      status: { [Op.in]: ['confirmed', 'waiting', 'in_consultation'] },
    };
    if (doctorId) where.doctorId = doctorId;

    return Appointment.findAll({
      where,
      include: defaultIncludes,
      order: [
        ['doctorId', 'ASC'],
        ['tokenNumber', 'ASC'],
        ['scheduledAt', 'ASC'],
      ],
    });
  }

  async countByStatus(organizationId, filters = {}) {
    const where = { organizationId, ...filters };
    return Appointment.count({ where });
  }
}

module.exports = new AppointmentRepository();
