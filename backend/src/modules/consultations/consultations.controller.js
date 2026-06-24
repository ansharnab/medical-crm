const consultationsService = require('./consultations.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function startConsultation(req, res, next) {
  try {
    const result = await consultationsService.start(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function updateConsultation(req, res, next) {
  try {
    const result = await consultationsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function completeConsultation(req, res, next) {
  try {
    const result = await consultationsService.complete(
      getOrganizationId(req),
      req.params.id,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getPatientHistory(req, res, next) {
  try {
    const result = await consultationsService.getPatientHistory(
      getOrganizationId(req),
      req.params.patientId,
      req.query,
      req.user
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { startConsultation, updateConsultation, completeConsultation, getPatientHistory };
