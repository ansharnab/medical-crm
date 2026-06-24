const Joi = require('joi');
const { DAYS } = require('./workingHours.defaults');

const daySchema = Joi.object({
  open: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  close: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
  closed: Joi.boolean().required(),
});

const updateClinicSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  phone: Joi.string().max(20).allow('', null),
  addressLine1: Joi.string().max(255).allow('', null),
  addressLine2: Joi.string().max(255).allow('', null),
  city: Joi.string().max(100).allow('', null),
  state: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  timezone: Joi.string().max(50),
}).min(1);

const workingHoursSchema = Joi.object(
  DAYS.reduce((acc, day) => {
    acc[day] = daySchema.required();
    return acc;
  }, {})
);

const updateDoctorFeeSchema = Joi.object({
  consultationFee: Joi.number().min(0).required(),
});

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return {
      error: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
      value: null,
    };
  }
  return { error: null, value };
}

module.exports = {
  validateUpdateClinic: (body) => validate(updateClinicSchema, body),
  validateWorkingHours: (body) => validate(workingHoursSchema, body),
  validateUpdateDoctorFee: (body) => validate(updateDoctorFeeSchema, body),
};
