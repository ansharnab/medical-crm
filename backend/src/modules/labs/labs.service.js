const { LabOrder, LabResult, Patient, User } = require('../../models');
const patientRepository = require('../../repositories/patient.repository');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError, ForbiddenError } = require('../../utils/errors');
const { validateCreateOrder, validateUpdateOrder, validateResult } = require('./labs.dto');

function formatOrder(order) {
  const plain = order.get ? order.get({ plain: true }) : order;
  return {
    id: plain.id,
    consultationId: plain.consultationId,
    patientId: plain.patientId,
    doctorId: plain.doctorId,
    testName: plain.testName,
    status: plain.status,
    notes: plain.notes,
    patient: plain.patient
      ? { id: plain.patient.id, firstName: plain.patient.firstName, lastName: plain.patient.lastName }
      : undefined,
    doctor: plain.doctor
      ? { id: plain.doctor.id, firstName: plain.doctor.firstName, lastName: plain.doctor.lastName }
      : undefined,
    result: plain.result
      ? {
          id: plain.result.id,
          resultText: plain.result.resultText,
          fileUrl: plain.result.fileUrl,
          recordedAt: plain.result.recordedAt,
        }
      : null,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

const includes = [
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName'] },
  { model: User, as: 'doctor', attributes: ['id', 'firstName', 'lastName'] },
  { model: LabResult, as: 'result' },
];

class LabsService {
  async list(organizationId, query, actor) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const where = { organizationId };
    if (query.status) where.status = query.status;
    if (actor.role === 'doctor') where.doctorId = actor.id;
    if (query.patientId) where.patientId = query.patientId;

    const { count, rows } = await LabOrder.findAndCountAll({
      where,
      include: includes,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: rows.map(formatOrder),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateOrder(body);
    if (error) throw new ValidationError('Validation failed', error);

    const patient = await patientRepository.findByIdInOrganization(value.patientId, organizationId);
    if (!patient) throw new NotFoundError('Patient not found');

    const order = await LabOrder.create({
      organizationId,
      patientId: value.patientId,
      consultationId: value.consultationId || null,
      doctorId: actor.id,
      testName: value.testName,
      notes: value.notes,
      status: 'ordered',
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'lab.order_created',
      entityType: 'lab_order',
      entityId: order.id,
      ipAddress,
    });

    const full = await LabOrder.findByPk(order.id, { include: includes });
    return formatOrder(full);
  }

  async update(organizationId, id, body, actor, ipAddress) {
    const { error, value } = validateUpdateOrder(body);
    if (error) throw new ValidationError('Validation failed', error);

    const order = await LabOrder.findOne({ where: { id, organizationId } });
    if (!order) throw new NotFoundError('Lab order not found');
    if (actor.role === 'doctor' && order.doctorId !== actor.id) {
      throw new ForbiddenError('Insufficient permissions');
    }

    await order.update(value);
    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'lab.order_updated',
      entityType: 'lab_order',
      entityId: id,
      metadata: value,
      ipAddress,
    });

    const full = await LabOrder.findByPk(id, { include: includes });
    return formatOrder(full);
  }

  async saveResult(organizationId, id, body, actor, ipAddress) {
    const { error, value } = validateResult(body);
    if (error) throw new ValidationError('Validation failed', error);

    const order = await LabOrder.findOne({ where: { id, organizationId } });
    if (!order) throw new NotFoundError('Lab order not found');

    let result = await LabResult.findOne({ where: { labOrderId: id } });
    if (!result) {
      result = await LabResult.create({ labOrderId: id, ...value, recordedAt: new Date() });
    } else {
      await result.update({ ...value, recordedAt: new Date() });
    }

    if (order.status !== 'completed') {
      await order.update({ status: 'completed' });
    }

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'lab.result_saved',
      entityType: 'lab_order',
      entityId: id,
      ipAddress,
    });

    const full = await LabOrder.findByPk(id, { include: includes });
    return formatOrder(full);
  }
}

module.exports = new LabsService();
