const labsService = require('./labs.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listOrders(req, res, next) {
  try {
    const result = await labsService.list(getOrganizationId(req), req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const order = await labsService.create(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const order = await labsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function saveResult(req, res, next) {
  try {
    const order = await labsService.saveResult(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, createOrder, updateOrder, saveResult };
