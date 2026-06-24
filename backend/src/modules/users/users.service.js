const userRepository = require('../../repositories/user.repository');
const organizationRepository = require('../../repositories/organization.repository');
const { hashPassword } = require('../auth/auth.service');
const { writeAudit } = require('../audit/audit.service');
const { sendStaffCredentialsEmail, generateTemporaryPassword } = require('../email/email.service');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../../utils/errors');
const { validateCreateUser, validateUpdateUser } = require('./users.dto');

const STAFF_ROLES = ['doctor', 'receptionist'];

function formatUser(user, { minimal = false } = {}) {
  if (minimal) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      specialization: user.specialization,
      consultationFee: user.consultationFee ? Number(user.consultationFee) : null,
    };
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    status: user.status,
    specialization: user.specialization,
    consultationFee: user.consultationFee ? Number(user.consultationFee) : null,
    mustChangePassword: Boolean(user.mustChangePassword),
    organizationId: user.organizationId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function assertUserEmailAvailableInOrganization(email, organizationId, excludeUserId = null) {
  const existingUser = await userRepository.findByEmailInOrganization(
    email,
    organizationId,
    excludeUserId
  );
  if (existingUser) {
    throw new ConflictError('This email is already registered in this clinic');
  }
}

async function getStaffUser(organizationId, userId) {
  const user = await userRepository.findByIdInOrganization(userId, organizationId);
  if (!user || !STAFF_ROLES.includes(user.role)) {
    throw new NotFoundError('User not found');
  }
  return user;
}

class UsersService {
  async list(organizationId, query, actor) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const minimal = actor?.role === 'receptionist';

    if (minimal) {
      query.role = 'doctor';
      query.status = query.status || 'active';
    }

    const { rows, count } = await userRepository.findAllInOrganization(organizationId, {
      page,
      limit,
      role: query.role && STAFF_ROLES.includes(query.role) ? query.role : undefined,
      roles: query.role ? undefined : STAFF_ROLES,
      status: query.status,
      search: query.search,
    });

    return {
      data: rows.map((user) => formatUser(user, { minimal })),
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }

  async getById(organizationId, userId) {
    const user = await getStaffUser(organizationId, userId);
    return formatUser(user);
  }

  async create(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateUser(body);
    if (error) throw new ValidationError('Validation failed', error);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');
    if (!org.emailVerifiedAt || org.status !== 'active') {
      throw new ForbiddenError('Clinic must be active before adding staff');
    }

    value.email = value.email.toLowerCase();
    await assertUserEmailAvailableInOrganization(value.email, organizationId);

    if (value.role === 'receptionist') {
      delete value.specialization;
      delete value.consultationFee;
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const user = await userRepository.create({
      email: value.email,
      passwordHash,
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      role: value.role,
      specialization: value.specialization,
      consultationFee: value.consultationFee,
      status: 'active',
      organizationId,
      mustChangePassword: true,
    });

    const emailResult = await sendStaffCredentialsEmail({
      to: user.email,
      firstName: user.firstName,
      clinicName: org.name,
      password: temporaryPassword,
      role: user.role,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'user.created',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role, credentialsEmailSent: emailResult.delivered },
      ipAddress,
    });

    return {
      ...formatUser(user),
      credentialsEmailSent: true,
      devPassword: emailResult.devPassword,
    };
  }

  async update(organizationId, userId, body, actor, ipAddress) {
    const { error, value } = validateUpdateUser(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await getStaffUser(organizationId, userId);

    if (value.email) {
      value.email = value.email.toLowerCase();
      if (value.email !== existing.email) {
        await assertUserEmailAvailableInOrganization(value.email, organizationId, userId);
      }
    }

    if (existing.role === 'receptionist') {
      delete value.specialization;
      delete value.consultationFee;
    }

    await userRepository.update(userId, value);
    const updated = await getStaffUser(organizationId, userId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'user.updated',
      entityType: 'user',
      entityId: userId,
      metadata: value,
      ipAddress,
    });

    return formatUser(updated);
  }

  async delete(organizationId, userId, actor, ipAddress) {
    const existing = await getStaffUser(organizationId, userId);
    await userRepository.hardDelete(userId);

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'user.deleted',
      entityType: 'user',
      entityId: userId,
      metadata: { email: existing.email, role: existing.role },
      ipAddress,
    });

    return { message: 'User deleted successfully' };
  }

  async resendPassword(organizationId, userId, actor, ipAddress) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const user = await getStaffUser(organizationId, userId);
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    await userRepository.updatePassword(user.id, passwordHash, true);

    const emailResult = await sendStaffCredentialsEmail({
      to: user.email,
      firstName: user.firstName,
      clinicName: org.name,
      password: temporaryPassword,
      role: user.role,
    });

    await writeAudit({
      userId: actor.id,
      organizationId,
      action: 'user.password_resent',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress,
    });

    return {
      message:
        'A new temporary password has been emailed. Their previous password no longer works and they must change the password on next login.',
      devPassword: emailResult.devPassword,
    };
  }
}

module.exports = new UsersService();
module.exports.formatUser = formatUser;
module.exports.STAFF_ROLES = STAFF_ROLES;
