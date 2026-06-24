const config = require('../../config');
const logger = require('../../utils/logger');
const { sendGenericEmail } = require('../email/email.service');

function normalizeIndianMobile(recipient) {
  const digits = recipient.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

async function sendSms({ to, body }) {
  const mobile = normalizeIndianMobile(to);
  const provider = config.messaging.smsProvider;

  if (provider === 'msg91' && config.messaging.msg91AuthKey) {
    const params = new URLSearchParams({
      authkey: config.messaging.msg91AuthKey,
      mobiles: mobile,
      message: body,
      sender: config.messaging.smsSenderId,
      route: '4',
      country: '91',
    });
    const url = `https://control.msg91.com/api/sendhttp.php?${params.toString()}`;
    const res = await fetch(url);
    const text = await res.text();
    if (!res.ok || text.toLowerCase().includes('error')) {
      throw new Error(`MSG91 error: ${text.slice(0, 120)}`);
    }
    logger.info('SMS sent via MSG91', { to: mobile, requestId: text.trim() });
    return { delivered: true, provider: 'msg91', externalId: text.trim() };
  }

  if (provider === 'twilio' && config.messaging.twilioAccountSid) {
    const auth = Buffer.from(
      `${config.messaging.twilioAccountSid}:${config.messaging.twilioAuthToken}`
    ).toString('base64');
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.messaging.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+${mobile}`,
          From: config.messaging.twilioSmsFrom,
          Body: body,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Twilio SMS failed');
    logger.info('SMS sent via Twilio', { to: mobile, sid: data.sid });
    return { delivered: true, provider: 'twilio', externalId: data.sid };
  }

  logger.info('SMS (dev/stub)', { to: mobile, body: body.slice(0, 80) });
  return { delivered: false, provider: 'stub', externalId: null };
}

async function sendWhatsApp({ to, body }) {
  const mobile = normalizeIndianMobile(to);

  if (config.messaging.whatsappProvider === 'twilio' && config.messaging.twilioAccountSid) {
    const auth = Buffer.from(
      `${config.messaging.twilioAccountSid}:${config.messaging.twilioAuthToken}`
    ).toString('base64');
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.messaging.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:+${mobile}`,
          From: config.messaging.twilioWhatsAppFrom,
          Body: body,
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Twilio WhatsApp failed');
    logger.info('WhatsApp sent via Twilio', { to: mobile, sid: data.sid });
    return { delivered: true, provider: 'twilio_whatsapp', externalId: data.sid };
  }

  logger.info('WhatsApp (dev/stub)', { to: mobile, body: body.slice(0, 80) });
  return { delivered: false, provider: 'stub', externalId: null };
}

async function sendChannelMessage({ channel, recipient, body, subject }) {
  const footer = `\n\n— MaatriDev | ${config.messaging.supportPhone} | ${config.messaging.supportEmail}`;
  const fullBody = body.includes('MaatriDev') ? body : `${body}${footer}`;

  if (channel === 'email') {
    const result = await sendGenericEmail({
      to: recipient,
      subject: subject || 'Message from your clinic — Doctor CRM',
      text: fullBody,
      html: `<p>${fullBody.replace(/\n/g, '<br/>')}</p>`,
    });
    return { ...result, provider: result.delivered ? 'smtp' : 'stub' };
  }
  if (channel === 'whatsapp') {
    return sendWhatsApp({ to: recipient, body: fullBody });
  }
  return sendSms({ to: recipient, body: fullBody });
}

function getProviderStatus() {
  const smsReady =
    (config.messaging.smsProvider === 'msg91' && !!config.messaging.msg91AuthKey) ||
    (config.messaging.smsProvider === 'twilio' && !!config.messaging.twilioAccountSid);
  const whatsappReady =
    config.messaging.whatsappProvider === 'twilio' && !!config.messaging.twilioAccountSid;
  const emailReady = !!config.email.smtpHost;

  return {
    supportPhone: config.messaging.supportPhone,
    supportEmail: config.messaging.supportEmail,
    sms: { provider: config.messaging.smsProvider, configured: smsReady, mode: smsReady ? 'live' : 'stub' },
    whatsapp: {
      provider: config.messaging.whatsappProvider,
      configured: whatsappReady,
      mode: whatsappReady ? 'live' : 'stub',
    },
    email: { configured: emailReady, mode: emailReady ? 'live' : 'stub', from: config.email.from },
  };
}

module.exports = { sendChannelMessage, getProviderStatus, normalizeIndianMobile };
