const patientsService = require('./patients.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listPatients(req, res, next) {
  try {
    const result = await patientsService.list(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await patientsService.getById(getOrganizationId(req), req.params.id);
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function createPatient(req, res, next) {
  try {
    const patient = await patientsService.create(getOrganizationId(req), req.body, req.user, getIp(req));
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
}

async function updatePatient(req, res, next) {
  try {
    const patient = await patientsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function getSnapshot(req, res, next) {
  try {
    const snapshot = await patientsService.getSnapshot(getOrganizationId(req), req.params.id);
    res.json(snapshot);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPatients, getPatient, createPatient, updatePatient, getSnapshot };
