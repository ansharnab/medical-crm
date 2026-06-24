const prescriptionsService = require('./prescriptions.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function getPrescription(req, res, next) {
  try {
    const rx = await prescriptionsService.getByAppointment(
      getOrganizationId(req),
      req.params.appointmentId,
      req.user
    );
    res.json({ prescription: rx });
  } catch (err) {
    next(err);
  }
}

async function savePrescription(req, res, next) {
  try {
    const rx = await prescriptionsService.upsertByAppointment(
      getOrganizationId(req),
      req.params.appointmentId,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(rx);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPrescription, savePrescription };
