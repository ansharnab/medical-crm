const express = require('express');
const controller = require('./patients.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();
const readRoles = ['client_admin', 'doctor', 'receptionist'];
const writeRoles = ['receptionist'];
const snapshotRoles = ['doctor', 'receptionist'];

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.get('/', requireRoles(...readRoles), controller.listPatients);
router.post('/', requireRoles(...writeRoles), controller.createPatient);
router.get('/:id/snapshot', requireRoles(...snapshotRoles), controller.getSnapshot);
router.get('/:id', requireRoles(...readRoles), controller.getPatient);
router.patch('/:id', requireRoles(...writeRoles), controller.updatePatient);

module.exports = router;
