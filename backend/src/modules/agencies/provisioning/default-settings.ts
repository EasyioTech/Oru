/**
 * Default Business & Regional Settings for Oru ERP Tenants
 * Compliant with Indian ERP standards:
 * - Currency: INR (₹)
 * - Locale: en-IN
 * - Timezone: Asia/Kolkata
 * - Fiscal Calendar: April 1st start (04-01)
 */

export interface DefaultAgencySettingsConfig {
  timezone: string;
  dateFormat: string;
  fiscalYearStart: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  locale: string;
}

export const INDIAN_ERP_DEFAULTS: DefaultAgencySettingsConfig = {
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  fiscalYearStart: '04-01',
  workingHoursStart: '09:30',
  workingHoursEnd: '18:30',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  primaryColor: '#0a6ed1',
  secondaryColor: '#0854a0',
  currency: 'INR',
  locale: 'en-IN',
};
