const analyticsService = require('./analytics.service');
const { ForbiddenError } = require('../../utils/errors');

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function getPlatformAnalytics(req, res, next) {
  try {
    const stats = await analyticsService.getPlatformStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getClinicDashboard(req, res, next) {
  try {
    const stats = await analyticsService.getClinicDashboard(getOrganizationId(req));
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getReceptionDashboard(req, res, next) {
  try {
    const stats = await analyticsService.getReceptionDashboard(getOrganizationId(req));
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function getDoctorDashboard(req, res, next) {
  try {
    const stats = await analyticsService.getDoctorDashboard(getOrganizationId(req), req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPlatformAnalytics,
  getClinicDashboard,
  getReceptionDashboard,
  getDoctorDashboard,
};
