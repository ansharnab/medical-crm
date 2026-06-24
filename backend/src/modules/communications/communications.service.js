const { MessageTemplate, MessageLog } = require('../../models');
const logger = require('../../utils/logger');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError } = require('../../utils/errors');
const { validateSend, validateTemplate } = require('./communications.dto');
const messagingService = require('../messaging/messaging.service');

function formatTemplate(t) {
  return {
    id: t.id,
    name: t.name,
    channel: t.channel,
    body: t.body,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function formatLog(log) {
  return {
    id: log.id,
    patientId: log.patientId,
    channel: log.channel,
    recipient: log.recipient,
    body: log.body,
    status: log.status,
    createdAt: log.createdAt,
  };
}

class CommunicationsService {
  getConfig() {
    return messagingService.getProviderStatus();
  }

  async listTemplates(organizationId) {
    const rows = await MessageTemplate.findAll({
      where: { organizationId },
      order: [['name', 'ASC']],
    });
    return { data: rows.map(formatTemplate) };
  }

  async createTemplate(organizationId, body, actor, ipAddress) {
    const { error, value } = validateTemplate(body);
    if (error) throw new ValidationError('Validation failed', error);

    const template = await MessageTemplate.create({ organizationId, ...value });
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'communications.template_created',
      entityType: 'message_template',
      entityId: template.id,
      ipAddress,
    });
    return formatTemplate(template);
  }

  async listLogs(organizationId, query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { count, rows } = await MessageLog.findAndCountAll({
      where: { organizationId },
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    return {
      data: rows.map(formatLog),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async send(organizationId, body, actor, ipAddress) {
    const { error, value } = validateSend(body);
    if (error) throw new ValidationError('Validation failed', error);

    let status = 'queued';
    let deliveryMeta = {};

    try {
      const result = await messagingService.sendChannelMessage({
        channel: value.channel,
        recipient: value.recipient,
        body: value.body,
        subject: value.subject,
      });
      status = result.delivered ? 'sent' : 'stub_logged';
      deliveryMeta = { provider: result.provider, externalId: result.externalId };
    } catch (err) {
      logger.error('Message delivery failed', { error: err.message, channel: value.channel });
      status = 'failed';
      deliveryMeta = { error: err.message };
    }

    const log = await MessageLog.create({
      organizationId,
      patientId: value.patientId || null,
      channel: value.channel,
      recipient: value.recipient,
      body: value.body,
      status,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'communications.sent',
      entityType: 'message_log',
      entityId: log.id,
      metadata: { channel: value.channel, status, ...deliveryMeta },
      ipAddress,
    });

    return formatLog(log);
  }

  async deleteTemplate(organizationId, id) {
    const template = await MessageTemplate.findOne({ where: { id, organizationId } });
    if (!template) throw new NotFoundError('Template not found');
    await template.destroy();
    return { deleted: true };
  }
}

module.exports = new CommunicationsService();
