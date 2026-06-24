const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
      organizationId: req.user?.organizationId,
    });
  } else {
    logger.warn('Operational error', {
      requestId: req.requestId,
      code,
      message: err.message,
      userId: req.user?.id,
    });
  }

  res.status(statusCode).json({
    error: {
      code,
      message: err.isOperational ? err.message : 'Internal server error',
      details: err.details || [],
    },
  });
}

function notFoundMiddleware(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND'));
}

module.exports = { errorMiddleware, notFoundMiddleware };
