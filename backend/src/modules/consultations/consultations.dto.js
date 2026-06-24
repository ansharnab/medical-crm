const Joi = require('joi');

const startSchema = Joi.object({ appointmentId: Joi.string().uuid().required() });

const updateSchema = Joi.object({
  symptoms: Joi.string().allow('', null),
  diagnosis: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
  recommendations: Joi.string().allow('', null),
  bpSystolic: Joi.number().integer().min(50).max(300).allow(null),
  bpDiastolic: Joi.number().integer().min(30).max(200).allow(null),
  spo2: Joi.number().integer().min(50).max(100).allow(null),
  weightKg: Joi.number().min(1).max(500).allow(null),
  temperatureC: Joi.number().min(30).max(45).allow(null),
}).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateStart: (body) => validate(startSchema, body),
  validateUpdate: (body) => validate(updateSchema, body),
};
