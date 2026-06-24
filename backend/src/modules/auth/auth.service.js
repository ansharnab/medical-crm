const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config');
const { getRedis } = require('../../config/redis');
const userRepository = require('../../repositories/user.repository');
const {
  UnauthorizedError,
  ValidationError,
  ForbiddenError,
} = require('../../utils/errors');
const { validateLogin, validateChangePassword, validateForgotPassword, validateResetPassword, validateUpdateProfile } = require('./auth.dto');

const BCRYPT_ROUNDS = 12;
const REFRESH_PREFIX = 'session:refresh:';
const RESET_PREFIX = 'password-reset:';

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    organizationId: user.organizationId,
    status: user.status,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );
}

function signRefreshToken(user, sessionId) {
  return jwt.sign(
    {
      sub: user.id,
      sid: sessionId,
      type: 'refresh',
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
}

async function storeRefreshSession(sessionId, userId) {
  const redis = getRedis();
  const ttlSeconds = 7 * 24 * 60 * 60;
  await redis.set(`${REFRESH_PREFIX}${sessionId}`, userId, 'EX', ttlSeconds);
}

async function revokeRefreshSession(sessionId) {
  const redis = getRedis();
  await redis.del(`${REFRESH_PREFIX}${sessionId}`);
}

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function getLoginBlockReason(user) {
  if (user.status === 'disabled') {
    return 'Account is disabled';
  }

  if (user.organizationId && user.organization) {
    if (user.organization.status === 'suspended') {
      return 'Organization is suspended';
    }
    if (user.organization.status === 'pending' || !user.organization.emailVerifiedAt) {
      return 'Organization email is not verified yet';
    }
  }

  return null;
}

function isLoginEligible(user) {
  return getLoginBlockReason(user) === null;
}

async function findPasswordMatches(email, password) {
  const users = await userRepository.findAllByEmail(email);
  const matches = [];

  for (const candidate of users) {
    const valid = await comparePassword(password, candidate.passwordHash);
    if (valid) matches.push(candidate);
  }

  return matches;
}

function formatClinicOption(user) {
  return {
    organizationId: user.organizationId,
    name: user.organization?.name || 'Clinic',
    city: user.organization?.city || null,
    role: user.role,
  };
}

async function issueSession(user) {
  const sessionId = uuidv4();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, sessionId);

  await storeRefreshSession(sessionId, user.id);
  await userRepository.updateLastLogin(user.id);

  return {
    accessToken,
    refreshToken,
    user: formatUser(user),
  };
}

class AuthService {
  async login(credentials) {
    const { error, value } = validateLogin(credentials);
    if (error) {
      throw new ValidationError('Validation failed', error);
    }

    const passwordMatches = await findPasswordMatches(value.email, value.password);
    if (passwordMatches.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const eligibleMatches = passwordMatches.filter(isLoginEligible);
    if (eligibleMatches.length === 0) {
      throw new ForbiddenError(getLoginBlockReason(passwordMatches[0]));
    }

    if (value.organizationId) {
      const selected = eligibleMatches.find(
        (candidate) => candidate.organizationId === value.organizationId
      );
      if (!selected) {
        throw new UnauthorizedError('Invalid clinic selection');
      }
      return issueSession(selected);
    }

    const clinicAccounts = eligibleMatches.filter((candidate) => candidate.organizationId);
    if (clinicAccounts.length > 1) {
      return {
        requiresClinicSelection: true,
        clinics: clinicAccounts.map(formatClinicOption),
      };
    }

    return issueSession(eligibleMatches[0]);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (payload.type !== 'refresh' || !payload.sid) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const redis = getRedis();
    const storedUserId = await redis.get(`${REFRESH_PREFIX}${payload.sid}`);
    if (!storedUserId || storedUserId !== payload.sub) {
      throw new UnauthorizedError('Refresh session expired or revoked');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedError('User not found or disabled');
    }

    if (user.organizationId && user.organization) {
      if (user.organization.status === 'suspended') {
        throw new ForbiddenError('Organization is suspended');
      }
      if (user.organization.status === 'pending' || !user.organization.emailVerifiedAt) {
        throw new ForbiddenError('Organization email is not verified yet');
      }
    }

    const accessToken = signAccessToken(user);
    return { accessToken, user: formatUser(user) };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;

    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
      if (payload.sid) {
        await revokeRefreshSession(payload.sid);
      }
    } catch {
      // Ignore invalid tokens on logout
    }
  }

  async changePassword(userId, body) {
    const { error, value } = validateChangePassword(body);
    if (error) throw new ValidationError('Validation failed', error);

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const valid = await comparePassword(value.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    if (value.currentPassword === value.newPassword) {
      throw new ValidationError('New password must be different from current password', [
        { field: 'newPassword', message: 'Choose a different password' },
      ]);
    }

    const passwordHash = await hashPassword(value.newPassword);
    await userRepository.updatePassword(userId, passwordHash, false);

    const updated = await userRepository.findById(userId);
    return formatUser(updated);
  }

  async forgotPassword(email) {
    const { error, value } = validateForgotPassword({ email });
    if (error) throw new ValidationError('Validation failed', error);

    const users = await userRepository.findAllByEmail(value.email);
    const eligible = users.filter(isLoginEligible);
    if (eligible.length === 0) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const user = eligible[0];
    const token = require('crypto').randomBytes(32).toString('hex');
    const redis = getRedis();
    await redis.set(`${RESET_PREFIX}${token}`, user.id, 'EX', 3600);

    const emailService = require('../email/email.service');
    await emailService.sendPasswordResetEmail({ to: user.email, firstName: user.firstName, token });

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(body) {
    const { error, value } = validateResetPassword(body);
    if (error) throw new ValidationError('Validation failed', error);

    const redis = getRedis();
    const userId = await redis.get(`${RESET_PREFIX}${value.token}`);
    if (!userId) throw new UnauthorizedError('Invalid or expired reset token');

    const passwordHash = await hashPassword(value.newPassword);
    await userRepository.updatePassword(userId, passwordHash, false);
    await redis.del(`${RESET_PREFIX}${value.token}`);

    const updated = await userRepository.findById(userId);
    return formatUser(updated);
  }

  async updateProfile(userId, body) {
    const { error, value } = validateUpdateProfile(body);
    if (error) throw new ValidationError('Validation failed', error);

    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    await userRepository.update(userId, value);
    const updated = await userRepository.findById(userId);
    return formatUser(updated);
  }
}

module.exports = new AuthService();
module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.formatUser = formatUser;
