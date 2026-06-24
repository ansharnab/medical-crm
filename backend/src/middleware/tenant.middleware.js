const { ForbiddenError } = require('../utils/errors');

function tenantMiddleware(req, res, next) {
  if (!req.user) {
    return next();
  }

  if (req.user.role === 'super_admin') {
    req.tenantId = req.headers['x-organization-id'] || null;
    return next();
  }

  if (!req.user.organizationId) {
    return next(new ForbiddenError('User is not associated with an organization'));
  }

  req.tenantId = req.user.organizationId;
  return next();
}

function requireTenantMiddleware(req, res, next) {
  if (req.user?.role === 'super_admin') {
    return next();
  }

  if (!req.tenantId) {
    return next(new ForbiddenError('Tenant context required'));
  }

  return next();
}

function assertResourceTenant(resource, tenantId) {
  if (!resource) return;
  const orgId = resource.organizationId || resource.organization_id;
  if (orgId && orgId !== tenantId) {
    throw new ForbiddenError('Cross-tenant access denied');
  }
}

module.exports = {
  tenantMiddleware,
  requireTenantMiddleware,
  assertResourceTenant,
};
