const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  phone: Joi.string().max(20).allow('', null),
  role: Joi.string().valid('doctor', 'receptionist').required(),
  specialization: Joi.string().max(100).allow('', null),
  consultationFee: Joi.number().min(0).allow(null),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  phone: Joi.string().max(20).allow('', null),
  status: Joi.string().valid('active', 'disabled'),
  specialization: Joi.string().max(100).allow('', null),
  consultationFee: Joi.number().min(0).allow(null),
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
  validateCreateUser: (body) => validate(createUserSchema, body),
  validateUpdateUser: (body) => validate(updateUserSchema, body),
};
