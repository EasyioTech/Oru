CREATE TYPE "public"."agency_status" AS ENUM('active', 'suspended', 'cancelled', 'pending');--> statement-breakpoint
CREATE TYPE "public"."agency_tier" AS ENUM('trial', 'starter', 'basic', 'professional', 'enterprise', 'custom');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'error', 'critical');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import');--> statement-breakpoint
CREATE TYPE "public"."email_provider_type" AS ENUM('smtp', 'sendgrid', 'mailgun', 'aws_ses', 'resend', 'postmark');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('healthy', 'degraded', 'down', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."log_level_type" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TYPE "public"."page_assignment_status" AS ENUM('active', 'pending_approval', 'suspended', 'trial', 'expired');--> statement-breakpoint
CREATE TYPE "public"."page_category" AS ENUM('dashboard', 'management', 'finance', 'hr', 'projects', 'reports', 'personal', 'settings', 'system', 'inventory', 'procurement', 'assets', 'workflows', 'automation', 'compliance', 'analytics');--> statement-breakpoint
CREATE TYPE "public"."page_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."provisioning_job_status" AS ENUM('pending', 'validating', 'creating_database', 'seeding_data', 'assigning_permissions', 'completed', 'failed', 'cancelled', 'timeout');--> statement-breakpoint
CREATE TYPE "public"."storage_provider_type" AS ENUM('local', 'aws_s3', 'azure_blob', 'gcp_storage', 'digitalocean_spaces');--> statement-breakpoint
CREATE TYPE "public"."twitter_card_type" AS ENUM('summary', 'summary_large_image', 'app', 'player');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'locked');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"database_name" text NOT NULL,
	"owner_user_id" uuid,
	"subscription_plan" "agency_tier" DEFAULT 'trial' NOT NULL,
	"status" "agency_status" DEFAULT 'pending' NOT NULL,
	"max_users" integer DEFAULT 50 NOT NULL,
	"max_storage_gb" integer DEFAULT 10 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"billing_email" text,
	"address" jsonb,
	"tax_id" text,
	"subscription_starts_at" timestamp with time zone,
	"subscription_ends_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_name" text NOT NULL,
	"logo_url" text,
	"domain" text,
	"default_currency" text DEFAULT 'USD' NOT NULL,
	"currency" text,
	"primary_color" text DEFAULT '#0a6ed1' NOT NULL,
	"secondary_color" text DEFAULT '#0854a0' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"date_format" text DEFAULT 'YYYY-MM-DD' NOT NULL,
	"fiscal_year_start" text DEFAULT '01-01' NOT NULL,
	"working_hours_start" text DEFAULT '09:00' NOT NULL,
	"working_hours_end" text DEFAULT '17:00' NOT NULL,
	"working_days" jsonb DEFAULT '["monday","tuesday","wednesday","thursday","friday"]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_id" uuid,
	"full_name" text,
	"display_name" text,
	"phone" text,
	"phone_extension" text,
	"department" text,
	"position" text,
	"employee_code" text,
	"hire_date" date,
	"avatar_url" text,
	"personal_email" text,
	"personal_email_verified" boolean DEFAULT false NOT NULL,
	"personal_email_verified_at" timestamp with time zone,
	"timezone" text DEFAULT 'UTC',
	"language" text DEFAULT 'en',
	"date_format" text DEFAULT 'YYYY-MM-DD',
	"time_format" text DEFAULT '24h',
	"notification_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"theme_preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"bio" text,
	"social_links" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_id" uuid,
	"role" "user_role" NOT NULL,
	"custom_role_name" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_by" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"refresh_token_hash" text,
	"ip_address" "inet",
	"user_agent" text,
	"device_fingerprint" text,
	"expires_at" timestamp with time zone NOT NULL,
	"refresh_expires_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_page_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"status" "page_assignment_status" DEFAULT 'active' NOT NULL,
	"cost_override" numeric(12, 2),
	"billing_cycle_override" text,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"is_trial" boolean DEFAULT false NOT NULL,
	"trial_started_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" uuid,
	"activated_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"suspended_by" uuid,
	"suspension_reason" text,
	"expires_at" timestamp with time zone,
	"auto_renew" boolean DEFAULT true NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp with time zone,
	"custom_quota" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_page_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"status" "page_request_status" DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal',
	"reason" text NOT NULL,
	"business_justification" text,
	"expected_usage" text,
	"expected_users" integer,
	"budget_allocated" numeric(12, 2),
	"desired_start_date" date,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"approved_cost" numeric(12, 2),
	"rejection_reason" text,
	"auto_approved" boolean DEFAULT false NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"icon" text,
	"category" "page_category" NOT NULL,
	"parent_page_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"base_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly',
	"min_subscription_tier" text,
	"required_features" text[] DEFAULT '{}',
	"dependent_pages" uuid[],
	"is_active" boolean DEFAULT true NOT NULL,
	"is_beta" boolean DEFAULT false NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"requires_onboarding" boolean DEFAULT false NOT NULL,
	"has_trial" boolean DEFAULT false NOT NULL,
	"trial_duration_days" integer,
	"permissions_required" text[] DEFAULT '{}',
	"api_quota_default" integer,
	"storage_quota_mb" integer,
	"max_concurrent_users" integer,
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text[],
	"documentation_url" text,
	"video_tutorial_url" text,
	"support_email" text,
	"release_date" date,
	"deprecation_date" date,
	"replacement_page_id" uuid,
	"tags" text[] DEFAULT '{}',
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"analytics_enabled" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_catalog_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_pricing_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"tier_name" text NOT NULL,
	"tier_level" integer NOT NULL,
	"cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"quota_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"feature_flags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" date,
	"valid_until" date,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_recommendation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"industry" text[],
	"company_size" text[],
	"primary_focus" text[],
	"business_goals" text[],
	"priority" integer DEFAULT 5 NOT NULL,
	"weight" numeric(5, 2) DEFAULT '1.0' NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"min_employees" integer,
	"max_employees" integer,
	"min_revenue" numeric(15, 2),
	"max_revenue" numeric(15, 2),
	"geographic_regions" text[],
	"exclude_industries" text[],
	"custom_criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_recommendation_rules_page_id_unique" UNIQUE("page_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_usage_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"user_id" uuid,
	"date" date NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"unique_users" integer DEFAULT 0 NOT NULL,
	"total_duration_seconds" integer DEFAULT 0 NOT NULL,
	"avg_session_duration_seconds" integer,
	"action_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"performance_score" numeric(5, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"client_number" text NOT NULL,
	"name" text NOT NULL,
	"company_name" text,
	"industry" text,
	"status" text DEFAULT 'active' NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"contact_person" text,
	"contact_position" text,
	"contact_email" text,
	"contact_phone" text,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"billing_address" text,
	"billing_city" text,
	"billing_state" text,
	"billing_postal_code" text,
	"billing_country" text,
	"tax_id" text,
	"payment_terms" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"feature_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_features_feature_key_unique" UNIQUE("feature_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "currencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10),
	"exchange_rate" numeric(10, 4) DEFAULT '1',
	"is_base" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"password_hash" text NOT NULL,
	"email_confirmed" boolean DEFAULT false NOT NULL,
	"email_confirmed_at" timestamp with time zone,
	"phone" text,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"password_changed_at" timestamp with time zone,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"terms_accepted_at" timestamp with time zone,
	"terms_version" text,
	"privacy_accepted_at" timestamp with time zone,
	"last_sign_in_at" timestamp with time zone,
	"last_sign_in_ip" "inet",
	"sign_in_count" integer DEFAULT 0 NOT NULL,
	"raw_user_meta_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system_name" text DEFAULT 'BuildFlow ERP' NOT NULL,
	"system_tagline" text,
	"system_description" text,
	"logo_url" text,
	"logo_light_url" text,
	"logo_dark_url" text,
	"favicon_url" text,
	"login_logo_url" text,
	"email_logo_url" text,
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" text[],
	"og_image_url" text,
	"og_title" text,
	"og_description" text,
	"twitter_card_type" "twitter_card_type" DEFAULT 'summary_large_image',
	"twitter_site" text,
	"twitter_creator" text,
	"google_analytics_id" text,
	"google_tag_manager_id" text,
	"facebook_pixel_id" text,
	"custom_tracking_code" text,
	"custom_head_scripts" text,
	"custom_body_scripts" text,
	"ad_network_enabled" boolean DEFAULT false NOT NULL,
	"ad_network_code" text,
	"ad_placement_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"support_email" text,
	"support_phone" text,
	"support_address" jsonb,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"legal_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"email_provider" "email_provider_type" DEFAULT 'smtp',
	"smtp_host" text,
	"smtp_port" integer DEFAULT 587,
	"smtp_user" text,
	"smtp_password_encrypted" text,
	"smtp_from_email" text,
	"smtp_from_name" text,
	"smtp_use_tls" boolean DEFAULT true NOT NULL,
	"smtp_use_ssl" boolean DEFAULT false NOT NULL,
	"sendgrid_api_key_encrypted" text,
	"sendgrid_from_email" text,
	"sendgrid_from_name" text,
	"mailgun_api_key_encrypted" text,
	"mailgun_domain" text,
	"mailgun_region" text DEFAULT 'us',
	"aws_ses_region" text,
	"aws_ses_access_key_encrypted" text,
	"aws_ses_secret_key_encrypted" text,
	"aws_ses_from_email" text,
	"aws_ses_from_name" text,
	"resend_api_key_encrypted" text,
	"resend_from_email" text,
	"resend_from_name" text,
	"postmark_api_key_encrypted" text,
	"postmark_from_email" text,
	"postmark_from_name" text,
	"email_test_mode" boolean DEFAULT false NOT NULL,
	"email_test_recipient" text,
	"password_min_length" integer DEFAULT 8 NOT NULL,
	"password_max_length" integer DEFAULT 128 NOT NULL,
	"password_require_uppercase" boolean DEFAULT true NOT NULL,
	"password_require_lowercase" boolean DEFAULT true NOT NULL,
	"password_require_numbers" boolean DEFAULT true NOT NULL,
	"password_require_symbols" boolean DEFAULT false NOT NULL,
	"password_expiry_days" integer,
	"password_history_count" integer DEFAULT 5,
	"session_timeout_minutes" integer DEFAULT 60 NOT NULL,
	"session_absolute_timeout_hours" integer DEFAULT 24,
	"max_concurrent_sessions" integer DEFAULT 5,
	"max_login_attempts" integer DEFAULT 5 NOT NULL,
	"lockout_duration_minutes" integer DEFAULT 30 NOT NULL,
	"progressive_lockout" boolean DEFAULT true NOT NULL,
	"require_email_verification" boolean DEFAULT true NOT NULL,
	"email_verification_expires_hours" integer DEFAULT 24 NOT NULL,
	"enable_two_factor" boolean DEFAULT false NOT NULL,
	"force_two_factor_for_roles" text[] DEFAULT '{}',
	"enable_captcha" boolean DEFAULT false NOT NULL,
	"captcha_provider" text DEFAULT 'recaptcha_v3',
	"captcha_site_key" text,
	"captcha_secret_key_encrypted" text,
	"captcha_threshold" numeric(3, 2) DEFAULT '0.5',
	"enable_rate_limiting" boolean DEFAULT true NOT NULL,
	"rate_limit_requests_per_minute" integer DEFAULT 60 NOT NULL,
	"rate_limit_burst_size" integer DEFAULT 100,
	"ip_whitelist" "inet"[],
	"ip_blacklist" "inet"[],
	"enable_ip_geolocation" boolean DEFAULT false NOT NULL,
	"blocked_countries" text[],
	"allowed_countries" text[],
	"file_storage_provider" "storage_provider_type" DEFAULT 'local' NOT NULL,
	"file_storage_path" text DEFAULT '/app/storage',
	"max_file_size_bytes" bigint DEFAULT 10485760 NOT NULL,
	"max_total_storage_bytes" bigint,
	"allowed_mime_types" text[] DEFAULT '{"image/jpeg","image/png","image/gif","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/zip"}',
	"blocked_mime_types" text[] DEFAULT '{"application/x-executable","application/x-msdos-program"}',
	"enable_virus_scanning" boolean DEFAULT false NOT NULL,
	"virus_scan_provider" text,
	"aws_s3_bucket" text,
	"aws_s3_region" text,
	"aws_s3_access_key_encrypted" text,
	"aws_s3_secret_key_encrypted" text,
	"aws_s3_public_url" text,
	"cdn_enabled" boolean DEFAULT false NOT NULL,
	"cdn_url" text,
	"api_enabled" boolean DEFAULT true NOT NULL,
	"api_rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"api_rate_limit_requests_per_minute" integer DEFAULT 100,
	"api_timeout_seconds" integer DEFAULT 30 NOT NULL,
	"api_max_payload_size_bytes" integer DEFAULT 1048576,
	"enable_api_documentation" boolean DEFAULT true NOT NULL,
	"api_documentation_url" text,
	"enable_cors" boolean DEFAULT true NOT NULL,
	"cors_allowed_origins" text[],
	"cors_allowed_methods" text[] DEFAULT '{"GET","POST","PUT","DELETE","PATCH"}',
	"cors_allowed_headers" text[] DEFAULT '{"Content-Type","Authorization"}',
	"cors_max_age_seconds" integer DEFAULT 86400,
	"log_level" "log_level_type" DEFAULT 'info' NOT NULL,
	"enable_audit_logging" boolean DEFAULT true NOT NULL,
	"log_retention_days" integer DEFAULT 90 NOT NULL,
	"log_sensitive_data" boolean DEFAULT false NOT NULL,
	"enable_error_tracking" boolean DEFAULT false NOT NULL,
	"sentry_dsn_encrypted" text,
	"sentry_environment" text,
	"sentry_sample_rate" numeric(3, 2) DEFAULT '1.0',
	"enable_performance_monitoring" boolean DEFAULT false NOT NULL,
	"performance_sample_rate" numeric(3, 2) DEFAULT '0.1',
	"enable_auto_backup" boolean DEFAULT true NOT NULL,
	"backup_schedule" text DEFAULT '0 2 * * *',
	"backup_retention_days" integer DEFAULT 30 NOT NULL,
	"backup_storage_provider" "storage_provider_type" DEFAULT 'local',
	"backup_storage_path" text DEFAULT '/app/backups',
	"backup_encryption_enabled" boolean DEFAULT true NOT NULL,
	"backup_compression_enabled" boolean DEFAULT true NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"maintenance_message" text,
	"maintenance_allowed_ips" "inet"[],
	"maintenance_start_time" timestamp with time zone,
	"maintenance_end_time" timestamp with time zone,
	"default_language" text DEFAULT 'en' NOT NULL,
	"available_languages" text[] DEFAULT '{"en"}',
	"default_timezone" text DEFAULT 'UTC' NOT NULL,
	"default_currency_code" text DEFAULT 'USD',
	"default_date_format" text DEFAULT 'YYYY-MM-DD',
	"default_time_format" text DEFAULT 'HH:mm:ss',
	"enable_registration" boolean DEFAULT true NOT NULL,
	"registration_requires_approval" boolean DEFAULT false NOT NULL,
	"registration_auto_verify_email" boolean DEFAULT false NOT NULL,
	"default_user_role" text,
	"enable_invitations" boolean DEFAULT true NOT NULL,
	"invitation_expiry_hours" integer DEFAULT 72,
	"terms_version" text,
	"terms_last_updated" timestamp with time zone,
	"privacy_version" text,
	"privacy_last_updated" timestamp with time zone,
	"cookie_consent_enabled" boolean DEFAULT true NOT NULL,
	"gdpr_compliant" boolean DEFAULT true NOT NULL,
	"data_retention_days" integer,
	"enable_data_export" boolean DEFAULT true NOT NULL,
	"enable_account_deletion" boolean DEFAULT true NOT NULL,
	"system_version" text,
	"deployment_environment" text DEFAULT 'production',
	"feature_flags" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"custom_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid,
	"user_id" uuid,
	"session_id" uuid,
	"table_name" text NOT NULL,
	"record_id" uuid,
	"action" "audit_action" NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_fields" text[],
	"ip_address" "inet",
	"user_agent" text,
	"request_id" text,
	"endpoint" text,
	"method" text,
	"status_code" integer,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_alert_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_name" text NOT NULL,
	"metric_name" text NOT NULL,
	"condition" text NOT NULL,
	"threshold_value" numeric(15, 2) NOT NULL,
	"comparison_operator" text NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"duration_seconds" integer DEFAULT 60 NOT NULL,
	"cooldown_seconds" integer DEFAULT 300 NOT NULL,
	"notification_channels" text[] DEFAULT '{}' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_alert_rules_rule_name_unique" UNIQUE("rule_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_rule_id" uuid,
	"severity" "alert_severity" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"metric_name" text,
	"current_value" numeric(15, 2),
	"threshold_value" numeric(15, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"triggered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"resolution_notes" text,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"notification_sent_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_health_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"overall_status" "health_status" DEFAULT 'healthy' NOT NULL,
	"db_status" "health_status",
	"db_response_time_ms" integer,
	"db_size_bytes" bigint,
	"db_connections_active" integer,
	"db_connections_idle" integer,
	"db_connections_waiting" integer,
	"db_connections_max" integer,
	"db_connections_usage_percent" numeric(5, 2),
	"db_locks_count" integer,
	"db_deadlocks_count" integer,
	"db_cache_hit_ratio" numeric(5, 2),
	"db_index_usage_percent" numeric(5, 2),
	"db_table_count" integer,
	"db_total_rows" bigint,
	"db_temp_files" integer,
	"db_temp_bytes" bigint,
	"db_transaction_rate" numeric(10, 2),
	"db_query_rate" numeric(10, 2),
	"db_slow_queries" integer,
	"redis_status" "health_status",
	"redis_response_time_ms" integer,
	"redis_memory_used_bytes" bigint,
	"redis_memory_peak_bytes" bigint,
	"redis_memory_fragmentation_ratio" numeric(5, 2),
	"redis_connected_clients" integer,
	"redis_blocked_clients" integer,
	"redis_commands_processed" bigint,
	"redis_keyspace_hits" bigint,
	"redis_keyspace_misses" bigint,
	"redis_hit_rate" numeric(5, 2),
	"redis_evicted_keys" bigint,
	"redis_expired_keys" bigint,
	"redis_cpu_usage_percent" numeric(5, 2),
	"system_platform" text,
	"system_arch" text,
	"system_node_version" text,
	"system_uptime_seconds" integer,
	"system_memory_total_bytes" bigint,
	"system_memory_used_bytes" bigint,
	"system_memory_free_bytes" bigint,
	"system_memory_usage_percent" numeric(5, 2),
	"system_cpu_count" integer,
	"system_cpu_model" text,
	"system_cpu_usage_percent" numeric(5, 2),
	"system_load_avg_1min" numeric(10, 2),
	"system_load_avg_5min" numeric(10, 2),
	"system_load_avg_15min" numeric(10, 2),
	"system_disk_total_bytes" bigint,
	"system_disk_used_bytes" bigint,
	"system_disk_free_bytes" bigint,
	"system_disk_usage_percent" numeric(5, 2),
	"process_memory_rss_bytes" bigint,
	"process_memory_heap_total_bytes" bigint,
	"process_memory_heap_used_bytes" bigint,
	"process_memory_heap_limit_bytes" bigint,
	"process_memory_external_bytes" bigint,
	"process_cpu_user_microseconds" bigint,
	"process_cpu_system_microseconds" bigint,
	"process_event_loop_lag_ms" numeric(10, 2),
	"api_response_time_avg_ms" integer,
	"api_response_time_p50_ms" integer,
	"api_response_time_p95_ms" integer,
	"api_response_time_p99_ms" integer,
	"api_requests_total" integer,
	"api_requests_per_second" numeric(10, 2),
	"api_error_count" integer,
	"api_error_rate_percent" numeric(5, 2),
	"api_timeout_count" integer,
	"active_sessions" integer,
	"active_websockets" integer,
	"queue_length" integer,
	"queue_processing_rate" numeric(10, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"status" text DEFAULT 'investigating' NOT NULL,
	"affected_services" text[] DEFAULT '{}' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"duration_seconds" integer,
	"root_cause" text,
	"resolution_summary" text,
	"impact_description" text,
	"affected_users_count" integer,
	"created_by" uuid,
	"assigned_to" uuid,
	"related_alerts" uuid[],
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_incidents_incident_number_unique" UNIQUE("incident_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_sla_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_date" timestamp NOT NULL,
	"service_name" text NOT NULL,
	"uptime_percentage" numeric(5, 2) NOT NULL,
	"downtime_minutes" integer DEFAULT 0 NOT NULL,
	"total_requests" bigint DEFAULT 0 NOT NULL,
	"successful_requests" bigint DEFAULT 0 NOT NULL,
	"failed_requests" bigint DEFAULT 0 NOT NULL,
	"avg_response_time_ms" numeric(10, 2),
	"p95_response_time_ms" numeric(10, 2),
	"p99_response_time_ms" numeric(10, 2),
	"incident_count" integer DEFAULT 0 NOT NULL,
	"mttr_minutes" numeric(10, 2),
	"mttd_minutes" numeric(10, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_provisioning_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text,
	"status" "provisioning_job_status" DEFAULT 'pending' NOT NULL,
	"domain" text NOT NULL,
	"database_name" text NOT NULL,
	"agency_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"subscription_plan" text,
	"requested_by" uuid,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"validation_errors" jsonb,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"current_step" text,
	"steps_completed" text[] DEFAULT '{}',
	"steps_total" integer,
	"result" jsonb,
	"agency_id" uuid,
	"error_message" text,
	"error_code" text,
	"error_details" jsonb,
	"stack_trace" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"priority" integer DEFAULT 5 NOT NULL,
	"timeout_seconds" integer DEFAULT 300 NOT NULL,
	"worker_id" text,
	"worker_hostname" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancellation_reason" text,
	"estimated_completion_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_provisioning_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"step" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"base_price_monthly" numeric(12, 2) DEFAULT '0' NOT NULL,
	"base_price_yearly" numeric(12, 2) DEFAULT '0' NOT NULL,
	"max_users" integer DEFAULT 5 NOT NULL,
	"max_storage_gb" integer DEFAULT 1 NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_name_unique" UNIQUE("name"),
	CONSTRAINT "subscription_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"agency_id" uuid,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"agency_id" uuid,
	"user_id" uuid,
	"assigned_to" uuid,
	"department" text,
	"page_url" text,
	"screenshot_url" text,
	"console_logs" jsonb,
	"error_details" jsonb,
	"browser_info" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"project_code" text,
	"project_type" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"deadline" timestamp with time zone,
	"budget" numeric(12, 2),
	"actual_cost" numeric(12, 2) DEFAULT '0',
	"allocated_budget" numeric(12, 2),
	"cost_center" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"client_id" uuid,
	"project_manager_id" uuid,
	"account_manager_id" uuid,
	"assigned_team" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"departments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agencies" ADD CONSTRAINT "agencies_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_assignments" ADD CONSTRAINT "agency_page_assignments_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_assignments" ADD CONSTRAINT "agency_page_assignments_page_id_page_catalog_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_assignments" ADD CONSTRAINT "agency_page_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_assignments" ADD CONSTRAINT "agency_page_assignments_suspended_by_users_id_fk" FOREIGN KEY ("suspended_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_requests" ADD CONSTRAINT "agency_page_requests_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_requests" ADD CONSTRAINT "agency_page_requests_page_id_page_catalog_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_requests" ADD CONSTRAINT "agency_page_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_page_requests" ADD CONSTRAINT "agency_page_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_catalog" ADD CONSTRAINT "page_catalog_parent_page_id_page_catalog_id_fk" FOREIGN KEY ("parent_page_id") REFERENCES "public"."page_catalog"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_catalog" ADD CONSTRAINT "page_catalog_replacement_page_id_page_catalog_id_fk" FOREIGN KEY ("replacement_page_id") REFERENCES "public"."page_catalog"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_pricing_tiers" ADD CONSTRAINT "page_pricing_tiers_page_id_page_catalog_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_recommendation_rules" ADD CONSTRAINT "page_recommendation_rules_page_id_page_catalog_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_usage_analytics" ADD CONSTRAINT "page_usage_analytics_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_usage_analytics" ADD CONSTRAINT "page_usage_analytics_page_id_page_catalog_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."page_catalog"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page_usage_analytics" ADD CONSTRAINT "page_usage_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clients" ADD CONSTRAINT "clients_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_session_id_user_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_alert_rule_id_system_alert_rules_id_fk" FOREIGN KEY ("alert_rule_id") REFERENCES "public"."system_alert_rules"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_alerts" ADD CONSTRAINT "system_alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_incidents" ADD CONSTRAINT "system_incidents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_incidents" ADD CONSTRAINT "system_incidents_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_provisioning_jobs" ADD CONSTRAINT "agency_provisioning_jobs_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_provisioning_jobs" ADD CONSTRAINT "agency_provisioning_jobs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_provisioning_jobs" ADD CONSTRAINT "agency_provisioning_jobs_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_provisioning_logs" ADD CONSTRAINT "agency_provisioning_logs_job_id_agency_provisioning_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."agency_provisioning_jobs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_project_manager_id_users_id_fk" FOREIGN KEY ("project_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_account_manager_id_users_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_domain" ON "agencies" USING btree ("domain") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_database_name" ON "agencies" USING btree ("database_name") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_owner_user_id" ON "agencies" USING btree ("owner_user_id") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_status" ON "agencies" USING btree ("status") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_subscription_plan" ON "agencies" USING btree ("subscription_plan");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_is_active" ON "agencies" USING btree ("is_active") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_created_at" ON "agencies" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_verification_tokens_token_hash" ON "email_verification_tokens" USING btree ("token_hash") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_user_id" ON "email_verification_tokens" USING btree ("user_id") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_expires_at" ON "email_verification_tokens" USING btree ("expires_at") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_password_reset_tokens_token_hash" ON "password_reset_tokens" USING btree ("token_hash") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id" ON "password_reset_tokens" USING btree ("user_id") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_expires_at" ON "password_reset_tokens" USING btree ("expires_at") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles" USING btree ("user_id") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_agency_id" ON "profiles" USING btree ("agency_id") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_employee_code" ON "profiles" USING btree ("employee_code") WHERE employee_code IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_full_name" ON "profiles" USING btree ("full_name") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_is_active" ON "profiles" USING btree ("is_active") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_roles_active_unique" ON "user_roles" USING btree ("user_id","role","agency_id") WHERE is_active = true AND revoked_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_user_id" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_agency_id" ON "user_roles" USING btree ("agency_id") WHERE agency_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_role" ON "user_roles" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_is_active" ON "user_roles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_roles_valid_until" ON "user_roles" USING btree ("valid_until") WHERE valid_until IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_sessions_token_hash" ON "user_sessions" USING btree ("token_hash") WHERE is_active = true AND revoked_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_expires_at" ON "user_sessions" USING btree ("expires_at") WHERE is_active = true;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_agency_page" ON "agency_page_assignments" USING btree ("agency_id","page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_assignments_agency_id" ON "agency_page_assignments" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_assignments_page_id" ON "agency_page_assignments" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_assignments_status" ON "agency_page_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_assignments_trial" ON "agency_page_assignments" USING btree ("trial_ends_at") WHERE is_trial = true AND status = 'trial';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_assignments_expires" ON "agency_page_assignments" USING btree ("expires_at") WHERE expires_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_requests_agency_id" ON "agency_page_requests" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_requests_page_id" ON "agency_page_requests" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_requests_status" ON "agency_page_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_requests_requested_by" ON "agency_page_requests" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_page_requests_priority" ON "agency_page_requests" USING btree ("priority","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_page_catalog_path" ON "page_catalog" USING btree ("path") WHERE "page_catalog"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_category" ON "page_catalog" USING btree ("category") WHERE is_active = true AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_parent_page_id" ON "page_catalog" USING btree ("parent_page_id") WHERE parent_page_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_is_active" ON "page_catalog" USING btree ("is_active") WHERE "page_catalog"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_display_order" ON "page_catalog" USING btree ("category","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_page_tier" ON "page_pricing_tiers" USING btree ("page_id","tier_name","billing_cycle");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_pricing_tiers_page_id" ON "page_pricing_tiers" USING btree ("page_id") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_pricing_tiers_tier_name" ON "page_pricing_tiers" USING btree ("tier_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_recommendation_rules_page_id" ON "page_recommendation_rules" USING btree ("page_id") WHERE is_active = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_recommendation_rules_priority" ON "page_recommendation_rules" USING btree ("priority");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_page_usage_daily" ON "page_usage_analytics" USING btree ("agency_id","page_id","date","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_usage_analytics_agency_id" ON "page_usage_analytics" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_usage_analytics_page_id" ON "page_usage_analytics" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_usage_analytics_date" ON "page_usage_analytics" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_agency_id" ON "clients" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_email" ON "clients" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_status" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_currencies_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_currencies_is_base" ON "currencies" USING btree ("is_base");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_normalized" ON "users" USING btree ("email_normalized") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users" USING btree ("phone") WHERE phone IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" USING btree ("status") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email_confirmed" ON "users" USING btree ("email_confirmed") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_locked_until" ON "users" USING btree ("locked_until") WHERE locked_until IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_system_settings_singleton" ON "system_settings" USING btree ((1));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_agency_id" ON "audit_logs" USING btree ("agency_id") WHERE agency_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_session_id" ON "audit_logs" USING btree ("session_id") WHERE session_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_table_name" ON "audit_logs" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_record_id" ON "audit_logs" USING btree ("record_id") WHERE record_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_table_record" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_request_id" ON "audit_logs" USING btree ("request_id") WHERE request_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alert_rules_enabled" ON "system_alert_rules" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alert_rules_metric" ON "system_alert_rules" USING btree ("metric_name") WHERE is_enabled = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alerts_status" ON "system_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alerts_severity" ON "system_alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alerts_triggered_at" ON "system_alerts" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_alerts_alert_rule_id" ON "system_alerts" USING btree ("alert_rule_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_health_metrics_timestamp" ON "system_health_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_health_metrics_overall_status" ON "system_health_metrics" USING btree ("overall_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_health_metrics_db_status" ON "system_health_metrics" USING btree ("db_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_health_metrics_redis_status" ON "system_health_metrics" USING btree ("redis_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_incidents_status" ON "system_incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_incidents_severity" ON "system_incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_incidents_started_at" ON "system_incidents" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_incidents_assigned_to" ON "system_incidents" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_sla_metrics_date" ON "system_sla_metrics" USING btree ("metric_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_system_sla_metrics_service" ON "system_sla_metrics" USING btree ("service_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_sla_metric_per_service_day" ON "system_sla_metrics" USING btree ("metric_date","service_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_idempotency" ON "agency_provisioning_jobs" USING btree ("idempotency_key") WHERE idempotency_key IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_status" ON "agency_provisioning_jobs" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_domain" ON "agency_provisioning_jobs" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_database_name" ON "agency_provisioning_jobs" USING btree ("database_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_requested_by" ON "agency_provisioning_jobs" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_agency_id" ON "agency_provisioning_jobs" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_created_at" ON "agency_provisioning_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_logs_job_id" ON "agency_provisioning_logs" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_logs_level" ON "agency_provisioning_logs" USING btree ("level") WHERE level IN ('error', 'warn');--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_agency_id" ON "notifications" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_ticket_number" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_agency_id" ON "tickets" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_user_id" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_agency_id" ON "projects" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_client_id" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_project_manager_id" ON "projects" USING btree ("project_manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_project_code" ON "projects" USING btree ("project_code");