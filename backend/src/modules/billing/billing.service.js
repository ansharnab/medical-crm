const { Invoice, InvoicePayment, Patient } = require('../../models');
const patientRepository = require('../../repositories/patient.repository');
const { writeAudit } = require('../audit/audit.service');
const { ValidationError, NotFoundError } = require('../../utils/errors');
const { validateCreateInvoice, validatePayInvoice, deriveInvoiceStatus } = require('./billing.dto');

function formatInvoice(inv) {
  const plain = inv.get ? inv.get({ plain: true }) : inv;
  return {
    id: plain.id,
    patientId: plain.patientId,
    appointmentId: plain.appointmentId,
    amount: Number(plain.amount),
    gstRate: Number(plain.gstRate),
    gstAmount: Number(plain.gstAmount),
    total: Number(plain.total),
    paidAmount: Number(plain.paidAmount),
    status: plain.status,
    notes: plain.notes,
    patient: plain.patient
      ? { id: plain.patient.id, firstName: plain.patient.firstName, lastName: plain.patient.lastName, phone: plain.patient.phone }
      : undefined,
    payments: (plain.payments || []).map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paymentMode: p.paymentMode,
      createdAt: p.createdAt,
    })),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

const includes = [
  { model: Patient, as: 'patient', attributes: ['id', 'firstName', 'lastName', 'phone'] },
  { model: InvoicePayment, as: 'payments' },
];

class BillingService {
  async list(organizationId, query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const where = { organizationId };
    if (query.status) where.status = query.status;

    const { Op } = require('sequelize');
    if (query.date) {
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(`${query.date}T23:59:59.999Z`);
      where.createdAt = { [Op.between]: [start, end] };
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: includes,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      data: rows.map(formatInvoice),
      meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) || 1 },
    };
  }

  async dailyClosing(organizationId, date) {
    const { Op } = require('sequelize');
    const day = date || new Date().toISOString().slice(0, 10);
    const start = new Date(`${day}T00:00:00.000Z`);
    const end = new Date(`${day}T23:59:59.999Z`);

    const invoices = await Invoice.findAll({
      where: { organizationId, createdAt: { [Op.between]: [start, end] } },
    });

    const totals = invoices.reduce(
      (acc, inv) => {
        acc.totalBilled += Number(inv.total);
        acc.totalPaid += Number(inv.paidAmount);
        if (inv.status === 'paid') acc.paidCount += 1;
        if (inv.status === 'pending' || inv.status === 'partial') acc.pendingCount += 1;
        return acc;
      },
      { totalBilled: 0, totalPaid: 0, paidCount: 0, pendingCount: 0 }
    );

    return { date: day, invoiceCount: invoices.length, ...totals };
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateInvoice(body);
    if (error) throw new ValidationError('Validation failed', error);

    const patient = await patientRepository.findByIdInOrganization(value.patientId, organizationId);
    if (!patient) throw new NotFoundError('Patient not found');

    const gstAmount = Math.round(value.amount * (value.gstRate / 100) * 100) / 100;
    const total = Math.round((value.amount + gstAmount) * 100) / 100;

    const invoice = await Invoice.create({
      organizationId,
      patientId: value.patientId,
      appointmentId: value.appointmentId || null,
      amount: value.amount,
      gstRate: value.gstRate,
      gstAmount,
      total,
      paidAmount: 0,
      status: 'pending',
      notes: value.notes,
      createdBy: actor.id,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
      ipAddress,
    });

    const full = await Invoice.findByPk(invoice.id, { include: includes });
    return formatInvoice(full);
  }

  async pay(organizationId, invoiceId, body, actor, ipAddress) {
    const { error, value } = validatePayInvoice(body);
    if (error) throw new ValidationError('Validation failed', error);

    const invoice = await Invoice.findOne({ where: { id: invoiceId, organizationId } });
    if (!invoice) throw new NotFoundError('Invoice not found');

    const newPaid = Number(invoice.paidAmount) + value.amount;
    const status = deriveInvoiceStatus(Number(invoice.total), newPaid);

    await InvoicePayment.create({
      invoiceId,
      amount: value.amount,
      paymentMode: value.paymentMode,
      collectedBy: actor.id,
    });

    await invoice.update({ paidAmount: newPaid, status });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'invoice.payment',
      entityType: 'invoice',
      entityId: invoiceId,
      metadata: { amount: value.amount, status },
      ipAddress,
    });

    const full = await Invoice.findByPk(invoiceId, { include: includes });
    return formatInvoice(full);
  }
}

module.exports = new BillingService();
