const Joi = require('joi');

const sendSchema = Joi.object({
  patientId: Joi.string().uuid().optional(),
  channel: Joi.string().valid('sms', 'email', 'whatsapp').required(),
  recipient: Joi.string().max(255).required(),
  body: Joi.string().min(1).required(),
  subject: Joi.string().max(200).optional(),
});

const templateSchema = Joi.object({
  name: Joi.string().max(120).required(),
  channel: Joi.string().valid('sms', 'email', 'whatsapp').default('sms'),
  body: Joi.string().min(1).required(),
});

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateSend: (body) => validate(sendSchema, body),
  validateTemplate: (body) => validate(templateSchema, body),
};
