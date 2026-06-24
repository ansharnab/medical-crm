const { Op } = require('sequelize');
const { Patient } = require('../models');

class PatientRepository {
  async findAllInOrganization(organizationId, { page = 1, limit = 20, search }) {
    const where = { organizationId };
    if (search) {
      where[Op.or] = [
        { phone: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const offset = (page - 1) * limit;
    return Patient.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findByIdInOrganization(id, organizationId) {
    return Patient.findOne({ where: { id, organizationId } });
  }

  async findByPhoneInOrganization(phone, organizationId, excludeId = null) {
    const where = { phone, organizationId };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return Patient.findOne({ where });
  }

  async create(data) {
    return Patient.create(data);
  }

  async update(id, data) {
    const patient = await Patient.findByPk(id);
    if (!patient) return null;
    await patient.update(data);
    return patient;
  }

  async countInOrganization(organizationId) {
    return Patient.count({ where: { organizationId } });
  }
}

module.exports = new PatientRepository();
