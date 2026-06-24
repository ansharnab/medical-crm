const express = require('express');
const controller = require('./platform.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/rbac.middleware');

const router = express.Router();

router.use(authMiddleware, requireRoles('super_admin'));

router.get('/plans', controller.getPlans);
router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUser);
router.get('/settings', controller.getSettings);
router.patch('/settings', controller.updateSettings);
router.get('/clinics/overview', controller.getClinicsOverview);
router.get('/clinics/:id/usage', controller.getClinicUsage);
router.patch('/clinics/:id/plan', controller.assignClinicPlan);
router.get('/subscriptions/stats', controller.getSubscriptionStats);

module.exports = router;
