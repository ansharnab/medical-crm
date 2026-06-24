const express = require('express');
const controller = require('./users.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

// Receptionists need read-only doctor list for appointment booking
router.get('/', requireRoles('client_admin', 'receptionist'), controller.listUsers);
router.get('/:id', requireRoles('client_admin'), controller.getUser);
router.post('/', requireRoles('client_admin'), controller.createUser);
router.patch('/:id', requireRoles('client_admin'), controller.updateUser);
router.delete('/:id', requireRoles('client_admin'), controller.deleteUser);
router.post('/:id/resend-password', requireRoles('client_admin'), controller.resendPassword);

module.exports = router;
