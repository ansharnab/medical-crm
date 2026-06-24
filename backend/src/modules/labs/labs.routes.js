const express = require('express');
const controller = require('./labs.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles('doctor', 'client_admin'), controller.listOrders);
router.post('/', requireRoles('doctor'), controller.createOrder);
router.patch('/:id', requireRoles('doctor', 'client_admin'), controller.updateOrder);
router.post('/:id/result', requireRoles('doctor', 'client_admin'), controller.saveResult);

module.exports = router;
