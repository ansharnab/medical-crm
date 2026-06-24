const express = require('express');
const controller = require('./organizations.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.get('/verify-email', controller.verifyEmail);

router.use(authMiddleware, requireRoles('super_admin'));

router.get('/', controller.listOrganizations);
router.post('/', controller.createOrganization);
router.get('/:id', controller.getOrganization);
router.patch('/:id', controller.updateOrganization);
router.delete('/:id', controller.deleteOrganization);
router.post('/:id/client-admins', controller.createClientAdmin);
router.patch('/:id/client-admins/:userId', controller.updateClientAdmin);
router.delete('/:id/client-admins/:userId', controller.deleteClientAdmin);
router.post('/:id/client-admins/:userId/resend-password', controller.resendClientAdminPassword);
router.post('/:id/resend-verification', controller.resendVerification);

module.exports = router;
