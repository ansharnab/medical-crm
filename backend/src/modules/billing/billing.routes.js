const express = require('express');
const controller = require('./billing.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();
const readRoles = ['client_admin', 'receptionist'];

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles(...readRoles), controller.listInvoices);
router.get('/daily-closing', requireRoles('client_admin'), controller.dailyClosing);
router.post('/', requireRoles('client_admin', 'receptionist'), controller.createInvoice);
router.post('/:id/payments', requireRoles('client_admin', 'receptionist'), controller.payInvoice);

module.exports = router;
