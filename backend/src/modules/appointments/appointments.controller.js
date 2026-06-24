const appointmentsService = require('./appointments.service');
const { ForbiddenError } = require('../../utils/errors');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

function getOrganizationId(req) {
  const organizationId = req.tenantId || req.user?.organizationId;
  if (!organizationId) throw new ForbiddenError('Organization context required');
  return organizationId;
}

async function listAppointments(req, res, next) {
  try {
    const result = await appointmentsService.list(getOrganizationId(req), req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appt = await appointmentsService.getById(getOrganizationId(req), req.params.id, req.user);
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function createAppointment(req, res, next) {
  try {
    const appt = await appointmentsService.create(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
}

async function updateAppointment(req, res, next) {
  try {
    const appt = await appointmentsService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(appt);
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const result = await appointmentsService.cancel(
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

async function getSlots(req, res, next) {
  try {
    const result = await appointmentsService.getAvailableSlots(getOrganizationId(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, cancelAppointment, getSlots };
