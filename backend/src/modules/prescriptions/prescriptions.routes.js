const express = require('express');
const controller = require('./prescriptions.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/:consultationId/prescription', requireRoles('doctor', 'client_admin', 'receptionist'), controller.getPrescription);
router.post('/:consultationId/prescription', requireRoles('doctor'), controller.savePrescription);

module.exports = router;
