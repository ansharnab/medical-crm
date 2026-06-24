const usersService = require('./users.service');
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

async function listUsers(req, res, next) {
  try {
    const result = await usersService.list(getOrganizationId(req), req.query, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await usersService.getById(getOrganizationId(req), req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await usersService.create(
      getOrganizationId(req),
      req.body,
      req.user,
      getIp(req)
    );
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await usersService.update(
      getOrganizationId(req),
      req.params.id,
      req.body,
      req.user,
      getIp(req)
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const result = await usersService.delete(
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

async function resendPassword(req, res, next) {
  try {
    const result = await usersService.resendPassword(
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

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resendPassword,
};
