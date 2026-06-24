const { Op } = require('sequelize');
const { AuditLog, User, Organization } = require('../models');

class AuditRepository {
  async findAll({ page = 1, limit = 20, action, organizationId, userId, from, to }) {
    const where = {};
    if (action) where.action = { [Op.iLike]: `%${action}%` };
    if (organizationId) where.organizationId = organizationId;
    if (userId) where.userId = userId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    const offset = (page - 1) * limit;
    return AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
          required: false,
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }
}

module.exports = new AuditRepository();
