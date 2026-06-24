const express = require('express');
const controller = require('./settings.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, requireRoles('client_admin'), tenantMiddleware, requireTenantMiddleware);

router.get('/clinic', controller.getClinic);
router.patch('/clinic', controller.updateClinic);
router.get('/working-hours', controller.getWorkingHours);
router.put('/working-hours', controller.updateWorkingHours);
router.get('/doctor-fees', controller.getDoctorFees);
router.put('/doctor-fees/:doctorId', controller.updateDoctorFee);

module.exports = router;
