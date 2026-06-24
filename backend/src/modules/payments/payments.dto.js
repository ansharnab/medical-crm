const Joi = require('joi');

const createPaymentSchema = Joi.object({
  appointmentId: Joi.string().uuid().required(),
  amount: Joi.number().min(0).required(),
  amountPaid: Joi.number().min(0).required(),
  paymentMode: Joi.string().valid('cash', 'upi', 'card', 'other').required(),
  status: Joi.string().valid('pending', 'paid', 'partial', 'waived'),
  notes: Joi.string().allow('', null),
});

const updatePaymentSchema = Joi.object({
  amountPaid: Joi.number().min(0),
  paymentMode: Joi.string().valid('cash', 'upi', 'card', 'other'),
  status: Joi.string().valid('pending', 'paid', 'partial', 'waived'),
  notes: Joi.string().allow('', null),
}).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

function deriveStatus(amount, amountPaid, status) {
  if (status === 'waived') return 'waived';
  if (amountPaid >= amount) return 'paid';
  if (amountPaid > 0) return 'partial';
  return 'pending';
}

module.exports = {
  validateCreatePayment: (body) => validate(createPaymentSchema, body),
  validateUpdatePayment: (body) => validate(updatePaymentSchema, body),
  deriveStatus,
};
