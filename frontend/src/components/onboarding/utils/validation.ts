/**
 * Onboarding Validation Utilities
 *
 * Client-side validation for instant UX. Backend is the source of truth.
 * Keep DOMAIN_CONSTRAINTS, NAME_CONSTRAINTS, and RESERVED_SUBDOMAINS in sync with:
 * backend/src/services/agency/agencyDomainService.js (MIN_SUBDOMAIN_LENGTH, MAX_SUBDOMAIN_LENGTH, RESERVED_SUBDOMAINS)
 * and backend name rules (2-100 chars).
 *
 * @module validation
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  suggestion?: string;
}

/**
 * Domain validation constants
 */
export const DOMAIN_CONSTRAINTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 63,
  PATTERN: /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
} as const;

/**
 * Agency name validation constants
 */
export const NAME_CONSTRAINTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
} as const;

/**
 * Reserved subdomains that cannot be used
 * This should match the backend list
 */
export const RESERVED_SUBDOMAINS = new Set([
  'admin', 'api', 'app', 'auth', 'billing', 'blog', 'cdn', 'dashboard',
  'dev', 'docs', 'help', 'login', 'mail', 'panel', 'portal', 'support',
  'system', 'test', 'www', 'oru', 'static', 'assets', 'images',
  'account', 'accounts', 'status', 'health', 'ping', 'oauth', 'security',
  'pricing', 'plans', 'enterprise', 'business', 'team', 'teams',
  'legal', 'terms', 'privacy', 'about', 'contact', 'careers',
  'demo', 'example', 'sample', 'staging', 'production', 'sandbox',
]);

/**
 * Inappropriate terms that cannot be used
 * This is a minimal client-side list - full validation happens on server
 */
const BLOCKED_TERMS_PARTIAL = [
  'fuck', 'shit', 'porn', 'xxx', 'sex', 'hack', 'scam', 'spam',
  'nazi', 'hitler', 'terrorist', 'kill', 'murder',
];

/**
 * Validate agency name
 * 
 * Rules:
 * - Required
 * - 2-100 characters
 * - No inappropriate content
 * 
 * @param name - Agency name to validate
 * @returns Validation result
 */
export function validateAgencyName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Agency name is required', code: 'NAME_REQUIRED' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Agency name is required', code: 'NAME_REQUIRED' };
  }

  if (trimmed.length < NAME_CONSTRAINTS.MIN_LENGTH) {
    return { 
      valid: false, 
      error: `Name must be at least ${NAME_CONSTRAINTS.MIN_LENGTH} characters`, 
      code: 'NAME_TOO_SHORT' 
    };
  }

  if (trimmed.length > NAME_CONSTRAINTS.MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Name cannot exceed ${NAME_CONSTRAINTS.MAX_LENGTH} characters`, 
      code: 'NAME_TOO_LONG' 
    };
  }

  // Basic inappropriate content check (full check happens on server)
  const lower = trimmed.toLowerCase();
  for (const term of BLOCKED_TERMS_PARTIAL) {
    if (lower.includes(term)) {
      return { valid: false, error: 'Name contains inappropriate content', code: 'NAME_INAPPROPRIATE' };
    }
  }

  return { valid: true };
}

/**
 * Validate domain/subdomain format (client-side)
 * 
 * Rules:
 * - Required
 * - 3-63 characters
 * - Lowercase letters, numbers, hyphens only
 * - Must start/end with alphanumeric
 * - No consecutive hyphens
 * - Not reserved
 * 
 * @param domain - Domain to validate
 * @returns Validation result with suggestion if invalid
 */
export function validateDomainFormat(domain: string): ValidationResult {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Workspace URL is required', code: 'DOMAIN_REQUIRED' };
  }

  const subdomain = domain.toLowerCase().trim().split('.')[0];

  if (subdomain.length < DOMAIN_CONSTRAINTS.MIN_LENGTH) {
    return { 
      valid: false, 
      error: `URL must be at least ${DOMAIN_CONSTRAINTS.MIN_LENGTH} characters`,
      code: 'DOMAIN_TOO_SHORT'
    };
  }

  if (subdomain.length > DOMAIN_CONSTRAINTS.MAX_LENGTH) {
    return { 
      valid: false, 
      error: `URL cannot exceed ${DOMAIN_CONSTRAINTS.MAX_LENGTH} characters`,
      code: 'DOMAIN_TOO_LONG'
    };
  }

  // Check for valid characters only
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL can only contain lowercase letters, numbers, and hyphens',
      code: 'DOMAIN_INVALID_FORMAT',
      suggestion: sanitizeForDomain(subdomain)
    };
  }

  // Check start character
  if (!/^[a-z0-9]/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL must start with a letter or number',
      code: 'DOMAIN_INVALID_START',
      suggestion: subdomain.replace(/^[-]+/, '')
    };
  }

  // Check end character
  if (!/[a-z0-9]$/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL must end with a letter or number',
      code: 'DOMAIN_INVALID_END',
      suggestion: subdomain.replace(/[-]+$/, '')
    };
  }

  // Check for consecutive hyphens
  if (/--/.test(subdomain)) {
    return { 
      valid: false, 
      error: 'URL cannot contain consecutive hyphens',
      code: 'DOMAIN_CONSECUTIVE_HYPHENS',
      suggestion: subdomain.replace(/-+/g, '-')
    };
  }

  // Check for reserved subdomains
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return { 
      valid: false, 
      error: 'This URL is reserved and cannot be used',
      code: 'DOMAIN_RESERVED'
    };
  }

  // Basic inappropriate content check
  const normalized = subdomain.replace(/-/g, '');
  for (const term of BLOCKED_TERMS_PARTIAL) {
    if (normalized.includes(term) || subdomain.includes(term)) {
      return { valid: false, error: 'URL contains inappropriate content', code: 'DOMAIN_INAPPROPRIATE' };
    }
  }

  return { valid: true };
}

/**
 * Sanitize a string to be used as a domain
 * Removes invalid characters while preserving readability
 * 
 * @param text - Text to sanitize
 * @returns Sanitized domain-safe string
 */
export function sanitizeForDomain(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, DOMAIN_CONSTRAINTS.MAX_LENGTH);
}

/**
 * Generate a URL-safe slug from an agency name
 * Handles international characters by removing diacritics
 * 
 * @param name - Agency name (can contain Unicode)
 * @returns URL-safe slug
 * 
 * @example
 * generateSlugFromName('Acme Corporation') // 'acme-corporation'
 * generateSlugFromName('Société Générale') // 'societe-generale'
 * generateSlugFromName('My Company & Partners') // 'my-company-and-partners'
 */
export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Normalize Unicode and remove diacritics
  let slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // Replace common special characters with words
  slug = slug
    .replace(/&/g, '-and-')
    .replace(/@/g, '-at-')
    .replace(/\+/g, '-plus-');

  // Replace non-alphanumeric with hyphens
  slug = slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Truncate to reasonable length for domain
  return slug.slice(0, 30);
}

/**
 * Get character count display with limit
 * 
 * @param current - Current character count
 * @param max - Maximum allowed
 * @returns Display string with warning if near limit
 */
export function getCharacterCountDisplay(current: number, max: number): {
  text: string;
  status: 'ok' | 'warning' | 'error';
} {
  const remaining = max - current;
  
  if (remaining < 0) {
    return { text: `${Math.abs(remaining)} over limit`, status: 'error' };
  }
  
  if (remaining <= 10) {
    return { text: `${remaining} remaining`, status: 'warning' };
  }
  
  return { text: `${current}/${max}`, status: 'ok' };
}

/**
 * Debounce function for API calls
 * 
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
