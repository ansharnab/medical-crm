const auditService = require('./audit.service');
const { ForbiddenError } = require('../../utils/errors');

async function listAuditLogs(req, res, next) {
  try {
    const query = { ...req.query };
    if (req.user.role === 'client_admin') {
      if (!req.user.organizationId) throw new ForbiddenError('Organization context required');
      query.organizationId = req.user.organizationId;
    }
    const result = await auditService.listLogs(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
