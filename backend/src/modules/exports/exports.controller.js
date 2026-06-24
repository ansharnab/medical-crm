const exportsService = require('./exports.service');
const { ForbiddenError } = require('../../utils/errors');

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function exportAppointmentsCsv(req, res, next) {
  try {
    const csv = await exportsService.exportAppointmentsCsv(getOrganizationId(req), req.query.date);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="appointments-${req.query.date || 'export'}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

async function exportRevenueCsv(req, res, next) {
  try {
    const csv = await exportsService.exportRevenueCsv(getOrganizationId(req), req.query.date);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="revenue-${req.query.date || 'export'}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportAppointmentsCsv, exportRevenueCsv };
