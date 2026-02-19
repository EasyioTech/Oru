
import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, inet, uniqueIndex, decimal, bigint, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {
    emailProviderEnum,
    storageProviderEnum,
    twitterCardEnum,
    logLevelEnum
} from './enums.js';
import { agencies } from './agency.js';

/**
 * System Settings Table
 * Global configuration for the application using singleton pattern (id is always 1 or singular record)
 */
export const systemSettings = pgTable('system_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    systemName: text('system_name').default('BuildFlow ERP').notNull(),
    systemTagline: text('system_tagline'),
    systemDescription: text('system_description'),
    logoUrl: text('logo_url'),
    logoLightUrl: text('logo_light_url'),
    logoDarkUrl: text('logo_dark_url'),
    faviconUrl: text('favicon_url'),
    loginLogoUrl: text('login_logo_url'),
    emailLogoUrl: text('email_logo_url'),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords').array(),
    ogImageUrl: text('og_image_url'),
    ogTitle: text('og_title'),
    ogDescription: text('og_description'),
    twitterCardType: twitterCardEnum('twitter_card_type').default('summary_large_image'),
    twitterSite: text('twitter_site'),
    twitterCreator: text('twitter_creator'),
    googleAnalyticsId: text('google_analytics_id'),
    googleTagManagerId: text('google_tag_manager_id'),
    facebookPixelId: text('facebook_pixel_id'),
    customTrackingCode: text('custom_tracking_code'),
    customHeadScripts: text('custom_head_scripts'),
    customBodyScripts: text('custom_body_scripts'),
    adNetworkEnabled: boolean('ad_network_enabled').default(false).notNull(),
    adNetworkCode: text('ad_network_code'),
    adPlacementConfig: jsonb('ad_placement_config').default({}).notNull(),
    supportEmail: text('support_email'),
    supportPhone: text('support_phone'),
    supportAddress: jsonb('support_address'),
    socialLinks: jsonb('social_links').default({}).notNull(),
    legalLinks: jsonb('legal_links').default({}).notNull(),

    // Email Settings
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
    mailgunApiKeyEncrypted: text('mailgun_api_key_encrypted'),
    mailgunDomain: text('mailgun_domain'),
    mailgunRegion: text('mailgun_region').default('us'),
    awsSesRegion: text('aws_ses_region'),
    awsSesAccessKeyEncrypted: text('aws_ses_access_key_encrypted'),
    awsSesSecretKeyEncrypted: text('aws_ses_secret_key_encrypted'),
    awsSesFromEmail: text('aws_ses_from_email'),
    awsSesFromName: text('aws_ses_from_name'),
    resendApiKeyEncrypted: text('resend_api_key_encrypted'),
    resendFromEmail: text('resend_from_email'),
    resendFromName: text('resend_from_name'),
    postmarkApiKeyEncrypted: text('postmark_api_key_encrypted'),
    postmarkFromEmail: text('postmark_from_email'),
    postmarkFromName: text('postmark_from_name'),
    emailTestMode: boolean('email_test_mode').default(false).notNull(),
    emailTestRecipient: text('email_test_recipient'),

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
    sessionAbsoluteTimeoutHours: integer('session_absolute_timeout_hours').default(24),
    maxConcurrentSessions: integer('max_concurrent_sessions').default(5),
    maxLoginAttempts: integer('max_login_attempts').default(5).notNull(),
    lockoutDurationMinutes: integer('lockout_duration_minutes').default(30).notNull(),
    progressiveLockout: boolean('progressive_lockout').default(true).notNull(),
    requireEmailVerification: boolean('require_email_verification').default(true).notNull(),
    emailVerificationExpiresHours: integer('email_verification_expires_hours').default(24).notNull(),
    enableTwoFactor: boolean('enable_two_factor').default(false).notNull(),
    forceTwoFactorForRoles: text('force_two_factor_for_roles').array().default([]),
    enableCaptcha: boolean('enable_captcha').default(false).notNull(),
    captchaProvider: text('captcha_provider').default('recaptcha_v3'),
    captchaSiteKey: text('captcha_site_key'),
    captchaSecretKeyEncrypted: text('captcha_secret_key_encrypted'),
    captchaThreshold: decimal('captcha_threshold', { precision: 3, scale: 2 }).default('0.5'),
    enableRateLimiting: boolean('enable_rate_limiting').default(true).notNull(),
    rateLimitRequestsPerMinute: integer('rate_limit_requests_per_minute').default(60).notNull(),
    rateLimitBurstSize: integer('rate_limit_burst_size').default(100),
    ipWhitelist: inet('ip_whitelist').array(),
    ipBlacklist: inet('ip_blacklist').array(),
    enableIpGeolocation: boolean('enable_ip_geolocation').default(false).notNull(),
    blockedCountries: text('blocked_countries').array(),
    allowedCountries: text('allowed_countries').array(),

    // Storage
    fileStorageProvider: storageProviderEnum('file_storage_provider').default('local').notNull(),
    fileStoragePath: text('file_storage_path').default('/app/storage'),
    maxFileSizeBytes: bigint('max_file_size_bytes', { mode: 'number' }).default(10485760).notNull(),
    maxTotalStorageBytes: bigint('max_total_storage_bytes', { mode: 'number' }),
    allowedMimeTypes: text('allowed_mime_types').array().default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']),
    blockedMimeTypes: text('blocked_mime_types').array().default(['application/x-executable', 'application/x-msdos-program']),
    enableVirusScanning: boolean('enable_virus_scanning').default(false).notNull(),
    virusScanProvider: text('virus_scan_provider'),
    awsS3Bucket: text('aws_s3_bucket'),
    awsS3Region: text('aws_s3_region'),
    awsS3AccessKeyEncrypted: text('aws_s3_access_key_encrypted'),
    awsS3SecretKeyEncrypted: text('aws_s3_secret_key_encrypted'),
    awsS3PublicUrl: text('aws_s3_public_url'),
    cdnEnabled: boolean('cdn_enabled').default(false).notNull(),
    cdnUrl: text('cdn_url'),

    // API
    apiEnabled: boolean('api_enabled').default(true).notNull(),
    apiRateLimitEnabled: boolean('api_rate_limit_enabled').default(true).notNull(),
    apiRateLimitRequestsPerMinute: integer('api_rate_limit_requests_per_minute').default(100),
    apiTimeoutSeconds: integer('api_timeout_seconds').default(30).notNull(),
    apiMaxPayloadSizeBytes: integer('api_max_payload_size_bytes').default(1048576),
    enableApiDocumentation: boolean('enable_api_documentation').default(true).notNull(),
    apiDocumentationUrl: text('api_documentation_url'),
    enableCors: boolean('enable_cors').default(true).notNull(),
    corsAllowedOrigins: text('cors_allowed_origins').array(),
    corsAllowedMethods: text('cors_allowed_methods').array().default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    corsAllowedHeaders: text('cors_allowed_headers').array().default(['Content-Type', 'Authorization']),
    corsMaxAgeSeconds: integer('cors_max_age_seconds').default(86400),

    // Logging & Monitoring
    logLevel: logLevelEnum('log_level').default('info').notNull(),
    enableAuditLogging: boolean('enable_audit_logging').default(true).notNull(),
    logRetentionDays: integer('log_retention_days').default(90).notNull(),
    logSensitiveData: boolean('log_sensitive_data').default(false).notNull(),
    enableErrorTracking: boolean('enable_error_tracking').default(false).notNull(),
    sentryDsnEncrypted: text('sentry_dsn_encrypted'),
    sentryEnvironment: text('sentry_environment'),
    sentrySampleRate: decimal('sentry_sample_rate', { precision: 3, scale: 2 }).default('1.0'),
    enablePerformanceMonitoring: boolean('enable_performance_monitoring').default(false).notNull(),
    performanceSampleRate: decimal('performance_sample_rate', { precision: 3, scale: 2 }).default('0.1'),

    // Backup
    enableAutoBackup: boolean('enable_auto_backup').default(true).notNull(),
    backupSchedule: text('backup_schedule').default('0 2 * * *'),
    backupRetentionDays: integer('backup_retention_days').default(30).notNull(),
    backupStorageProvider: storageProviderEnum('backup_storage_provider').default('local'),
    backupStoragePath: text('backup_storage_path').default('/app/backups'),
    backupEncryptionEnabled: boolean('backup_encryption_enabled').default(true).notNull(),
    backupCompressionEnabled: boolean('backup_compression_enabled').default(true).notNull(),

    // Maintenance
    maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
    maintenanceMessage: text('maintenance_message'),
    maintenanceAllowedIps: inet('maintenance_allowed_ips').array(),
    maintenanceStartTime: timestamp('maintenance_start_time', { withTimezone: true }),
    maintenanceEndTime: timestamp('maintenance_end_time', { withTimezone: true }),

    // Localization
    defaultLanguage: text('default_language').default('en').notNull(),
    availableLanguages: text('available_languages').array().default(['en']),
    defaultTimezone: text('default_timezone').default('UTC').notNull(),
    defaultCurrencyCode: text('default_currency_code').default('USD'),
    defaultDateFormat: text('default_date_format').default('YYYY-MM-DD'),
    defaultTimeFormat: text('default_time_format').default('HH:mm:ss'),

    // Registration
    enableRegistration: boolean('enable_registration').default(true).notNull(),
    registrationRequiresApproval: boolean('registration_requires_approval').default(false).notNull(),
    registrationAutoVerifyEmail: boolean('registration_auto_verify_email').default(false).notNull(),
    defaultUserRole: text('default_user_role'),
    enableInvitations: boolean('enable_invitations').default(true).notNull(),
    invitationExpiryHours: integer('invitation_expiry_hours').default(72),

    // GDPR & Legal
    termsVersion: text('terms_version'),
    termsLastUpdated: timestamp('terms_last_updated', { withTimezone: true }),
    privacyVersion: text('privacy_version'),
    privacyLastUpdated: timestamp('privacy_last_updated', { withTimezone: true }),
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
