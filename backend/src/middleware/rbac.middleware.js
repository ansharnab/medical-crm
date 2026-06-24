const { ForbiddenError } = require('../utils/errors');

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
};

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    return next();
  };
}

function requireSelfOrRoles(getUserId, ...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const targetUserId = typeof getUserId === 'function' ? getUserId(req) : getUserId;
    if (req.user.id === targetUserId) {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError('Insufficient permissions'));
  };
}

module.exports = {
  ROLES,
  requireRoles,
  requireSelfOrRoles,
};
