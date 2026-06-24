const express = require('express');
const controller = require('./queue.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles('receptionist', 'doctor'), controller.getQueue);
router.post('/:appointmentId/call-next', requireRoles('doctor'), controller.callNext);

module.exports = router;
