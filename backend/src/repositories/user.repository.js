const { Op } = require('sequelize');
const { User, Organization } = require('../models');

const organizationInclude = {
  model: Organization,
  as: 'organization',
  required: false,
};

class UserRepository {
  async findAllByEmail(email) {
    return User.scope('withPassword').findAll({
      where: { email: email.toLowerCase() },
      include: [organizationInclude],
    });
  }

  async findByEmail(email) {
    const users = await this.findAllByEmail(email);
    return users[0] || null;
  }

  async findByEmailInOrganization(email, organizationId, excludeUserId = null) {
    const where = {
      email: email.toLowerCase(),
      organizationId,
    };
    if (excludeUserId) {
      where.id = { [Op.ne]: excludeUserId };
    }

    return User.findOne({ where });
  }

  async findById(id) {
    return User.findByPk(id, {
      include: [organizationInclude],
    });
  }

  async findByIdWithPassword(id) {
    return User.scope('withPassword').findByPk(id, {
      include: [organizationInclude],
    });
  }

  async updateLastLogin(id) {
    return User.update({ lastLoginAt: new Date() }, { where: { id } });
  }

  async findByIdInOrganization(id, organizationId) {
    return User.findOne({
      where: { id, organizationId },
    });
  }

  async updatePassword(id, passwordHash, mustChangePassword = false) {
    return User.update({ passwordHash, mustChangePassword }, { where: { id } });
  }

  async create(data) {
    return User.create(data);
  }

  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(data);
    return user;
  }

  async hardDelete(id) {
    return User.destroy({ where: { id } });
  }

  async findAllInOrganization(organizationId, { page = 1, limit = 20, role, roles, status, search }) {
    const where = { organizationId };
    if (role) {
      where.role = role;
    } else if (roles?.length) {
      where.role = { [Op.in]: roles };
    }
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    return User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }

  async findAllPlatform({ page = 1, limit = 20, role, status, search, organizationId }) {
    const where = { role: { [Op.ne]: 'super_admin' } };
    if (role) where.role = role;
    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    return User.findAndCountAll({
      where,
      include: [organizationInclude],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }
}

module.exports = new UserRepository();
