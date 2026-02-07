/**
 * Onboarding Utilities Index
 * 
 * Exports all utility functions and constants for the onboarding flow.
 */

export {
  // Validation functions
  validateAgencyName,
  validateDomainFormat,
  sanitizeForDomain,
  generateSlugFromName,
  getCharacterCountDisplay,
  debounce,
  
  // Constants
  DOMAIN_CONSTRAINTS,
  NAME_CONSTRAINTS,
  RESERVED_SUBDOMAINS,
  
  // Types
  type ValidationResult,
} from './validation';
