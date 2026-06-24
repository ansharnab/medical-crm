const Joi = require('joi');

const itemSchema = Joi.object({
  name: Joi.string().max(255).required(),
  sku: Joi.string().max(80).allow('', null),
  quantity: Joi.number().integer().min(0),
  unit: Joi.string().max(30).allow('', null),
  reorderLevel: Joi.number().integer().min(0),
  price: Joi.number().min(0).allow(null),
});

const updateSchema = itemSchema.fork(['name'], (s) => s.optional()).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateCreate: (body) => validate(itemSchema, body),
  validateUpdate: (body) => validate(updateSchema, body),
};
