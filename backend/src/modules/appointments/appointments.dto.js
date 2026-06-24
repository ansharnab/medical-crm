const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  doctorId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().iso().required(),
  notes: Joi.string().allow('', null),
  durationMinutes: Joi.number().integer().min(5).max(120),
});

const updateAppointmentSchema = Joi.object({
  scheduledAt: Joi.date().iso(),
  doctorId: Joi.string().uuid(),
  status: Joi.string().valid('scheduled', 'confirmed', 'waiting', 'in_consultation', 'completed', 'cancelled', 'no_show'),
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
  validateCreateAppointment: (body) => validate(createAppointmentSchema, body),
  validateUpdateAppointment: (body) => validate(updateAppointmentSchema, body),
};
