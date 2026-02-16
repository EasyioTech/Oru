
import { pgEnum } from 'drizzle-orm/pg-core';

// Core System
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom']);
export const agencyTierEnum = pgEnum('agency_tier', ['trial', 'starter', 'basic', 'professional', 'enterprise', 'custom']);
export const agencyStatusEnum = pgEnum('agency_status', ['active', 'suspended', 'cancelled', 'pending']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended', 'locked']);

// System Monitoring
export const healthStatusEnum = pgEnum('health_status', ['healthy', 'degraded', 'down', 'maintenance']);
export const alertSeverityEnum = pgEnum('alert_severity', ['info', 'warning', 'error', 'critical']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import']);

// System Settings Enums
export const emailProviderEnum = pgEnum('email_provider_type', ['smtp', 'sendgrid', 'mailgun', 'aws_ses', 'resend', 'postmark']);
export const storageProviderEnum = pgEnum('storage_provider_type', ['local', 'aws_s3', 'azure_blob', 'gcp_storage', 'digitalocean_spaces']);
export const logLevelEnum = pgEnum('log_level_type', ['debug', 'info', 'warn', 'error', 'fatal']);
export const twitterCardEnum = pgEnum('twitter_card_type', ['summary', 'summary_large_image', 'app', 'player']);

// Provisioning Enum
export const provisioningJobStatusEnum = pgEnum('provisioning_job_status', ['pending', 'validating', 'creating_database', 'seeding_data', 'assigning_permissions', 'completed', 'failed', 'cancelled', 'timeout']);

// Page/Module Management
export const pageCategoryEnum = pgEnum('page_category', ['dashboard', 'management', 'finance', 'hr', 'projects', 'reports', 'personal', 'settings', 'system', 'inventory', 'procurement', 'assets', 'workflows', 'automation', 'compliance', 'analytics']);
export const pageAssignmentStatusEnum = pgEnum('page_assignment_status', ['active', 'pending_approval', 'suspended', 'trial', 'expired']);
export const pageRequestStatusEnum = pgEnum('page_request_status', ['pending', 'approved', 'rejected', 'cancelled']);
