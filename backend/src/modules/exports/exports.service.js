const appointmentRepository = require('../../repositories/appointment.repository');
const paymentRepository = require('../../repositories/payment.repository');
const { ValidationError } = require('../../utils/errors');

function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsvRow(values) {
  return values.map(escapeCsv).join(',');
}

class ExportsService {
  async exportAppointmentsCsv(organizationId, date) {
    if (!date) throw new ValidationError('date query parameter is required');

    const { rows } = await appointmentRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 10000,
      date,
    });

    const header = toCsvRow([
      'Token',
      'Patient Name',
      'Patient Phone',
      'Doctor',
      'Scheduled At',
      'Status',
      'Fee Amount',
    ]);

    const lines = rows.map((appt) =>
      toCsvRow([
        appt.tokenNumber,
        appt.patient ? `${appt.patient.firstName} ${appt.patient.lastName || ''}`.trim() : '',
        appt.patient?.phone,
        appt.doctor ? `Dr. ${appt.doctor.lastName}` : '',
        appt.scheduledAt?.toISOString(),
        appt.status,
        appt.feeAmount,
      ])
    );

    return [header, ...lines].join('\n');
  }

  async exportRevenueCsv(organizationId, date) {
    if (!date) throw new ValidationError('date query parameter is required');

    const { rows } = await paymentRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 10000,
      date,
    });

    const header = toCsvRow([
      'Patient Name',
      'Patient Phone',
      'Amount',
      'Amount Paid',
      'Status',
      'Payment Mode',
      'Paid At',
    ]);

    const lines = rows.map((payment) =>
      toCsvRow([
        payment.patient ? `${payment.patient.firstName} ${payment.patient.lastName || ''}`.trim() : '',
        payment.patient?.phone,
        payment.amount,
        payment.amountPaid,
        payment.status,
        payment.paymentMode,
        payment.paidAt?.toISOString(),
      ])
    );

    return [header, ...lines].join('\n');
  }
}

module.exports = new ExportsService();
