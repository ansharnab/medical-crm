const { Op } = require('sequelize');
const { Consultation, User } = require('../models');

class ConsultationRepository {
  async findByIdInOrganization(id, organizationId) {
    return Consultation.findOne({
      where: { id, organizationId },
      include: [{ model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] }],
    });
  }

  async findByAppointmentId(appointmentId, organizationId) {
    return Consultation.findOne({ where: { appointmentId, organizationId } });
  }

  async findByPatient(organizationId, patientId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    return Consultation.findAndCountAll({
      where: { organizationId, patientId },
      include: [{ model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['completedAt', 'DESC NULLS LAST'], ['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findRecentByPatient(organizationId, patientId, limit = 3) {
    return Consultation.findAll({
      where: { organizationId, patientId, completedAt: { [Op.ne]: null } },
      include: [{ model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] }],
      order: [['completedAt', 'DESC']],
      limit,
    });
  }

  async create(data) {
    return Consultation.create(data);
  }

  async update(id, data) {
    const record = await Consultation.findByPk(id);
    if (!record) return null;
    await record.update(data);
    return record;
  }
}

module.exports = new ConsultationRepository();
