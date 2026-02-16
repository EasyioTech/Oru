/**
 * Agency Services Index
 * 
 * Exports all agency-related services.
 */

const { createAgency, PLAN_LIMITS } = require('./agencyCreationService');
const { 
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
} = require('./agencyDomainService');
const { 
  checkSetupStatus, 
  getSetupProgress, 
  completeAgencySetup,
  SETUP_STEPS,
} = require('./agencySetupService');
const { 
  repairAgencyDatabase, 
  verifyDatabaseIntegrity,
  fixCommonIssues,
} = require('./agencyRepairService');
const {
  createJob,
  getJobById,
  runProvisioningInBackground,
  JOB_STATUS,
} = require('./agencyProvisioningService');
const { updateAgencySettings } = require('./agencySettingsService');

module.exports = {
  // Creation (sync - used by provisioning worker)
  createAgency,
  PLAN_LIMITS,
  // Async provisioning
  createJob,
  getJobById,
  runProvisioningInBackground,
  JOB_STATUS,
  
  // Domain & Name validation
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
  
  // Setup
  checkSetupStatus,
  getSetupProgress,
  completeAgencySetup,
  SETUP_STEPS,
  
  // Repair
  repairAgencyDatabase,
  verifyDatabaseIntegrity,
  fixCommonIssues,

  // Settings
  updateAgencySettings,
};
