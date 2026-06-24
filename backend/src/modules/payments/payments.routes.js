const express = require('express');
const controller = require('./payments.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles('receptionist', 'client_admin'), controller.listPayments);
router.post('/', requireRoles('receptionist'), controller.createPayment);
router.patch('/:id', requireRoles('receptionist'), controller.updatePayment);

module.exports = router;
