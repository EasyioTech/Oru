
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, uniqueIndex, decimal, bigint, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
    emailProviderEnum,
    storageProviderEnum,
    logLevelEnum
} from './enums.js';
import { agencies } from './agency.js';

/**
 * System Settings Table
 * Global configuration for the application using singleton pattern (id is always 1 or singular record)
 */
export const systemSettings = pgTable('system_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemName: text('system_name').default('Oru ERP').notNull(),
    systemTagline: text('system_tagline'),
    systemDescription: text('system_description'),
    logoUrl: text('logo_url'),
    faviconUrl: text('favicon_url'),
    supportEmail: text('support_email'),
    supportPhone: text('support_phone'),
    supportAddress: jsonb('support_address'),
    socialLinks: jsonb('social_links').default({}).notNull(),
    legalLinks: jsonb('legal_links').default({}).notNull(),

    // Email (SMTP + SendGrid only)
    emailProvider: emailProviderEnum('email_provider').default('smtp'),
    smtpHost: text('smtp_host'),
    smtpPort: integer('smtp_port').default(587),
    smtpUser: text('smtp_user'),
    smtpPasswordEncrypted: text('smtp_password_encrypted'),
    smtpFromEmail: text('smtp_from_email'),
    smtpFromName: text('smtp_from_name'),
    smtpUseTls: boolean('smtp_use_tls').default(true).notNull(),
    smtpUseSsl: boolean('smtp_use_ssl').default(false).notNull(),
    sendgridApiKeyEncrypted: text('sendgrid_api_key_encrypted'),
    sendgridFromEmail: text('sendgrid_from_email'),
    sendgridFromName: text('sendgrid_from_name'),

    // Security Policies
    passwordMinLength: integer('password_min_length').default(8).notNull(),
    passwordMaxLength: integer('password_max_length').default(128).notNull(),
    passwordRequireUppercase: boolean('password_require_uppercase').default(true).notNull(),
    passwordRequireLowercase: boolean('password_require_lowercase').default(true).notNull(),
    passwordRequireNumbers: boolean('password_require_numbers').default(true).notNull(),
    passwordRequireSymbols: boolean('password_require_symbols').default(false).notNull(),
    passwordExpiryDays: integer('password_expiry_days'),
    passwordHistoryCount: integer('password_history_count').default(5),
    sessionTimeoutMinutes: integer('session_timeout_minutes').default(60).notNull(),
    maxLoginAttempts: integer('max_login_attempts').default(5).notNull(),
    lockoutDurationMinutes: integer('lockout_duration_minutes').default(30).notNull(),
    requireEmailVerification: boolean('require_email_verification').default(true).notNull(),
    emailVerificationExpiresHours: integer('email_verification_expires_hours').default(24).notNull(),
    enableTwoFactor: boolean('enable_two_factor').default(false).notNull(),
    forceTwoFactorForRoles: text('force_two_factor_for_roles').array().default([]),
    enableRateLimiting: boolean('enable_rate_limiting').default(true).notNull(),
    rateLimitRequestsPerMinute: integer('rate_limit_requests_per_minute').default(60).notNull(),
    rateLimitBurstSize: integer('rate_limit_burst_size').default(100),

    // Storage
    fileStorageProvider: storageProviderEnum('file_storage_provider').default('local').notNull(),
    fileStoragePath: text('file_storage_path').default('/app/storage'),
    maxFileSizeBytes: bigint('max_file_size_bytes', { mode: 'number' }).default(10485760).notNull(),
    maxTotalStorageBytes: bigint('max_total_storage_bytes', { mode: 'number' }),
    allowedMimeTypes: text('allowed_mime_types').array().default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']),
    blockedMimeTypes: text('blocked_mime_types').array().default(['application/x-executable', 'application/x-msdos-program']),

    // API & CORS
    apiEnabled: boolean('api_enabled').default(true).notNull(),
    apiRateLimitEnabled: boolean('api_rate_limit_enabled').default(true).notNull(),
    apiRateLimitRequestsPerMinute: integer('api_rate_limit_requests_per_minute').default(100),
    apiTimeoutSeconds: integer('api_timeout_seconds').default(30).notNull(),
    apiMaxPayloadSizeBytes: integer('api_max_payload_size_bytes').default(1048576),
    enableCors: boolean('enable_cors').default(true).notNull(),
    corsAllowedOrigins: text('cors_allowed_origins').array(),

    // Logging
    logLevel: logLevelEnum('log_level').default('info').notNull(),
    enableAuditLogging: boolean('enable_audit_logging').default(true).notNull(),
    logRetentionDays: integer('log_retention_days').default(90).notNull(),
    logSensitiveData: boolean('log_sensitive_data').default(false).notNull(),

    // Backup
    enableAutoBackup: boolean('enable_auto_backup').default(true).notNull(),
    backupSchedule: text('backup_schedule').default('0 2 * * *'),
    backupRetentionDays: integer('backup_retention_days').default(30).notNull(),
    backupStorageProvider: storageProviderEnum('backup_storage_provider').default('local'),
    backupStoragePath: text('backup_storage_path').default('/app/backups'),
    backupEncryptionEnabled: boolean('backup_encryption_enabled').default(true).notNull(),
    backupCompressionEnabled: boolean('backup_compression_enabled').default(true).notNull(),

    // Localization
    defaultLanguage: text('default_language').default('en').notNull(),
    availableLanguages: text('available_languages').array().default(['en']),
    defaultTimezone: text('default_timezone').default('UTC').notNull(),
    defaultCurrencyCode: text('default_currency_code').default('USD'),
    defaultDateFormat: text('default_date_format').default('YYYY-MM-DD'),
    defaultTimeFormat: text('default_time_format').default('HH:mm:ss'),

    // Registration
    enableRegistration: boolean('enable_registration').default(true).notNull(),
    enableInvitations: boolean('enable_invitations').default(true).notNull(),
    invitationExpiryHours: integer('invitation_expiry_hours').default(72),

    // GDPR & Legal
    termsVersion: text('terms_version'),
    privacyVersion: text('privacy_version'),
    cookieConsentEnabled: boolean('cookie_consent_enabled').default(true).notNull(),
    gdprCompliant: boolean('gdpr_compliant').default(true).notNull(),
    dataRetentionDays: integer('data_retention_days'),
    enableDataExport: boolean('enable_data_export').default(true).notNull(),
    enableAccountDeletion: boolean('enable_account_deletion').default(true).notNull(),

    // Metadata
    systemVersion: text('system_version'),
    deploymentEnvironment: text('deployment_environment').default('production'),
    featureFlags: jsonb('feature_flags').default({}).notNull(),
    customSettings: jsonb('custom_settings').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
}, (table) => ({
    singletonIdx: uniqueIndex('idx_system_settings_singleton').on(sql`(1)`),
}));

/**
 * System Email Providers Table
 */
export const systemEmailProviders = pgTable('system_email_providers', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }), // NULL for system-wide
    providerType: emailProviderEnum('provider_type').notNull(),
    name: text('name').notNull(),
    config: jsonb('config').notNull(), // Host, Port, API Key, etc.
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_system_email_providers_agency_id').on(table.agencyId),
}));

/**
 * System Storage Providers Table
 */
export const systemStorageProviders = pgTable('system_storage_providers', {
    id: uuid('id').defaultRandom().primaryKey(),
    agencyId: uuid('agency_id').references(() => agencies.id, { onDelete: 'cascade' }), // NULL for system-wide
    providerType: storageProviderEnum('provider_type').notNull(),
    name: text('name').notNull(),
    config: jsonb('config').notNull(), // Bucket, Region, Access Key, etc.
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    agencyIdIdx: index('idx_system_storage_providers_agency_id').on(table.agencyId),
}));
