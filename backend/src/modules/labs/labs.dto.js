const Joi = require('joi');

const createOrderSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  consultationId: Joi.string().uuid().optional(),
  testName: Joi.string().max(255).required(),
  notes: Joi.string().allow('', null),
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('ordered', 'sample_collected', 'processing', 'completed', 'cancelled'),
  notes: Joi.string().allow('', null),
}).min(1);

const resultSchema = Joi.object({
  resultText: Joi.string().allow('', null),
  fileUrl: Joi.string().uri().allow('', null),
});

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateCreateOrder: (body) => validate(createOrderSchema, body),
  validateUpdateOrder: (body) => validate(updateOrderSchema, body),
  validateResult: (body) => validate(resultSchema, body),
};
