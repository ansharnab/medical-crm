const express = require('express');
const controller = require('./audit.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.use(authMiddleware, requireRoles('super_admin', 'client_admin'));

router.get('/', controller.listAuditLogs);

module.exports = router;
