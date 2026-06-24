const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../../config');
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

const loginLimiter =
  config.isTest
    ? (_req, _res, next) => next()
    : rateLimit({
        windowMs: 60 * 1000,
        max: 10,
        message: {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.',
            details: [],
          },
        },
        standardHeaders: true,
        legacyHeaders: false,
      });

router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', loginLimiter, authController.forgotPassword);
router.post('/reset-password', loginLimiter, authController.resetPassword);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
router.patch('/me', authMiddleware, authController.updateProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
