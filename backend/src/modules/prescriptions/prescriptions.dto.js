const Joi = require('joi');

const itemSchema = Joi.object({
  medicineName: Joi.string().max(255).required(),
  dose: Joi.string().max(100).allow('', null),
  duration: Joi.string().max(100).allow('', null),
  quantity: Joi.number().integer().min(0).allow(null),
  sortOrder: Joi.number().integer().min(0),
});

const upsertSchema = Joi.object({
  notes: Joi.string().allow('', null),
  items: Joi.array().items(itemSchema).min(1).required(),
});

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateUpsert: (body) => validate(upsertSchema, body),
};
