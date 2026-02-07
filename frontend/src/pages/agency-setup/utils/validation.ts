import type { AgencySetupFormData } from '../types';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateStep1(formData: AgencySetupFormData): ValidationResult {
  if (!formData.companyName.trim()) {
    return { valid: false, message: 'Company name is required' };
  }
  return { valid: true };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep5(formData: AgencySetupFormData): ValidationResult {
  if (formData.teamMembers.length === 0) return { valid: true };

  for (let i = 0; i < formData.teamMembers.length; i++) {
    const member = formData.teamMembers[i];
    if (!member.name || !member.name.trim()) {
      return { valid: false, message: `Team member ${i + 1}: Name is required` };
    }
    if (!member.email || !member.email.trim()) {
      return { valid: false, message: `Team member ${i + 1}: Email is required` };
    }
    if (!EMAIL_REGEX.test(member.email)) {
      return { valid: false, message: `Team member ${i + 1}: Please enter a valid email address` };
    }
  }
  return { valid: true };
}
