const userRepository = require('../repositories/user.repository');
const { ForbiddenError } = require('../utils/errors');

const EXEMPT_PATHS = new Set([
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/change-password',
  '/organizations/verify-email',
]);

async function passwordChangeGate(req, res, next) {
  if (EXEMPT_PATHS.has(req.path) || !req.user) {
    return next();
  }

  const user = await userRepository.findById(req.user.id);
  if (user?.mustChangePassword && user.role !== 'super_admin') {
    return next(new ForbiddenError('Please change your password before continuing'));
  }

  return next();
}

module.exports = { passwordChangeGate };
