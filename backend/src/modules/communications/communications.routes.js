const express = require('express');
const controller = require('./communications.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/config', requireRoles('client_admin', 'receptionist'), controller.getConfig);
router.get('/templates', requireRoles('client_admin'), controller.listTemplates);
router.post('/templates', requireRoles('client_admin'), controller.createTemplate);
router.delete('/templates/:id', requireRoles('client_admin'), controller.deleteTemplate);
router.get('/logs', requireRoles('client_admin', 'receptionist'), controller.listLogs);
router.post('/send', requireRoles('client_admin', 'receptionist'), controller.sendMessage);

module.exports = router;
