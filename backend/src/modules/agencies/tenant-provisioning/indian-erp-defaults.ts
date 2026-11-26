/**
 * Indian ERP System Defaults
 * Enforces Rupee currency (₹, INR), IST timezone (Asia/Kolkata),
 * Indian fiscal year cycle (April 1 to March 31), DD/MM/YYYY formatting,
 * and standard Monday–Saturday 6-day commercial work week.
 */
export const INDIAN_ERP_DEFAULTS = {
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  fiscalYearStart: '04-01', // April 1st (Indian Standard Fiscal Year)
  fiscalYearEnd: '03-31',   // March 31st
  workingHoursStart: '09:30',
  workingHoursEnd: '18:30',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  primaryColor: '#0a6ed1',
  secondaryColor: '#0854a0',
  taxRegion: 'IN',
  enableGST: true,
} as const;

export type IndianErpDefaults = typeof INDIAN_ERP_DEFAULTS;
