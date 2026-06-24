const express = require('express');
const controller = require('./analytics.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.get(
  '/platform',
  authMiddleware,
  requireRoles('super_admin'),
  controller.getPlatformAnalytics
);

router.get(
  '/clinic/dashboard',
  authMiddleware,
  requireRoles('client_admin'),
  tenantMiddleware,
  requireTenantMiddleware,
  controller.getClinicDashboard
);

router.get(
  '/reception/dashboard',
  authMiddleware,
  requireRoles('receptionist'),
  tenantMiddleware,
  requireTenantMiddleware,
  controller.getReceptionDashboard
);

router.get(
  '/doctor/dashboard',
  authMiddleware,
  requireRoles('doctor'),
  tenantMiddleware,
  requireTenantMiddleware,
  controller.getDoctorDashboard
);

module.exports = router;
