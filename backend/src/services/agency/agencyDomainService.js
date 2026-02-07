/**
 * Agency Domain Service
 * 
 * Handles domain validation and availability checking for agency creation.
 * 
 * @module agencyDomainService
 */

const { pool } = require('../../config/database');

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid domain suffixes for agencies
 */
const VALID_DOMAIN_SUFFIXES = [
  '.app', '.io', '.co', '.com', '.net', '.dev', '.agency', '.tech',
  '.org', '.biz', '.info', '.pro', '.cloud', '.team', '.work', '.studio'
];

/**
 * Reserved subdomains that cannot be used
 */
const RESERVED_SUBDOMAINS = [
  // System paths
  'admin', 'api', 'app', 'auth', 'billing', 'blog', 'cdn', 'dashboard',
  'dev', 'docs', 'help', 'login', 'mail', 'panel', 'portal', 'support',
  'system', 'test', 'www', 'static', 'assets', 'images', 'files',
  'ftp', 'sftp', 'ssh', 'vpn', 'proxy', 'cache', 'db', 'database',
  'server', 'host', 'node', 'cluster', 'backend', 'frontend', 'web',
  // Platform specific
  'oru', 'oru-app', 'oruapp',
  // Protected terms
  'account', 'accounts', 'status', 'health', 'oauth', 'security',
  'root', 'superuser', 'superadmin', 'sysadmin', 'administrator',
  // Business
  'pricing', 'plans', 'enterprise', 'team', 'teams',
  'legal', 'terms', 'privacy', 'about', 'contact', 'careers',
  // Test patterns
  'demo', 'example', 'sample', 'staging', 'production', 'sandbox',
];

/**
 * Inappropriate terms blocked from domains (minimal list - server-side check)
 */
const BLOCKED_TERMS = [
  'fuck', 'shit', 'porn', 'xxx', 'sex', 'nude', 'nsfw',
  'hack', 'phishing', 'scam', 'spam', 'malware',
  'nazi', 'hitler', 'terrorist',
];

/**
 * Error codes
 */
const DOMAIN_ERROR_CODES = {
  REQUIRED: 'DOMAIN_REQUIRED',
  TOO_SHORT: 'DOMAIN_TOO_SHORT',
  TOO_LONG: 'DOMAIN_TOO_LONG',
  INVALID_FORMAT: 'DOMAIN_INVALID_FORMAT',
  INVALID_START: 'DOMAIN_INVALID_START',
  INVALID_END: 'DOMAIN_INVALID_END',
  CONSECUTIVE_HYPHENS: 'DOMAIN_CONSECUTIVE_HYPHENS',
  RESERVED: 'DOMAIN_RESERVED',
  INAPPROPRIATE: 'DOMAIN_INAPPROPRIATE',
  UNAVAILABLE: 'DOMAIN_UNAVAILABLE',
  DB_ERROR: 'DOMAIN_DB_ERROR',
};

const MIN_SUBDOMAIN_LENGTH = 3;
const MAX_SUBDOMAIN_LENGTH = 63;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract subdomain from domain string
 */
function extractSubdomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  return domain.toLowerCase().trim().split('.')[0];
}

/**
 * Check if text contains blocked terms
 */
function containsBlockedTerm(text) {
  if (!text) return { blocked: false };
  const normalized = text.toLowerCase().replace(/[-_]/g, '');
  
  for (const term of BLOCKED_TERMS) {
    if (normalized.includes(term) || text.toLowerCase().includes(term)) {
      return { blocked: true, term };
    }
  }
  return { blocked: false };
}

/**
 * Sanitize text for domain use
 */
function sanitizeForDomain(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SUBDOMAIN_LENGTH);
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate domain format (no database check)
 * 
 * @param {string} domain - Domain to validate
 * @returns {{ valid: boolean, error?: string, code?: string }}
 */
function validateDomainFormat(domain) {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Workspace URL is required', code: DOMAIN_ERROR_CODES.REQUIRED };
  }

  const subdomain = extractSubdomain(domain);

  if (subdomain.length < MIN_SUBDOMAIN_LENGTH) {
    return { 
      valid: false, 
      error: `URL must be at least ${MIN_SUBDOMAIN_LENGTH} characters`,
      code: DOMAIN_ERROR_CODES.TOO_SHORT 
    };
  }

  if (subdomain.length > MAX_SUBDOMAIN_LENGTH) {
    return { 
      valid: false, 
      error: `URL cannot exceed ${MAX_SUBDOMAIN_LENGTH} characters`,
      code: DOMAIN_ERROR_CODES.TOO_LONG 
    };
  }

  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL can only contain lowercase letters, numbers, and hyphens',
      code: DOMAIN_ERROR_CODES.INVALID_FORMAT
    };
  }

  if (!/^[a-z0-9]/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL must start with a letter or number',
      code: DOMAIN_ERROR_CODES.INVALID_START
    };
  }

  if (!/[a-z0-9]$/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL must end with a letter or number',
      code: DOMAIN_ERROR_CODES.INVALID_END
    };
  }

  if (/--/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL cannot contain consecutive hyphens',
      code: DOMAIN_ERROR_CODES.CONSECUTIVE_HYPHENS
    };
  }

  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return { valid: false, error: 'This URL is reserved', code: DOMAIN_ERROR_CODES.RESERVED };
  }

  const blockedCheck = containsBlockedTerm(subdomain);
  if (blockedCheck.blocked) {
    return { valid: false, error: 'This URL is not allowed', code: DOMAIN_ERROR_CODES.INAPPROPRIATE };
  }

  return { valid: true };
}

/**
 * Validate agency name
 * 
 * @param {string} name - Agency name
 * @returns {{ valid: boolean, error?: string }}
 */
function validateAgencyName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Agency name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Name cannot exceed 100 characters' };
  }

  const blockedCheck = containsBlockedTerm(trimmed);
  if (blockedCheck.blocked) {
    return { valid: false, error: 'Name contains inappropriate content' };
  }

  return { valid: true };
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Check if domain is available in the database
 * 
 * IMPORTANT: This function handles database errors gracefully.
 * When DB is unavailable, format validation still works.
 * 
 * @param {string} domain - Domain to check
 * @returns {Promise<{ available: boolean, error?: string, code?: string }>}
 */
async function checkDomainAvailability(domain) {
  // Step 1: Validate format first (no DB needed)
  const formatValidation = validateDomainFormat(domain);
  if (!formatValidation.valid) {
    return { 
      available: false, 
      error: formatValidation.error,
      code: formatValidation.code,
    };
  }

  // Step 2: Check database availability
  let client;
  try {
    client = await pool.connect();
  } catch (connectionError) {
    // Database is unavailable - return gracefully
    console.error('[DomainService] Database connection failed:', connectionError.message);
    return { 
      available: false, 
      error: 'Unable to verify availability. Please try again.',
      code: DOMAIN_ERROR_CODES.DB_ERROR,
      dbError: true,
    };
  }

  // Step 3: Query database
  try {
    const subdomain = extractSubdomain(domain);
    
    const result = await client.query(
      `SELECT id FROM public.agencies 
       WHERE LOWER(SPLIT_PART(domain, '.', 1)) = $1
       OR domain = $2
       LIMIT 1`,
      [subdomain, subdomain]
    );

    if (result.rows.length > 0) {
      return { 
        available: false, 
        error: 'This URL is already taken',
        code: DOMAIN_ERROR_CODES.UNAVAILABLE,
      };
    }

    return { available: true };
  } catch (queryError) {
    console.error('[DomainService] Query error:', queryError.message);
    return { 
      available: false, 
      error: 'Unable to verify availability. Please try again.',
      code: DOMAIN_ERROR_CODES.DB_ERROR,
      dbError: true,
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ============================================================================
// SLUG GENERATION
// ============================================================================

/**
 * Generate URL-safe slug from agency name
 * Handles international characters
 * 
 * @param {string} name - Agency name
 * @returns {string} URL-safe slug
 */
function generateSlugFromName(name) {
  if (!name || typeof name !== 'string') return '';

  let slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/@/g, '-at-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug.slice(0, 30);
}

/**
 * Generate database name from domain
 * 
 * @param {string} domain - Domain string
 * @param {string} agencyId - Agency UUID
 * @returns {string} Valid database name
 */
function generateDatabaseName(domain, agencyId) {
  const subdomain = extractSubdomain(domain);
  
  const sanitized = subdomain
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'agency';

  const prefix = 'agency_';
  const suffix = `_${agencyId.substring(0, 8)}`;
  const maxLen = 63 - prefix.length - suffix.length;
  
  return `${prefix}${sanitized.slice(0, maxLen)}${suffix}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Validation
  validateDomainFormat,
  validateAgencyName,
  checkDomainAvailability,
  
  // Utilities
  extractSubdomain,
  generateSlugFromName,
  generateDatabaseName,
  sanitizeForDomain,
  containsBlockedTerm,
  
  // Constants
  VALID_DOMAIN_SUFFIXES,
  RESERVED_SUBDOMAINS,
  BLOCKED_TERMS,
  DOMAIN_ERROR_CODES,
  MIN_SUBDOMAIN_LENGTH,
  MAX_SUBDOMAIN_LENGTH,
};
