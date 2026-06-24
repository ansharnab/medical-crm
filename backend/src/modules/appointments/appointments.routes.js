const express = require('express');
const controller = require('./appointments.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();
const readRoles = ['client_admin', 'doctor', 'receptionist'];
const writeRoles = ['receptionist'];

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/slots', requireRoles(...readRoles), controller.getSlots);
router.get('/', requireRoles(...readRoles), controller.listAppointments);
router.post('/', requireRoles(...writeRoles), controller.createAppointment);
router.get('/:id', requireRoles(...readRoles), controller.getAppointment);
router.patch('/:id', requireRoles(...writeRoles), controller.updateAppointment);
router.post('/:id/cancel', requireRoles(...writeRoles), controller.cancelAppointment);

module.exports = router;
