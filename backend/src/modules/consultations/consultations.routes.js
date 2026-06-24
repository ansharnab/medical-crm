const express = require('express');
const controller = require('./consultations.controller');
const prescriptionController = require('../prescriptions/prescriptions.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');
const { tenantMiddleware, requireTenantMiddleware } = require('../../middleware/tenant.middleware');

const router = express.Router();

router.use(authMiddleware, tenantMiddleware, requireTenantMiddleware);

router.post('/', requireRoles('doctor'), controller.startConsultation);
router.patch('/:id', requireRoles('doctor'), controller.updateConsultation);
router.post('/:id/complete', requireRoles('doctor'), controller.completeConsultation);
router.get('/patient/:patientId', requireRoles('doctor'), controller.getPatientHistory);
router.get('/appointment/:appointmentId/prescription', requireRoles('doctor', 'client_admin', 'receptionist'), prescriptionController.getPrescription);
router.post('/appointment/:appointmentId/prescription', requireRoles('doctor'), prescriptionController.savePrescription);

module.exports = router;
