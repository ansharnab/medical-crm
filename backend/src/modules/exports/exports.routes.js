const express = require('express');
const controller = require('./exports.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(
  authMiddleware,
  requireRoles('client_admin'),
  tenantMiddleware,
  requireTenantMiddleware
);

router.get('/appointments.csv', controller.exportAppointmentsCsv);
router.get('/revenue.csv', controller.exportRevenueCsv);

module.exports = router;
