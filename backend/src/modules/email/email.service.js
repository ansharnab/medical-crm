const crypto = require('crypto');
const config = require('../../config');
const logger = require('../../utils/logger');

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (!config.email.smtpHost) {
    transporterPromise = Promise.resolve(null);
    return transporterPromise;
  }

  const nodemailer = require('nodemailer');
  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      secure: config.email.smtpSecure,
      auth: config.email.smtpUser
        ? { user: config.email.smtpUser, pass: config.email.smtpPass }
        : undefined,
    })
  );
  return transporterPromise;
}

function buildVerificationUrl(token) {
  return `${config.app.frontendUrl}/verify-clinic-email?token=${token}`;
}

async function sendClinicVerificationEmail({ to, clinicName, token }) {
  const verifyUrl = buildVerificationUrl(token);
  const subject = 'Verify your clinic email — Doctor CRM';
  const text = [
    `Hello,`,
    ``,
    `Please verify the email for "${clinicName}" on Doctor CRM.`,
    ``,
    `Click the link below to activate your clinic:`,
    verifyUrl,
    ``,
    `This link expires in 48 hours.`,
  ].join('\n');

  const transporter = await getTransporter();

  if (!transporter) {
    logger.info('DEV email (verification link)', { to, clinicName, verifyUrl });
    return { delivered: false, verifyUrl };
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: `<p>Please verify the email for <strong>${clinicName}</strong>.</p><p><a href="${verifyUrl}">Verify clinic email</a></p><p>This link expires in 48 hours.</p>`,
  });

  logger.info('Verification email sent', { to, clinicName });
  return { delivered: true, verifyUrl };
}

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getVerificationExpiry() {
  return new Date(Date.now() + 48 * 60 * 60 * 1000);
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  const bytes = crypto.randomBytes(12);
  let password = '';
  for (let i = 0; i < 12; i += 1) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

async function sendClientAdminCredentialsEmail({ to, firstName, clinicName, password, isReset = false }) {
  const loginUrl = `${config.app.frontendUrl}/login`;
  const subject = isReset
    ? 'Your Doctor CRM password has been reset'
    : 'Your Doctor CRM client admin account';
  const intro = isReset
    ? `Hello ${firstName}, your password for "${clinicName}" has been reset.`
    : `Hello ${firstName}, your client admin account for "${clinicName}" has been created.`;
  const text = [
    intro,
    '',
    `Login URL: ${loginUrl}`,
    `Email: ${to}`,
    `Password: ${password}`,
    '',
    'Please sign in and change your password after your first login.',
  ].join('\n');

  const transporter = await getTransporter();

  if (!transporter) {
    logger.info('DEV email (client admin credentials)', { to, clinicName, password, loginUrl });
    return { delivered: false, devPassword: password };
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: `<p>${intro}</p><p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p><p><strong>Email:</strong> ${to}</p><p><strong>Password:</strong> ${password}</p><p>Please sign in and change your password after your first login.</p>`,
  });

  logger.info('Client admin credentials email sent', { to, clinicName, isReset });
  return { delivered: true };
}

async function sendStaffCredentialsEmail({ to, firstName, clinicName, password, role }) {
  const loginUrl = `${config.app.frontendUrl}/login`;
  const roleLabel = role === 'doctor' ? 'doctor' : 'receptionist';
  const subject = `Your Doctor CRM ${roleLabel} account`;
  const intro = `Hello ${firstName}, your ${roleLabel} account for "${clinicName}" has been created.`;
  const text = [
    intro,
    '',
    `Login URL: ${loginUrl}`,
    `Email: ${to}`,
    `Password: ${password}`,
    '',
    'Please sign in and change your password after your first login.',
  ].join('\n');

  const transporter = await getTransporter();

  if (!transporter) {
    logger.info('DEV email (staff credentials)', { to, clinicName, role, password, loginUrl });
    return { delivered: false, devPassword: password };
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: `<p>${intro}</p><p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p><p><strong>Email:</strong> ${to}</p><p><strong>Password:</strong> ${password}</p><p>Please sign in and change your password after your first login.</p>`,
  });

  logger.info('Staff credentials email sent', { to, clinicName, role });
  return { delivered: true };
}

function buildResetUrl(token) {
  return `${config.app.frontendUrl}/reset-password?token=${token}`;
}

async function sendPasswordResetEmail({ to, firstName, token }) {
  const resetUrl = buildResetUrl(token);
  const subject = 'Reset your Doctor CRM password';
  const text = [
    `Hello ${firstName || 'there'},`,
    '',
    'Click the link below to reset your password:',
    resetUrl,
    '',
    'This link expires in 1 hour.',
  ].join('\n');

  const transporter = await getTransporter();

  if (!transporter) {
    logger.info('DEV email (password reset)', { to, resetUrl });
    return { delivered: false, resetUrl };
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html: `<p>Hello ${firstName || 'there'},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
  });

  logger.info('Password reset email sent', { to });
  return { delivered: true };
}

async function sendGenericEmail({ to, subject, text, html }) {
  const transporter = await getTransporter();
  if (!transporter) {
    logger.info('DEV email (generic)', { to, subject, preview: text?.slice(0, 120) });
    return { delivered: false };
  }
  await transporter.sendMail({ from: config.email.from, to, subject, text, html });
  logger.info('Generic email sent', { to, subject });
  return { delivered: true };
}

module.exports = {
  sendClinicVerificationEmail,
  sendClientAdminCredentialsEmail,
  sendStaffCredentialsEmail,
  sendPasswordResetEmail,
  sendGenericEmail,
  getTransporter,
  generateVerificationToken,
  generateTemporaryPassword,
  getVerificationExpiry,
  buildVerificationUrl,
  buildResetUrl,
};
