const followupsService = require('./followups.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listFollowups(req, res, next) {
  try {
    const result = await followupsService.list(getOrganizationId(req), req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createFollowup(req, res, next) {
  try {
    const followup = await followupsService.create(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.status(201).json(followup);
  } catch (err) {
    next(err);
  }
}

async function updateFollowup(req, res, next) {
  try {
    const followup = await followupsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(followup);
  } catch (err) {
    next(err);
  }
}

module.exports = { listFollowups, createFollowup, updateFollowup };
