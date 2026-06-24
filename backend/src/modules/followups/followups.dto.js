const Joi = require('joi');

const createFollowupSchema = Joi.object({
  consultationId: Joi.string().uuid().required(),
  dueDate: Joi.date().iso().required(),
  notes: Joi.string().allow('', null),
});

const updateFollowupSchema = Joi.object({
  status: Joi.string().valid('pending', 'completed', 'cancelled'),
  dueDate: Joi.date().iso(),
  notes: Joi.string().allow('', null),
}).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

module.exports = {
  validateCreateFollowup: (body) => validate(createFollowupSchema, body),
  validateUpdateFollowup: (body) => validate(updateFollowupSchema, body),
};
