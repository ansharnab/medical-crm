const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  appointmentId: Joi.string().uuid().optional(),
  amount: Joi.number().min(0).required(),
  gstRate: Joi.number().min(0).max(100).default(0),
  notes: Joi.string().allow('', null),
});

const payInvoiceSchema = Joi.object({
  amount: Joi.number().min(0.01).required(),
  paymentMode: Joi.string().valid('cash', 'upi', 'card', 'other').required(),
});

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })), value: null };
  }
  return { error: null, value };
}

function deriveInvoiceStatus(total, paidAmount) {
  if (paidAmount >= total) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
}

module.exports = {
  validateCreateInvoice: (body) => validate(createInvoiceSchema, body),
  validatePayInvoice: (body) => validate(payInvoiceSchema, body),
  deriveInvoiceStatus,
};
