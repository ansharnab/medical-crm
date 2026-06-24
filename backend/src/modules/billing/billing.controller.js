const billingService = require('./billing.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listInvoices(req, res, next) {
  try {
    const result = await billingService.list(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function dailyClosing(req, res, next) {
  try {
    const result = await billingService.dailyClosing(getOrganizationId(req), req.query.date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createInvoice(req, res, next) {
  try {
    const invoice = await billingService.create(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}

async function payInvoice(req, res, next) {
  try {
    const invoice = await billingService.pay(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvoices, dailyClosing, createInvoice, payInvoice };
