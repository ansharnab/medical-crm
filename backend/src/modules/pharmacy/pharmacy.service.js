const { PharmacyItem } = require('../../models');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError } = require('../../utils/errors');
const { validateCreate, validateUpdate } = require('./pharmacy.dto');

function formatItem(item) {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit: item.unit,
    reorderLevel: item.reorderLevel,
    price: item.price != null ? Number(item.price) : null,
    lowStock: item.quantity <= item.reorderLevel,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

class PharmacyService {
  async list(organizationId, query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 50, 100);
    const { Op } = require('sequelize');
    const where = { organizationId };
    if (query.search) {
      where.name = { [Op.iLike]: `%${query.search}%` };
    }
    if (query.lowStock === 'true') {
      where.quantity = { [Op.lte]: require('sequelize').col('reorder_level') };
    }

    const { count, rows } = await PharmacyItem.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: rows.map(formatItem),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreate(body);
    if (error) throw new ValidationError('Validation failed', error);

    const item = await PharmacyItem.create({ organizationId, ...value });
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'pharmacy.item_created',
      entityType: 'pharmacy_item',
      entityId: item.id,
      ipAddress,
    });
    return formatItem(item);
  }

  async update(organizationId, id, body, actor, ipAddress) {
    const { error, value } = validateUpdate(body);
    if (error) throw new ValidationError('Validation failed', error);

    const item = await PharmacyItem.findOne({ where: { id, organizationId } });
    if (!item) throw new NotFoundError('Item not found');

    await item.update(value);
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'pharmacy.item_updated',
      entityType: 'pharmacy_item',
      entityId: id,
      ipAddress,
    });
    return formatItem(item);
  }
}

module.exports = new PharmacyService();
