const { Op, QueryTypes } = require('sequelize');
const { Organization, User, Patient, Appointment, sequelize } = require('../../models');
const organizationRepository = require('../../repositories/organization.repository');
const userRepository = require('../../repositories/user.repository');
const patientRepository = require('../../repositories/patient.repository');
const appointmentRepository = require('../../repositories/appointment.repository');
const paymentRepository = require('../../repositories/payment.repository');
const followupRepository = require('../../repositories/followup.repository');
const { NotFoundError } = require('../../utils/errors');

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n) {
  const d = startOfDay();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

class AnalyticsService {
  async getPlatformStats() {
    const statusCounts = await organizationRepository.countByStatus();

    const totalClinics = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
    const activeClinics = statusCounts.active || 0;
    const suspendedClinics = statusCounts.suspended || 0;
    const pendingClinics = statusCounts.pending || 0;

    const totalUsers = await User.count({
      where: { role: { [Op.ne]: 'super_admin' } },
    });

    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { role: { [Op.ne]: 'super_admin' } },
      group: ['role'],
      raw: true,
    });

    const roleBreakdown = usersByRole.reduce((acc, row) => {
      acc[row.role] = parseInt(row.count, 10);
      return acc;
    }, {});

    const totalAppointments = await Appointment.count();
    const todayStart = startOfDay();
    const todayEnd = endOfDay();
    const todayAppointments = await Appointment.count({
      where: { scheduledAt: { [Op.between]: [todayStart, todayEnd] } },
    });

    const recentClinics = await Organization.findAll({
      attributes: ['id', 'name', 'city', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    return {
      clinics: {
        total: totalClinics,
        active: activeClinics,
        suspended: suspendedClinics,
        pending: pendingClinics,
      },
      users: {
        total: totalUsers,
        byRole: roleBreakdown,
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
      },
      recentClinics: recentClinics.map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city,
        status: c.status,
        createdAt: c.createdAt,
      })),
    };
  }

  async getPeakInsights(organizationId) {
    const since = daysAgo(30);

    const hourRows = await Appointment.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal("HOUR FROM scheduled_at AT TIME ZONE 'UTC'")), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        organizationId,
        scheduledAt: { [Op.gte]: since },
        status: { [Op.notIn]: ['cancelled'] },
      },
      group: [sequelize.literal("EXTRACT(HOUR FROM scheduled_at AT TIME ZONE 'UTC')")],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 1,
      raw: true,
    });

    const dayRows = await Appointment.findAll({
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('DOW FROM scheduled_at')), 'dow'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: {
        organizationId,
        scheduledAt: { [Op.gte]: since },
        status: { [Op.notIn]: ['cancelled'] },
      },
      group: [sequelize.literal('EXTRACT(DOW FROM scheduled_at)')],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 1,
      raw: true,
    });

    const peakHour = hourRows[0] ? parseInt(hourRows[0].hour, 10) : null;
    const peakDay = dayRows[0] ? DAY_NAMES[parseInt(dayRows[0].dow, 10)] : null;

    return { peakHour, peakDay };
  }

  async getClinicDashboard(organizationId) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);

    const [totalPatients, newPatients, doctorCount, receptionistCount] = await Promise.all([
      patientRepository.countInOrganization(organizationId),
      Patient.count({
        where: { organizationId, createdAt: { [Op.gte]: monthStart } },
      }),
      User.count({ where: { organizationId, role: 'doctor', status: 'active' } }),
      User.count({ where: { organizationId, role: 'receptionist', status: 'active' } }),
    ]);

    const [apptToday, apptWeek, apptMonth] = await Promise.all([
      Appointment.count({
        where: {
          organizationId,
          scheduledAt: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.notIn]: ['cancelled'] },
        },
      }),
      Appointment.count({
        where: {
          organizationId,
          scheduledAt: { [Op.gte]: weekStart },
          status: { [Op.notIn]: ['cancelled'] },
        },
      }),
      Appointment.count({
        where: {
          organizationId,
          scheduledAt: { [Op.gte]: monthStart },
          status: { [Op.notIn]: ['cancelled'] },
        },
      }),
    ]);

    const [revToday, revWeek, revMonth] = await Promise.all([
      paymentRepository.sumPaidInRange(organizationId, todayStart, todayEnd),
      paymentRepository.sumPaidInRange(organizationId, weekStart, todayEnd),
      paymentRepository.sumPaidInRange(organizationId, monthStart, todayEnd),
    ]);

    const { rows: doctors } = await userRepository.findAllInOrganization(organizationId, {
      page: 1,
      limit: 100,
      role: 'doctor',
      status: 'active',
    });

    const doctorStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [patients, revenueRows, appointments] = await Promise.all([
          Appointment.count({
            where: { organizationId, doctorId: doctor.id },
            distinct: true,
            col: 'patientId',
          }),
          sequelize.query(
            `SELECT COALESCE(SUM(p.amount_paid), 0) AS total
             FROM payments p
             INNER JOIN appointments a ON a.id = p.appointment_id
             WHERE p.organization_id = :organizationId AND a.doctor_id = :doctorId
             AND p.status IN ('paid', 'partial')`,
            {
              replacements: { organizationId, doctorId: doctor.id },
              type: QueryTypes.SELECT,
            }
          ),
          Appointment.count({
            where: {
              organizationId,
              doctorId: doctor.id,
              status: { [Op.notIn]: ['cancelled'] },
            },
          }),
        ]);
        const revenue = Number(revenueRows[0]?.total || 0);

        return {
          doctorId: doctor.id,
          name: `${doctor.firstName} ${doctor.lastName}`,
          patients: patients || 0,
          revenue,
          appointments: appointments || 0,
        };
      })
    );

    const mostActive = [...doctorStats].sort((a, b) => b.appointments - a.appointments)[0];
    const { peakHour, peakDay } = await this.getPeakInsights(organizationId);
    const avgRevenuePerPatient =
      totalPatients > 0 ? Math.round((revMonth / totalPatients) * 100) / 100 : null;

    return {
      patients: {
        total: totalPatients,
        new: newPatients,
        returning: Math.max(totalPatients - newPatients, 0),
      },
      appointments: { today: apptToday, week: apptWeek, month: apptMonth },
      revenue: { today: revToday, week: revWeek, month: revMonth },
      staff: {
        doctors: doctorCount,
        receptionists: receptionistCount,
        total: doctorCount + receptionistCount,
      },
      doctors: doctorStats,
      insights: {
        peakHour,
        peakDay,
        mostActiveDoctor: mostActive ? `Dr. ${mostActive.name.split(' ').pop()}` : null,
        avgRevenuePerPatient,
      },
    };
  }

  async getReceptionDashboard(organizationId) {
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const [patientsToday, revenueToday, waitingCount, pendingAppointments, pendingFollowups] =
      await Promise.all([
        Patient.count({
          where: { organizationId, createdAt: { [Op.between]: [todayStart, todayEnd] } },
        }),
        paymentRepository.sumPaidInRange(organizationId, todayStart, todayEnd),
        Appointment.count({
          where: {
            organizationId,
            scheduledAt: { [Op.between]: [todayStart, todayEnd] },
            status: { [Op.in]: ['confirmed', 'waiting'] },
          },
        }),
        Appointment.count({
          where: {
            organizationId,
            scheduledAt: { [Op.between]: [todayStart, todayEnd] },
            status: { [Op.in]: ['scheduled', 'confirmed'] },
          },
        }),
        followupRepository.countPending(organizationId),
      ]);

    return {
      date: today,
      patientsToday,
      revenueToday,
      waitingCount,
      pendingAppointments,
      pendingFollowups,
    };
  }

  async getDoctorDashboard(organizationId, doctorId) {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const [totalToday, waiting, completed, inConsultation] = await Promise.all([
      Appointment.count({
        where: {
          organizationId,
          doctorId,
          scheduledAt: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.notIn]: ['cancelled'] },
        },
      }),
      Appointment.count({
        where: {
          organizationId,
          doctorId,
          scheduledAt: { [Op.between]: [todayStart, todayEnd] },
          status: { [Op.in]: ['confirmed', 'waiting'] },
        },
      }),
      Appointment.count({
        where: {
          organizationId,
          doctorId,
          scheduledAt: { [Op.between]: [todayStart, todayEnd] },
          status: 'completed',
        },
      }),
      Appointment.count({
        where: {
          organizationId,
          doctorId,
          scheduledAt: { [Op.between]: [todayStart, todayEnd] },
          status: 'in_consultation',
        },
      }),
    ]);

    const pendingFollowups = await followupRepository.countPending(organizationId, doctorId);

    return {
      date: new Date().toISOString().slice(0, 10),
      appointmentsToday: totalToday,
      waiting,
      completed,
      inConsultation,
      pendingFollowups,
    };
  }
}

module.exports = new AnalyticsService();
