const { v4: uuidv4 } = require('uuid');
const { UnauthorizedError } = require('../utils/errors');

function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

module.exports = requestIdMiddleware;
