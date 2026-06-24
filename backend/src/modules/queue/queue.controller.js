const queueService = require('./queue.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function getQueue(req, res, next) {
  try {
    const queue = await queueService.getQueue(getOrganizationId(req), req.query, req.user);
    res.json(queue);
  } catch (err) {
    next(err);
  }
}

async function callNext(req, res, next) {
  try {
    const result = await queueService.callNext(
      getOrganizationId(req),
      req.params.appointmentId,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQueue, callNext };
