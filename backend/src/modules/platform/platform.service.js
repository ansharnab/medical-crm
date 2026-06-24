const Joi = require('joi');
const { Op } = require('sequelize');
const userRepository = require('../../repositories/user.repository');
const organizationRepository = require('../../repositories/organization.repository');
const {
  Organization,
  User,
  Patient,
  Appointment,
  Payment,
  PlatformSettings,
  sequelize,
} = require('../../models');
const { writeAudit } = require('../audit/audit.service');
const { NotFoundError, ValidationError } = require('../../utils/errors');

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹2,999/mo',
    priceMonthly: 2999,
    clinics: 1,
    users: 5,
    features: ['Patients', 'Appointments', 'Queue'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹7,999/mo',
    priceMonthly: 7999,
    clinics: 3,
    users: 20,
    features: ['All Starter', 'Billing', 'Analytics', 'SMS'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceMonthly: 0,
    clinics: 'Unlimited',
    users: 'Unlimited',
    features: ['All Pro', 'Pharmacy', 'Portal', 'API access'],
  },
];

const updateUserSchema = Joi.object({
  status: Joi.string().valid('active', 'disabled'),
}).min(1);

const updateSettingsSchema = Joi.object({
  productName: Joi.string().min(2).max(255),
  platformOwner: Joi.string().min(2).max(255),
  supportEmail: Joi.string().email(),
  defaultTimezone: Joi.string().max(50),
  currency: Joi.string().max(10),
  maintenanceMode: Joi.boolean(),
}).min(1);

const assignPlanSchema = Joi.object({
  subscriptionPlan: Joi.string().valid('starter', 'pro', 'enterprise').required(),
  subscriptionStatus: Joi.string().valid('trial', 'active', 'past_due', 'cancelled').optional(),
});

function formatPlatformUser(user) {
  const u = user.get ? user.get({ plain: true }) : user;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    status: u.status,
    phone: u.phone,
    organizationId: u.organizationId,
    organization: u.organization
      ? { id: u.organization.id, name: u.organization.name, city: u.organization.city }
      : null,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  };
}

function formatSettings(row) {
  const s = row.get ? row.get({ plain: true }) : row;
  return {
    productName: s.productName,
    platformOwner: s.platformOwner,
    supportEmail: s.supportEmail,
    defaultTimezone: s.defaultTimezone,
    currency: s.currency,
    maintenanceMode: s.maintenanceMode,
    updatedAt: s.updatedAt,
  };
}

class PlatformService {
  getPlans() {
    return PLANS;
  }

  async listUsers(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
    const { count, rows } = await userRepository.findAllPlatform({
      page,
      limit,
      role: query.role,
      status: query.status,
      search: query.search,
      organizationId: query.organizationId,
    });

    return {
      data: rows.map(formatPlatformUser),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async updateUser(userId, body, actor, ipAddress) {
    const { error, value } = updateUserSchema.validate(body, { stripUnknown: true });
    if (error) throw new ValidationError(error.details[0].message);

    const user = await userRepository.findById(userId);
    if (!user || user.role === 'super_admin') throw new NotFoundError('User not found');

    await userRepository.update(userId, value);

    await writeAudit({
      userId: actor.id,
      organizationId: user.organizationId,
      action: 'platform.user_updated',
      entityType: 'user',
      entityId: userId,
      metadata: value,
      ipAddress,
    });

    return formatPlatformUser(await userRepository.findById(userId));
  }

  async getSettings() {
    let settings = await PlatformSettings.findByPk(1);
    if (!settings) {
      settings = await PlatformSettings.create({
        id: 1,
        productName: 'Doctor CRM',
        platformOwner: 'MaatriDev Technologies',
        supportEmail: 'support@doctorcrm.com',
        defaultTimezone: 'Asia/Kolkata',
        currency: 'INR',
        maintenanceMode: false,
      });
    }
    return formatSettings(settings);
  }

  async updateSettings(body, actor, ipAddress) {
    const { error, value } = updateSettingsSchema.validate(body, { stripUnknown: true });
    if (error) throw new ValidationError(error.details[0].message);

    let settings = await PlatformSettings.findByPk(1);
    if (!settings) {
      settings = await PlatformSettings.create({ id: 1, ...value });
    } else {
      await settings.update(value);
    }

    await writeAudit({
      userId: actor.id,
      action: 'platform.settings_updated',
      entityType: 'platform_settings',
      entityId: '1',
      metadata: value,
      ipAddress,
    });

    return formatSettings(settings);
  }

  async getClinicUsage(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Clinic not found');

    const [patients, appointments, paymentsSum, staffByRole] = await Promise.all([
      Patient.count({ where: { organizationId } }),
      Appointment.count({ where: { organizationId } }),
      Payment.sum('amountPaid', { where: { organizationId } }),
      User.findAll({
        attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        where: { organizationId },
        group: ['role'],
        raw: true,
      }),
    ]);

    const staff = staffByRole.reduce((acc, row) => {
      acc[row.role] = parseInt(row.count, 10);
      return acc;
    }, {});

    return {
      organizationId,
      patients,
      appointments,
      revenue: paymentsSum || 0,
      staff: {
        doctors: staff.doctor || 0,
        receptionists: staff.receptionist || 0,
        admins: staff.client_admin || 0,
        total: Object.values(staff).reduce((a, n) => a + n, 0),
      },
      subscriptionPlan: org.subscriptionPlan || 'starter',
      subscriptionStatus: org.subscriptionStatus || 'trial',
      trialEndsAt: org.trialEndsAt,
    };
  }

  async assignClinicPlan(organizationId, body, actor, ipAddress) {
    const { error, value } = assignPlanSchema.validate(body, { stripUnknown: true });
    if (error) throw new ValidationError(error.details[0].message);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Clinic not found');

    const updates = {
      subscriptionPlan: value.subscriptionPlan,
      subscriptionStatus: value.subscriptionStatus || 'active',
    };

    await organizationRepository.update(organizationId, updates);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'platform.plan_assigned',
      entityType: 'organization',
      entityId: organizationId,
      metadata: updates,
      ipAddress,
    });

    return updates;
  }

  async getClinicsOverview() {
    const orgs = await Organization.findAll({
      attributes: [
        'id',
        'name',
        'city',
        'status',
        'subscriptionPlan',
        'subscriptionStatus',
        'createdAt',
        'emailVerifiedAt',
      ],
      order: [['createdAt', 'DESC']],
    });

    const overview = await Promise.all(
      orgs.map(async (org) => {
        const [patients, appointments, users] = await Promise.all([
          Patient.count({ where: { organizationId: org.id } }),
          Appointment.count({ where: { organizationId: org.id } }),
          User.count({ where: { organizationId: org.id } }),
        ]);
        return {
          id: org.id,
          name: org.name,
          city: org.city,
          status: org.status,
          emailVerified: Boolean(org.emailVerifiedAt),
          subscriptionPlan: org.subscriptionPlan || 'starter',
          subscriptionStatus: org.subscriptionStatus || 'trial',
          patients,
          appointments,
          users,
          createdAt: org.createdAt,
        };
      })
    );

    return overview;
  }

  async getSubscriptionStats() {
    const rows = await Organization.findAll({
      attributes: [
        'subscriptionPlan',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['subscriptionPlan'],
      raw: true,
    });

    const byPlan = rows.reduce((acc, row) => {
      acc[row.subscriptionPlan || 'starter'] = parseInt(row.count, 10);
      return acc;
    }, {});

    const mrr = Object.entries(byPlan).reduce((sum, [plan, count]) => {
      const planDef = PLANS.find((p) => p.id === plan);
      return sum + (planDef?.priceMonthly || 0) * count;
    }, 0);

    return { byPlan, mrr };
  }
}

module.exports = new PlatformService();
