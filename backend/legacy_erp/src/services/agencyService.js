/**
 * Agency Service (Backward Compatibility)
 * 
 * Re-exports from modular agency services.
 * @deprecated Import from './agency' instead
 */

const {
  createAgency,
  PLAN_LIMITS,
  checkDomainAvailability,
  validateDomainFormat,
  validateAgencyName,
  extractSubdomain,
  generateDatabaseName,
  generateSlugFromName,
  sanitizeForDomain,
  containsBlockedTerm,
  VALID_DOMAIN_SUFFIXES,
  RESERVED_SUBDOMAINS,
  BLOCKED_TERMS,
  DOMAIN_ERROR_CODES,
  MIN_SUBDOMAIN_LENGTH,
  MAX_SUBDOMAIN_LENGTH,
  checkSetupStatus,
  getSetupProgress,
  completeAgencySetup,
  SETUP_STEPS,
  repairAgencyDatabase,
  verifyDatabaseIntegrity,
  fixCommonIssues,
} = require('./agency');

module.exports = {
  createAgency,
  PLAN_LIMITS,
  checkDomainAvailability,
  validateDomainFormat,
  validateAgencyName,
  extractSubdomain,
  generateDatabaseName,
  generateSlugFromName,
  sanitizeForDomain,
  containsBlockedTerm,
  VALID_DOMAIN_SUFFIXES,
  RESERVED_SUBDOMAINS,
  BLOCKED_TERMS,
  DOMAIN_ERROR_CODES,
  MIN_SUBDOMAIN_LENGTH,
  MAX_SUBDOMAIN_LENGTH,
  checkSetupStatus,
  getSetupProgress,
  completeAgencySetup,
  SETUP_STEPS,
  repairAgencyDatabase,
  verifyDatabaseIntegrity,
  fixCommonIssues,
};
