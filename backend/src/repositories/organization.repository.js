const { Op } = require('sequelize');
const { Organization, User, AuditLog, sequelize } = require('../models');

class OrganizationRepository {
  async findAll({ page = 1, limit = 20, search, status }) {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { slug: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Organization.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role', 'status'],
          required: false,
        },
      ],
    });

    return { rows, count, page, limit };
  }

  async findById(id) {
    return Organization.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: [
            'id',
            'email',
            'firstName',
            'lastName',
            'phone',
            'role',
            'status',
            'mustChangePassword',
            'createdAt',
            'updatedAt',
          ],
        },
      ],
    });
  }

  async findBySlug(slug) {
    return Organization.findOne({ where: { slug } });
  }

  async findByEmail(email) {
    return Organization.findOne({ where: { email: email.toLowerCase() } });
  }

  async findByVerificationToken(token) {
    return Organization.findOne({ where: { emailVerificationToken: token } });
  }

  async create(data) {
    return Organization.create(data);
  }

  async update(id, data) {
    const org = await Organization.findByPk(id);
    if (!org) return null;
    await org.update(data);
    return org;
  }

  async countByStatus() {
    const rows = await Organization.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    return rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});
  }

  async hardDelete(id) {
    return sequelize.transaction(async (transaction) => {
      const org = await Organization.findByPk(id, { transaction });
      if (!org) return null;

      await User.destroy({ where: { organizationId: id }, transaction });
      await AuditLog.destroy({ where: { organizationId: id }, transaction });
      await org.destroy({ transaction });

      return org;
    });
  }
}

module.exports = new OrganizationRepository();
