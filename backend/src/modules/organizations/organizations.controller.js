const organizationsService = require('./organizations.service');

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
}

async function listOrganizations(req, res, next) {
  try {
    const result = await organizationsService.list(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOrganization(req, res, next) {
  try {
    const org = await organizationsService.getById(req.params.id);
    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function createOrganization(req, res, next) {
  try {
    const org = await organizationsService.create(req.body, req.user, getIp(req));
    res.status(201).json(org);
  } catch (err) {
    next(err);
  }
}

async function updateOrganization(req, res, next) {
  try {
    const org = await organizationsService.update(req.params.id, req.body, req.user, getIp(req));
    res.json(org);
  } catch (err) {
    next(err);
  }
}

async function createClientAdmin(req, res, next) {
  try {
    const user = await organizationsService.createClientAdmin(
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const org = await organizationsService.verifyEmail(req.query.token);
    res.json({
      message: 'Clinic email verified successfully. The clinic is now active.',
      organization: org,
    });
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const result = await organizationsService.resendVerification(
      req.params.id,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateClientAdmin(req, res, next) {
  try {
    const user = await organizationsService.updateClientAdmin(
      req.params.id,
      req.params.userId,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteClientAdmin(req, res, next) {
  try {
    const result = await organizationsService.deleteClientAdmin(
      req.params.id,
      req.params.userId,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resendClientAdminPassword(req, res, next) {
  try {
    const result = await organizationsService.resendClientAdminPassword(
      req.params.id,
      req.params.userId,
      req.user,
      getIp(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteOrganization(req, res, next) {
  try {
    const result = await organizationsService.delete(req.params.id, req.user, getIp(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  createClientAdmin,
  updateClientAdmin,
  deleteClientAdmin,
  verifyEmail,
  resendVerification,
  resendClientAdminPassword,
  deleteOrganization,
};
