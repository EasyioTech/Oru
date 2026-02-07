/**
 * Settings Helper Functions
 * Utility functions for settings operations
 */

const DAYS_LOWER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAYS_CAPITALIZED = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Parse working days from string or array (API returns capitalized, UI uses lowercase)
 */
export const parseWorkingDays = (workingDays: string | string[]): string[] => {
  if (Array.isArray(workingDays)) {
    return workingDays.map((d) => {
      const lower = String(d).toLowerCase();
      return DAYS_LOWER.includes(lower) ? lower : d;
    });
  }
  if (typeof workingDays === 'string') {
    try {
      const parsed = JSON.parse(workingDays);
      return Array.isArray(parsed) ? parsed.map((d: string) => String(d).toLowerCase()) : DAYS_LOWER.slice(0, 5);
    } catch {
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    }
  }
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
};

/**
 * Normalize working days from UI format (lowercase) to DB format (capitalized)
 */
export const normalizeWorkingDaysForDb = (days: string[]): string[] => {
  if (!Array.isArray(days) || days.length === 0) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  }
  return days.map((d) => {
    const lower = String(d).toLowerCase();
    const idx = DAYS_LOWER.indexOf(lower);
    return idx >= 0 ? DAYS_CAPITALIZED[idx] : d;
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get default agency settings
 */
export const getDefaultAgencySettings = () => ({
  agency_name: '',
  logo_url: '',
  domain: '',
  default_currency: 'IN',
  primary_color: '#0a6ed1',
  secondary_color: '#0854a0',
  timezone: 'Asia/Kolkata',
  date_format: 'DD/MM/YYYY',
  fiscal_year_start: '04-01',
  working_hours_start: '09:00',
  working_hours_end: '18:00',
  working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
});

/**
 * Get default notification settings
 */
export const getDefaultNotificationSettings = () => ({
  email_notifications: true,
  push_notifications: false,
  task_reminders: true,
  leave_notifications: true,
  payroll_notifications: true,
  project_updates: true,
  system_alerts: true,
  marketing_emails: false,
});

