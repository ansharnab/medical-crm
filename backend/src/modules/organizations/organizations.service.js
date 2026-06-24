const organizationRepository = require('../../repositories/organization.repository');
const userRepository = require('../../repositories/user.repository');
const { hashPassword } = require('../auth/auth.service');
const { writeAudit } = require('../audit/audit.service');
const {
  sendClinicVerificationEmail,
  sendClientAdminCredentialsEmail,
  generateVerificationToken,
  generateTemporaryPassword,
  getVerificationExpiry,
} = require('../email/email.service');
const { slugify } = require('../../utils/slugify');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../../utils/errors');
const {
  validateCreateOrganization,
  validateUpdateOrganization,
  validateCreateClientAdmin,
  validateUpdateClientAdmin,
} = require('./organizations.dto');

function formatClientAdmin(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    organizationId: user.organizationId,
    status: user.status,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function formatOrganization(org) {
  const adminCount = org.users
    ? org.users.filter((u) => u.role === 'client_admin' && u.status === 'active').length
    : 0;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    email: org.email,
    phone: org.phone,
    addressLine1: org.addressLine1,
    addressLine2: org.addressLine2,
    city: org.city,
    state: org.state,
    pincode: org.pincode,
    timezone: org.timezone,
    status: org.status,
    emailVerifiedAt: org.emailVerifiedAt,
    emailVerified: Boolean(org.emailVerifiedAt),
    subscriptionPlan: org.subscriptionPlan || 'starter',
    subscriptionStatus: org.subscriptionStatus || 'trial',
    trialEndsAt: org.trialEndsAt,
    adminCount,
    users: org.users
      ? org.users.map((u) => formatClientAdmin(u))
      : undefined,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

async function generateUniqueSlug(name) {
  let base = slugify(name) || 'clinic';
  let slug = base;
  let counter = 1;

  while (await organizationRepository.findBySlug(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function assertOrganizationEmailAvailable(email, excludeOrgId = null) {
  const normalized = email.toLowerCase();
  const existingOrg = await organizationRepository.findByEmail(normalized);
  if (existingOrg && existingOrg.id !== excludeOrgId) {
    throw new ConflictError('This email is already registered to another clinic');
  }
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

async function issueVerification(org, actor, ipAddress, action = 'organization.verification_sent') {
  const token = generateVerificationToken();
  const expiresAt = getVerificationExpiry();

  await organizationRepository.update(org.id, {
    emailVerificationToken: token,
    emailVerificationExpiresAt: expiresAt,
    status: 'pending',
    emailVerifiedAt: null,
  });

  const emailResult = await sendClinicVerificationEmail({
    to: org.email,
    clinicName: org.name,
    token,
  });

  await writeAudit({
    userId: actor?.id || null,
    organizationId: org.id,
    action,
    entityType: 'organization',
    entityId: org.id,
    metadata: { email: org.email, delivered: emailResult.delivered },
    ipAddress,
  });

  return emailResult;
}

class OrganizationsService {
  async list(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
    const { rows, count } = await organizationRepository.findAll({
      page,
      limit,
      search: query.search,
      status: query.status,
    });

    return {
      data: rows.map(formatOrganization),
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getById(id) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');
    return formatOrganization(org);
  }

  async create(body, actor, ipAddress) {
    const { error, value } = validateCreateOrganization(body);
    if (error) throw new ValidationError('Validation failed', error);

    value.email = value.email.toLowerCase();
    await assertOrganizationEmailAvailable(value.email);

    const slug = await generateUniqueSlug(value.name);
    const org = await organizationRepository.create({
      ...value,
      email: value.email,
      slug,
      status: 'pending',
    });

    const emailResult = await issueVerification(org, actor, ipAddress, 'organization.created');

    await writeAudit({
      userId: actor.id,
      organizationId: org.id,
      action: 'organization.created',
      entityType: 'organization',
      entityId: org.id,
      metadata: { name: org.name, slug: org.slug },
      ipAddress,
    });

    const formatted = formatOrganization(await organizationRepository.findById(org.id));
    return {
      ...formatted,
      verificationEmailSent: true,
      verificationUrl: emailResult.verifyUrl,
    };
  }

  async update(id, body, actor, ipAddress) {
    const { error, value } = validateUpdateOrganization(body);
    if (error) throw new ValidationError('Validation failed', error);

    const existing = await organizationRepository.findById(id);
    if (!existing) throw new NotFoundError('Organization not found');

    if (value.email) {
      value.email = value.email.toLowerCase();
      if (value.email !== existing.email) {
        await assertOrganizationEmailAvailable(value.email, id);
        value.emailVerifiedAt = null;
        value.status = 'pending';
      }
    }

    if (value.status === 'active' && !existing.emailVerifiedAt && value.email === existing.email) {
      throw new ValidationError('Clinic email must be verified before activation', [
        { field: 'status', message: 'Verify clinic email first or wait for verification link' },
      ]);
    }

    if (value.name && value.name !== existing.name) {
      value.slug = await generateUniqueSlug(value.name);
    }

    delete value.emailVerificationToken;
    delete value.emailVerificationExpiresAt;

    await organizationRepository.update(id, value);
    const updated = await organizationRepository.findById(id);

    if (value.email && value.email !== existing.email) {
      await issueVerification(updated, actor, ipAddress, 'organization.verification_resent');
    }

    await writeAudit({
      userId: actor.id,
      organizationId: updated.id,
      action: value.status ? 'organization.status_changed' : 'organization.updated',
      entityType: 'organization',
      entityId: updated.id,
      metadata: value,
      ipAddress,
    });

    return formatOrganization(updated);
  }

  async verifyEmail(token) {
    if (!token) throw new ValidationError('Verification token is required');

    const org = await organizationRepository.findByVerificationToken(token);
    if (!org) throw new NotFoundError('Invalid or expired verification link');

    if (org.emailVerificationExpiresAt && new Date(org.emailVerificationExpiresAt) < new Date()) {
      throw new ValidationError('Verification link has expired. Please request a new one.');
    }

    await organizationRepository.update(org.id, {
      emailVerifiedAt: new Date(),
      status: 'active',
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    });

    await writeAudit({
      userId: null,
      organizationId: org.id,
      action: 'organization.email_verified',
      entityType: 'organization',
      entityId: org.id,
      metadata: { email: org.email },
      ipAddress: null,
    });

    return formatOrganization(await organizationRepository.findById(org.id));
  }

  async resendVerification(id, actor, ipAddress) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');
    if (org.emailVerifiedAt) {
      throw new ValidationError('Clinic email is already verified');
    }

    const emailResult = await issueVerification(org, actor, ipAddress, 'organization.verification_resent');

    return {
      message: 'Verification email sent',
      verificationUrl: emailResult.verifyUrl,
    };
  }

  async createClientAdmin(organizationId, body, actor, ipAddress) {
    const { error, value } = validateCreateClientAdmin(body);
    if (error) throw new ValidationError('Validation failed', error);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    if (!org.emailVerifiedAt || org.status !== 'active') {
      throw new ForbiddenError('Clinic must verify email and be active before adding client admin');
    }

    value.email = value.email.toLowerCase();
    await assertUserEmailAvailableInOrganization(value.email, org.id);

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const user = await userRepository.create({
      email: value.email,
      passwordHash,
      firstName: value.firstName,
      lastName: value.lastName,
      phone: value.phone,
      role: 'client_admin',
      status: 'active',
      organizationId: org.id,
      mustChangePassword: true,
    });

    const emailResult = await sendClientAdminCredentialsEmail({
      to: user.email,
      firstName: user.firstName,
      clinicName: org.name,
      password: temporaryPassword,
    });

    await writeAudit({
      userId: actor.id,
      organizationId: org.id,
      action: 'client_admin.created',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, credentialsEmailSent: emailResult.delivered },
      ipAddress,
    });

    return {
      ...formatClientAdmin(user),
      credentialsEmailSent: true,
      devPassword: emailResult.devPassword,
    };
  }

  async updateClientAdmin(organizationId, userId, body, actor, ipAddress) {
    const { error, value } = validateUpdateClientAdmin(body);
    if (error) throw new ValidationError('Validation failed', error);

    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const existing = await userRepository.findByIdInOrganization(userId, organizationId);
    if (!existing || existing.role !== 'client_admin') {
      throw new NotFoundError('Client admin not found');
    }

    if (value.email) {
      value.email = value.email.toLowerCase();
      if (value.email !== existing.email) {
        await assertUserEmailAvailableInOrganization(value.email, org.id, userId);
      }
    }

    await userRepository.update(userId, value);
    const updated = await userRepository.findByIdInOrganization(userId, organizationId);

    await writeAudit({
      userId: actor.id,
      organizationId: org.id,
      action: 'client_admin.updated',
      entityType: 'user',
      entityId: userId,
      metadata: value,
      ipAddress,
    });

    return formatClientAdmin(updated);
  }

  async deleteClientAdmin(organizationId, userId, actor, ipAddress) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const existing = await userRepository.findByIdInOrganization(userId, organizationId);
    if (!existing || existing.role !== 'client_admin') {
      throw new NotFoundError('Client admin not found');
    }

    await userRepository.hardDelete(userId);

    await writeAudit({
      userId: actor.id,
      organizationId: org.id,
      action: 'client_admin.deleted',
      entityType: 'user',
      entityId: userId,
      metadata: { email: existing.email },
      ipAddress,
    });

    return { message: 'Client admin deleted successfully' };
  }

  async resendClientAdminPassword(organizationId, userId, actor, ipAddress) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) throw new NotFoundError('Organization not found');

    const user = await userRepository.findByIdInOrganization(userId, organizationId);
    if (!user || user.role !== 'client_admin') {
      throw new NotFoundError('Client admin not found');
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    await userRepository.updatePassword(user.id, passwordHash, true);

    const emailResult = await sendClientAdminCredentialsEmail({
      to: user.email,
      firstName: user.firstName,
      clinicName: org.name,
      password: temporaryPassword,
      isReset: true,
    });

    await writeAudit({
      userId: actor.id,
      organizationId: org.id,
      action: 'client_admin.password_resent',
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, credentialsEmailSent: emailResult.delivered },
      ipAddress,
    });

    return {
      message:
        'A new temporary password has been emailed. Their previous password no longer works and they must change the password on next login.',
      devPassword: emailResult.devPassword,
    };
  }

  async delete(id, actor, ipAddress) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new NotFoundError('Organization not found');

    const metadata = { name: org.name, email: org.email, slug: org.slug };
    await organizationRepository.hardDelete(id);

    await writeAudit({
      userId: actor.id,
      organizationId: null,
      action: 'organization.deleted',
      entityType: 'organization',
      entityId: id,
      metadata,
      ipAddress,
    });

    return { message: 'Clinic deleted successfully' };
  }
}

module.exports = new OrganizationsService();
module.exports.formatOrganization = formatOrganization;
