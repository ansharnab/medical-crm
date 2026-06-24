const settingsService = require('./settings.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) {
    throw new ForbiddenError('Organization context required');
  }
  return organizationId;
}

async function getClinic(req, res, next) {
  try {
    const clinic = await settingsService.getClinic(getOrganizationId(req));
    res.json(clinic);
  } catch (err) {
    next(err);
  }
}

async function updateClinic(req, res, next) {
  try {
    const clinic = await settingsService.updateClinic(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.json(clinic);
  } catch (err) {
    next(err);
  }
}

async function getWorkingHours(req, res, next) {
  try {
    const hours = await settingsService.getWorkingHours(getOrganizationId(req));
    res.json(hours);
  } catch (err) {
    next(err);
  }
}

async function updateWorkingHours(req, res, next) {
  try {
    const hours = await settingsService.updateWorkingHours(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.json(hours);
  } catch (err) {
    next(err);
  }
}

async function getDoctorFees(req, res, next) {
  try {
    const fees = await settingsService.getDoctorFees(getOrganizationId(req));
    res.json(fees);
  } catch (err) {
    next(err);
  }
}

async function updateDoctorFee(req, res, next) {
  try {
    const result = await settingsService.updateDoctorFee(
      getOrganizationId(req),
      req.params.doctorId,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getClinic,
  updateClinic,
  getWorkingHours,
  updateWorkingHours,
  getDoctorFees,
  updateDoctorFee,
};
