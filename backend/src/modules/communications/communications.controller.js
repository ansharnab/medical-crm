const communicationsService = require('./communications.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listTemplates(req, res, next) {
  try {
    const result = await communicationsService.listTemplates(getOrganizationId(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createTemplate(req, res, next) {
  try {
    const template = await communicationsService.createTemplate(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
}

async function deleteTemplate(req, res, next) {
  try {
    const result = await communicationsService.deleteTemplate(getOrganizationId(req), req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function listLogs(req, res, next) {
  try {
    const result = await communicationsService.listLogs(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const log = await communicationsService.send(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

async function getConfig(req, res, next) {
  try {
    res.json(communicationsService.getConfig());
  } catch (err) {
    next(err);
  }
}

module.exports = { listTemplates, createTemplate, deleteTemplate, listLogs, sendMessage, getConfig };
