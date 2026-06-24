const paymentsService = require('./payments.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listPayments(req, res, next) {
  try {
    const result = await paymentsService.list(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createPayment(req, res, next) {
  try {
    const payment = await paymentsService.create(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

async function updatePayment(req, res, next) {
  try {
    const payment = await paymentsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPayments, createPayment, updatePayment };
