const express = require('express');
const controller = require('./pharmacy.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles('client_admin'), controller.listItems);
router.post('/', requireRoles('client_admin'), controller.createItem);
router.patch('/:id', requireRoles('client_admin'), controller.updateItem);

module.exports = router;
