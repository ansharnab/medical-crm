const auditRepository = require('../../repositories/audit.repository');
const { AuditLog } = require('../../models');
const logger = require('../../utils/logger');

async function writeAudit({
  userId,
  organizationId = null,
  action,
  entityType = null,
  entityId = null,
  metadata = null,
  ipAddress = null,
}) {
  try {
    await AuditLog.create({
      userId,
      organizationId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
    });
  } catch (err) {
    logger.error('Failed to write audit log', { action, error: err.message });
  }
}

function formatAuditLog(row) {
  const log = row.get ? row.get({ plain: true }) : row;
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt,
    user: log.user
      ? {
          id: log.user.id,
          email: log.user.email,
          name: `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim(),
        }
      : null,
    organization: log.organization
      ? { id: log.organization.id, name: log.organization.name }
      : null,
  };
}

class AuditService {
  async listLogs(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);

    const { count, rows } = await auditRepository.findAll({
      page,
      limit,
      action: query.action,
      organizationId: query.organizationId,
      userId: query.userId,
      from: query.from,
      to: query.to,
    });

    return {
      data: rows.map(formatAuditLog),
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }
}

const auditService = new AuditService();
module.exports = auditService;
module.exports.writeAudit = writeAudit;
