const { Op } = require('sequelize');
const { Followup, Patient, User } = require('../models');

const includes = [
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'phone'] },
  { model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] },
];

class FollowupRepository {
  async findAllInOrganization(organizationId, filters = {}) {
    const { page = 1, limit = 20, status, dueDate, filter, doctorScopeId } = filters;
    const where = { organizationId };
    if (status) where.status = status;
    if (doctorScopeId) where.doctorId = doctorScopeId;
    if (dueDate) where.dueDate = dueDate;
    if (filter === 'today') {
      where.dueDate = new Date().toISOString().slice(0, 10);
      where.status = 'pending';
    }
    if (filter === 'pending') where.status = 'pending';

    const offset = (page - 1) * limit;
    return Followup.findAndCountAll({
      where,
      include: includes,
      order: [['dueDate', 'ASC']],
      limit,
      offset,
    });
  }

  async findByIdInOrganization(id, organizationId) {
    return Followup.findOne({ where: { id, organizationId }, include: includes });
  }

  async create(data) {
    return Followup.create(data);
  }

  async update(id, data) {
    const record = await Followup.findByPk(id);
    if (!record) return null;
    await record.update(data);
    return record;
  }

  async countPending(organizationId, doctorId = null) {
    const where = { organizationId, status: 'pending' };
    if (doctorId) where.doctorId = doctorId;
    return Followup.count({ where });
  }
}

module.exports = new FollowupRepository();
