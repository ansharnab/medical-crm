const Joi = require('joi');

const createPatientSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().max(100).allow('', null),
  phone: Joi.string().min(6).max(20).required(),
  email: Joi.string().email().allow('', null),
  dateOfBirth: Joi.date().iso().allow(null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').allow(null),
  address: Joi.string().allow('', null),
  bloodGroup: Joi.string().max(5).allow('', null),
  emergencyContact: Joi.string().max(20).allow('', null),
  notes: Joi.string().allow('', null),
});

const updatePatientSchema = createPatientSchema.fork(
  ['firstName', 'phone'],
  (schema) => schema.optional()
).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateCreatePatient: (body) => validate(createPatientSchema, body),
  validateUpdatePatient: (body) => validate(updatePatientSchema, body),
};
