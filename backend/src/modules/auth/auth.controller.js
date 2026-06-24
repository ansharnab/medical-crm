const authService = require('./auth.service');
const userRepository = require('../../repositories/user.repository');
const config = require('../../config');
const { formatUser } = authService;

function setRefreshCookie(res, refreshToken) {
  res.cookie(config.cookie.refreshName, refreshToken, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(config.cookie.refreshName, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    if (result.requiresClinicSelection) {
      return res.json(result);
    }
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies[config.cookie.refreshName];
    const result = await authService.refresh(token);
    res.json({ accessToken: result.accessToken, user: result.user });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies[config.cookie.refreshName];
    await authService.logout(token);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'User not found', details: [] },
      });
    }
    res.json({ user: formatUser(user) });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const user = await authService.changePassword(req.user.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const user = await authService.resetPassword(req.body);
    res.json({ user, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout, me, changePassword, forgotPassword, resetPassword, updateProfile };
