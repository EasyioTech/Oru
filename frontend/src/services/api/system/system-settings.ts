import { getApiEndpoint } from '@/config/services';

export interface SystemSettings {
  id?: string;
  // Identity & Branding
  system_name: string;
  system_tagline?: string;
  system_description?: string;
  logo_url?: string;
  favicon_url?: string;
  logo_light_url?: string;
  logo_dark_url?: string;
  login_logo_url?: string;
  email_logo_url?: string;
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image_url?: string;
  og_title?: string;
  og_description?: string;
  twitter_card_type?: string;
  twitter_site?: string;
  twitter_creator?: string;
  // Analytics
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  facebook_pixel_id?: string;
  custom_tracking_code?: string;
  // Advertising
  ad_network_enabled?: boolean;
  ad_network_code?: string;
  ad_placement_header?: boolean;
  ad_placement_sidebar?: boolean;
  ad_placement_footer?: boolean;
  // Contact & Social
  support_email?: string;
  support_phone?: string;
  support_address?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  // Legal
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  cookie_policy_url?: string;
  // System Configuration
  maintenance_mode?: boolean;
  maintenance_message?: string;
  default_language?: string;
  default_timezone?: string;
  // Email/SMTP Configuration
  email_provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string;
  smtp_from?: string;
  smtp_secure?: boolean;
  sendgrid_api_key?: string;
  sendgrid_from?: string;
  mailgun_api_key?: string;
  mailgun_domain?: string;
  aws_ses_region?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  resend_api_key?: string;
  resend_from?: string;
  // Security Settings
  password_min_length?: number;
  password_require_uppercase?: boolean;
  password_require_lowercase?: boolean;
  password_require_numbers?: boolean;
  password_require_symbols?: boolean;
  password_expiry_days?: number;
  session_timeout_minutes?: number;
  max_login_attempts?: number;
  lockout_duration_minutes?: number;
  require_email_verification?: boolean;
  enable_two_factor?: boolean;
  enable_captcha?: boolean;
  captcha_site_key?: string;
  captcha_secret_key?: string;
  enable_rate_limiting?: boolean;
  rate_limit_requests_per_minute?: number;
  // File Storage
  file_storage_provider?: string;
  file_storage_path?: string;
  max_file_size_mb?: number;
  allowed_file_types?: string;
  aws_s3_bucket?: string;
  aws_s3_region?: string;
  aws_s3_access_key_id?: string;
  aws_s3_secret_access_key?: string;
  // API Configuration
  api_rate_limit_enabled?: boolean;
  api_rate_limit_requests_per_minute?: number;
  api_timeout_seconds?: number;
  enable_api_documentation?: boolean;
  // Logging & Monitoring
  log_level?: string;
  enable_audit_logging?: boolean;
  log_retention_days?: number;
  enable_error_tracking?: boolean;
  sentry_dsn?: string;
  enable_performance_monitoring?: boolean;
  // Backup Settings
  enable_auto_backup?: boolean;
  backup_frequency_hours?: number;
  backup_retention_days?: number;
  backup_storage_path?: string;
  // Docker/Environment (read-only display)
  docker_compose_version?: string;
  node_version?: string;
  postgres_version?: string;
  redis_enabled?: boolean;
  redis_host?: string;
  redis_port?: number;
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorShape {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: string;
  };
  message?: string;
}

type ApiResponseShape<T> = ApiSuccess<T> | ApiErrorShape;

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = window.localStorage.getItem('auth_token') || '';
  const userRole = window.localStorage.getItem('user_role');
  const agencyDatabase = window.localStorage.getItem('agency_database') || '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't include agency database header for super admins
  if (agencyDatabase && userRole !== 'super_admin') {
    headers['X-Agency-Database'] = agencyDatabase;
  }

  return headers;
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  let parsed: ApiResponseShape<T>;
  try {
    parsed = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return JSON.parse(text) as T;
  }

  if (!('success' in parsed)) {
    return parsed as unknown as T;
  }

  if (!parsed.success) {
    const errorResponse = parsed as ApiErrorShape;
    const message = errorResponse.error?.message || errorResponse.error || errorResponse.message || 'Request failed';
    const error = new Error(message);
    (error as any).code = errorResponse.error?.code;
    (error as any).details = errorResponse.error?.details;
    throw error;
  }

  return parsed.data;
}

async function parseErrorMessage(response: Response, defaultMsg: string): Promise<string> {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data.error?.message || data.error || data.message || defaultMsg;
  } catch {
    return defaultMsg;
  }
}

const MASK_PLACEHOLDER = '***';

/**
 * Strip masked secret fields so PUT does not overwrite with literal "***"
 */
function stripMaskedSecrets(settings: Partial<SystemSettings>): Partial<SystemSettings> {
  if (!settings || typeof settings !== 'object') return settings;
  const out: Partial<SystemSettings> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (value === MASK_PLACEHOLDER) continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

/**
 * Fetch system settings
 */
export async function fetchSystemSettings(): Promise<SystemSettings> {
  const endpoint = getApiEndpoint('/system/settings');
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, `Failed to load system settings (status ${response.status})`));
    }
    const data = await handleJsonResponse<{ settings: SystemSettings }>(response);
    return data.settings;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your connection and try again.');
    }
    throw error;
  }
}

/**
 * Update system settings
 * Masked secret fields (***) are omitted so existing values are not overwritten.
 */
export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const endpoint = getApiEndpoint('/system/settings');
  const payload = stripMaskedSecrets(settings);
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: getAuthHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, `Failed to update system settings (status ${response.status})`));
    }
    const data = await handleJsonResponse<{ settings: SystemSettings }>(response);
    return data.settings;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your connection and try again.');
    }
    throw error;
  }
}
