const express = require('express');
const controller = require('./followups.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();
const readRoles = ['client_admin', 'doctor', 'receptionist'];

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles(...readRoles), controller.listFollowups);
router.post('/', requireRoles('doctor'), controller.createFollowup);
router.patch('/:id', requireRoles('doctor', 'receptionist'), controller.updateFollowup);

module.exports = router;
