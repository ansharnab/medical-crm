const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  organizationId: Joi.string().uuid().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().min(32).required(),
  newPassword: Joi.string().min(8).required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(100),
  lastName: Joi.string().max(100),
}).min(1);

function validate(schema, body) {
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    return { error: details, value: null };
  }
  return { error: null, value };
}

function validateLogin(body) {
  return validate(loginSchema, body);
}

function validateChangePassword(body) {
  return validate(changePasswordSchema, body);
}

function validateForgotPassword(body) {
  return validate(forgotPasswordSchema, body);
}

function validateResetPassword(body) {
  return validate(resetPasswordSchema, body);
}

function validateUpdateProfile(body) {
  return validate(updateProfileSchema, body);
}

module.exports = {
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile,
};
