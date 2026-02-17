/**
 * System Settings Service
 * Business logic for get/update system settings with validation and secret masking.
 * Schema is defined only in migrations; no DDL here.
 */

const { getSystemSettings, clearSettingsCache } = require('../utils/systemSettings');
const { query, queryOne } = require('../infrastructure/database/dbQuery');

const MASK_PLACEHOLDER = '***';

const BOOLEAN_KEYS = new Set([
  'maintenance_mode', 'ad_network_enabled', 'ad_placement_header', 'ad_placement_sidebar', 'ad_placement_footer',
  'smtp_secure', 'password_require_uppercase', 'password_require_lowercase', 'password_require_numbers',
  'password_require_symbols', 'require_email_verification', 'enable_two_factor', 'enable_captcha',
  'enable_rate_limiting', 'enable_audit_logging', 'enable_error_tracking', 'enable_performance_monitoring',
  'enable_auto_backup', 'api_rate_limit_enabled', 'enable_api_documentation', 'redis_enabled',
]);

const ALLOWED_SETTINGS_FIELDS = [
  'system_name', 'system_tagline', 'system_description',
  'logo_url', 'favicon_url', 'logo_light_url', 'logo_dark_url', 'login_logo_url', 'email_logo_url',
  'meta_title', 'meta_description', 'meta_keywords',
  'og_image_url', 'og_title', 'og_description',
  'twitter_card_type', 'twitter_site', 'twitter_creator',
  'google_analytics_id', 'google_tag_manager_id', 'facebook_pixel_id', 'custom_tracking_code',
  'ad_network_enabled', 'ad_network_code',
  'ad_placement_header', 'ad_placement_sidebar', 'ad_placement_footer',
  'support_email', 'support_phone', 'support_address',
  'facebook_url', 'twitter_url', 'linkedin_url', 'instagram_url', 'youtube_url',
  'terms_of_service_url', 'privacy_policy_url', 'cookie_policy_url',
  'maintenance_mode', 'maintenance_message',
  'default_language', 'default_timezone',
  'email_provider', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from', 'smtp_secure',
  'sendgrid_api_key', 'sendgrid_from',
  'mailgun_api_key', 'mailgun_domain',
  'aws_ses_region', 'aws_access_key_id', 'aws_secret_access_key',
  'resend_api_key', 'resend_from',
  'password_min_length', 'password_require_uppercase', 'password_require_lowercase',
  'password_require_numbers', 'password_require_symbols', 'password_expiry_days',
  'session_timeout_minutes', 'max_login_attempts', 'lockout_duration_minutes',
  'require_email_verification', 'enable_two_factor',
  'enable_captcha', 'captcha_site_key', 'captcha_secret_key',
  'enable_rate_limiting', 'rate_limit_requests_per_minute',
  'file_storage_provider', 'file_storage_path', 'max_file_size_mb', 'allowed_file_types',
  'aws_s3_bucket', 'aws_s3_region', 'aws_s3_access_key_id', 'aws_s3_secret_access_key',
  'api_rate_limit_enabled', 'api_rate_limit_requests_per_minute', 'api_timeout_seconds',
  'enable_api_documentation',
  'log_level', 'enable_audit_logging', 'log_retention_days',
  'enable_error_tracking', 'sentry_dsn', 'enable_performance_monitoring',
  'enable_auto_backup', 'backup_frequency_hours', 'backup_retention_days', 'backup_storage_path',
  'docker_compose_version', 'node_version', 'postgres_version',
  'redis_enabled', 'redis_host', 'redis_port',
];

const SENSITIVE_FIELDS = new Set([
  'smtp_password', 'sendgrid_api_key', 'mailgun_api_key',
  'aws_access_key_id', 'aws_secret_access_key',
  'aws_s3_access_key_id', 'aws_s3_secret_access_key',
  'resend_api_key', 'captcha_secret_key', 'sentry_dsn',
]);

const NUMERIC_RANGES = {
  smtp_port: { min: 1, max: 65535 },
  max_file_size_mb: { min: 1, max: 1024 },
  backup_frequency_hours: { min: 1, max: 8760 },
  backup_retention_days: { min: 1, max: 365 },
  log_retention_days: { min: 1, max: 365 },
  rate_limit_requests_per_minute: { min: 1, max: 10000 },
  api_rate_limit_requests_per_minute: { min: 1, max: 10000 },
  session_timeout_minutes: { min: 1, max: 10080 },
  lockout_duration_minutes: { min: 1, max: 1440 },
  max_login_attempts: { min: 1, max: 20 },
  password_min_length: { min: 6, max: 128 },
  password_expiry_days: { min: 0, max: 365 },
  api_timeout_seconds: { min: 1, max: 300 },
  redis_port: { min: 1, max: 65535 },
};

const STRING_MAX_LENGTHS = {
  system_name: 200,
  system_tagline: 300,
  meta_title: 200,
  meta_description: 500,
  custom_tracking_code: 50000,
  maintenance_message: 2000,
  default_language: 20,
  default_timezone: 100,
  logo_url: 524288,      // 512KB for base64 uploads
  favicon_url: 524288,
  logo_light_url: 524288,
  logo_dark_url: 524288,
  login_logo_url: 524288,
  email_logo_url: 524288,
  og_image_url: 2048,
};

function isValidUrl(s) {
  if (typeof s !== 'string' || !s.trim()) return true;
  // Allow relative paths (e.g. /images/landing/light.svg)
  if (s.startsWith('/') && !s.startsWith('//')) return true;
  // Allow data URLs (base64 uploaded images)
  if (s.startsWith('data:image/')) return true;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate a single field value
 * @returns {{ valid: boolean, message?: string }}
 */
function validateField(key, value) {
  if (value === undefined || value === null) return { valid: true };

  if (ALLOWED_SETTINGS_FIELDS.indexOf(key) === -1) {
    return { valid: false, message: `Unknown field: ${key}` };
  }

  const range = NUMERIC_RANGES[key];
  if (range) {
    const n = Number(value);
    if (Number.isNaN(n) || !Number.isInteger(n)) {
      return { valid: false, message: `${key} must be an integer` };
    }
    if (n < range.min || n > range.max) {
      return { valid: false, message: `${key} must be between ${range.min} and ${range.max}` };
    }
    return { valid: true };
  }

  if (typeof value === 'boolean') {
    return { valid: true };
  }

  if (BOOLEAN_KEYS.has(key)) {
    if (typeof value !== 'boolean') {
      return { valid: false, message: `${key} must be a boolean` };
    }
    return { valid: true };
  }

  if (typeof value === 'string') {
    const maxLen = STRING_MAX_LENGTHS[key];
    if (maxLen != null && value.length > maxLen) {
      return { valid: false, message: `${key} must be at most ${maxLen} characters` };
    }
    if (key === 'system_name' && value.trim().length === 0) {
      return { valid: false, message: 'system_name is required and cannot be empty' };
    }
    const urlFields = ['logo_url', 'favicon_url', 'logo_light_url', 'logo_dark_url', 'login_logo_url', 'email_logo_url', 'og_image_url',
      'support_email', 'terms_of_service_url', 'privacy_policy_url', 'cookie_policy_url',
      'facebook_url', 'twitter_url', 'linkedin_url', 'instagram_url', 'youtube_url'];
    if (urlFields.indexOf(key) !== -1 && value.trim().length > 0) {
      if (key === 'support_email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { valid: false, message: 'support_email must be a valid email' };
        }
      } else if (urlFields.indexOf(key) !== -1 && key !== 'support_email' && !isValidUrl(value)) {
        return { valid: false, message: `${key} must be a valid URL` };
      }
    }
    return { valid: true };
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    return { valid: true };
  }

  return { valid: false, message: `${key} has invalid type` };
}

/**
 * Validate updates object
 * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
 */
function validateUpdates(updates) {
  const errors = [];
  for (const [key, value] of Object.entries(updates)) {
    const result = validateField(key, value);
    if (!result.valid) {
      errors.push({ field: key, message: result.message });
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Mask sensitive fields in a settings object (clone)
 */
function maskSecrets(settings) {
  if (!settings || typeof settings !== 'object') return settings;
  const out = { ...settings };
  for (const key of SENSITIVE_FIELDS) {
    if (out[key] != null && String(out[key]).trim() !== '') {
      out[key] = MASK_PLACEHOLDER;
    }
  }
  return out;
}

/**
 * Get system settings for API response
 * @param {Object} opts - { maskSecrets: boolean }
 * @returns {Promise<Object>} Settings object (masked if opts.maskSecrets)
 */
async function getSettings(opts = {}) {
  const { maskSecrets: mask = true } = opts;
  const raw = await getSystemSettings();
  if (!raw) return null;
  return mask ? maskSecrets(raw) : { ...raw };
}

/**
 * Ensure one row exists; return its id
 */
async function ensureOneRow(userId) {
  const existing = await queryOne(
    'SELECT id FROM public.system_settings ORDER BY created_at DESC LIMIT 1'
  );
  if (existing) return existing.id;

  let createdBy = null;
  if (userId) {
    const userCheck = await queryOne('SELECT id FROM public.users WHERE id = $1 LIMIT 1', [userId]);
    if (userCheck) createdBy = userId;
  }

  const insertResult = await query(
    `INSERT INTO public.system_settings (system_name, system_tagline, system_description, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    ['Oru ERP', 'Complete Business Management Solution', 'A comprehensive ERP system for managing your business operations', createdBy, createdBy]
  );
  return insertResult.rows[0].id;
}

/**
 * Update system settings
 * @param {Object} updates - Key-value pairs (only allowed keys used)
 * @param {string} [userId] - Optional user id for updated_by
 * @returns {Promise<Object>} Updated settings row (masked)
 */
async function updateSettings(updates, userId) {
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    const err = new Error('No fields to update');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const filtered = {};
  for (const key of ALLOWED_SETTINGS_FIELDS) {
    if (updates[key] === undefined) continue;
    if (updates[key] === MASK_PLACEHOLDER || updates[key] === '***') continue;
    filtered[key] = updates[key];
  }

  if (Object.keys(filtered).length === 0) {
    const err = new Error('No valid fields to update');
    err.code = 'VALIDATION_ERROR';
    err.details = { allowedFields: ALLOWED_SETTINGS_FIELDS };
    throw err;
  }

  const validation = validateUpdates(filtered);
  if (!validation.valid) {
    const err = new Error(validation.errors.map(e => `${e.field}: ${e.message}`).join('; '));
    err.code = 'VALIDATION_ERROR';
    err.details = validation.errors;
    throw err;
  }

  const settingsId = await ensureOneRow(userId);

  const updateFields = [];
  const params = [];
  let idx = 1;
  const NUMERIC_KEYS = new Set(Object.keys(NUMERIC_RANGES));

  for (const [key, value] of Object.entries(filtered)) {
    updateFields.push(`${key} = $${idx}`);
    let param = value;
    if (NUMERIC_KEYS.has(key) && (typeof value === 'string' || typeof value === 'number')) {
      const n = parseInt(value, 10);
      if (!Number.isNaN(n)) param = n;
    } else if (BOOLEAN_KEYS.has(key) && typeof value !== 'boolean') {
      if (value === 'true' || value === true) param = true;
      else if (value === 'false' || value === false) param = false;
    }
    params.push(param);
    idx++;
  }

  if (userId) {
    const userCheck = await queryOne('SELECT id FROM public.users WHERE id = $1 LIMIT 1', [userId]);
    if (userCheck) {
      updateFields.push(`updated_by = $${idx}`);
      params.push(userId);
      idx++;
    }
  }

  params.push(settingsId);
  const sql = `UPDATE public.system_settings SET ${updateFields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const result = await query(sql, params);

  if (result.rows.length === 0) {
    const err = new Error('Failed to update system settings');
    err.code = 'UPDATE_FAILED';
    throw err;
  }

  clearSettingsCache();
  const row = result.rows[0];
  return maskSecrets(row);
}

module.exports = {
  getSettings,
  updateSettings,
};
