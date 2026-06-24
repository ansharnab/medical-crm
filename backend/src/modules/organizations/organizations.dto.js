const Joi = require('joi');

const createOrganizationSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null),
  addressLine1: Joi.string().max(255).allow('', null),
  addressLine2: Joi.string().max(255).allow('', null),
  city: Joi.string().max(100).allow('', null),
  state: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  timezone: Joi.string().max(50).default('Asia/Kolkata'),
  subscriptionPlan: Joi.string().valid('starter', 'pro', 'enterprise').default('starter'),
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  phone: Joi.string().max(20).allow('', null),
  addressLine1: Joi.string().max(255).allow('', null),
  addressLine2: Joi.string().max(255).allow('', null),
  city: Joi.string().max(100).allow('', null),
  state: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  timezone: Joi.string().max(50),
  status: Joi.string().valid('active', 'suspended', 'pending'),
  subscriptionPlan: Joi.string().valid('starter', 'pro', 'enterprise'),
  subscriptionStatus: Joi.string().valid('trial', 'active', 'past_due', 'cancelled'),
}).min(1);

const createClientAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).allow('', null),
});

const updateClientAdminSchema = Joi.object({
  email: Joi.string().email(),
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  phone: Joi.string().max(20).allow('', null),
  status: Joi.string().valid('active', 'disabled'),
}).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return {
      error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      value: null,
    };
  }
  return { error: null, value };
}

module.exports = {
  validateCreateOrganization: (body) => validate(createOrganizationSchema, body),
  validateUpdateOrganization: (body) => validate(updateOrganizationSchema, body),
  validateCreateClientAdmin: (body) => validate(createClientAdminSchema, body),
  validateUpdateClientAdmin: (body) => validate(updateClientAdminSchema, body),
};
