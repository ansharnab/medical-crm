const pharmacyService = require('./pharmacy.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listItems(req, res, next) {
  try {
    const result = await pharmacyService.list(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createItem(req, res, next) {
  try {
    const item = await pharmacyService.create(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await pharmacyService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { listItems, createItem, updateItem };
