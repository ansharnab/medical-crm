const platformService = require('./platform.service');

async function getPlans(req, res, next) {
  try {
    res.json({ data: platformService.getPlans() });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const result = await platformService.listUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await platformService.updateUser(req.params.id, req.body, req.user, req.ip);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getSettings(req, res, next) {
  try {
    const settings = await platformService.getSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await platformService.updateSettings(req.body, req.user, req.ip);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function getClinicUsage(req, res, next) {
  try {
    const usage = await platformService.getClinicUsage(req.params.id);
    res.json(usage);
  } catch (err) {
    next(err);
  }
}

async function assignClinicPlan(req, res, next) {
  try {
    const result = await platformService.assignClinicPlan(req.params.id, req.body, req.user, req.ip);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getClinicsOverview(req, res, next) {
  try {
    const data = await platformService.getClinicsOverview();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionStats(req, res, next) {
  try {
    const stats = await platformService.getSubscriptionStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPlans,
  listUsers,
  updateUser,
  getSettings,
  updateSettings,
  getClinicUsage,
  assignClinicPlan,
  getClinicsOverview,
  getSubscriptionStats,
};
