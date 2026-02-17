DO $$ BEGIN
 CREATE TYPE "public"."agency_status" AS ENUM('active', 'suspended', 'cancelled', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."agency_tier" AS ENUM('trial', 'starter', 'basic', 'professional', 'enterprise', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'error', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."health_status" AS ENUM('healthy', 'degraded', 'down', 'maintenance');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."page_assignment_status" AS ENUM('active', 'pending_approval', 'suspended', 'trial', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."page_category" AS ENUM('dashboard', 'management', 'finance', 'hr', 'projects', 'reports', 'personal', 'settings', 'system', 'inventory', 'procurement', 'assets', 'workflows', 'automation', 'compliance', 'analytics');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."page_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'locked');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
CREATE TABLE IF NOT EXISTS "agency_provisioning_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"steps" jsonb DEFAULT '[]'::jsonb,
	"error" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
 ALTER TABLE "agency_provisioning_jobs" ADD CONSTRAINT "agency_provisioning_jobs_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_domain" ON "agencies" USING btree ("domain") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_database_name" ON "agencies" USING btree ("database_name") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_owner_user_id" ON "agencies" USING btree ("owner_user_id") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_status" ON "agencies" USING btree ("status") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_subscription_plan" ON "agencies" USING btree ("subscription_plan");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_is_active" ON "agencies" USING btree ("is_active") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_created_at" ON "agencies" USING btree ("created_at");--> statement-breakpoint
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
CREATE INDEX IF NOT EXISTS "idx_audit_logs_agency_id" ON "audit_logs" USING btree ("agency_id") WHERE agency_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_session_id" ON "audit_logs" USING btree ("session_id") WHERE session_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_table_name" ON "audit_logs" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_record_id" ON "audit_logs" USING btree ("record_id") WHERE record_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_table_record" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_request_id" ON "audit_logs" USING btree ("request_id") WHERE request_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_currencies_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_currencies_is_base" ON "currencies" USING btree ("is_base");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_verification_tokens_token_hash" ON "email_verification_tokens" USING btree ("token_hash") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_user_id" ON "email_verification_tokens" USING btree ("user_id") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_expires_at" ON "email_verification_tokens" USING btree ("expires_at") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_page_catalog_path" ON "page_catalog" USING btree ("path") WHERE "page_catalog"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_category" ON "page_catalog" USING btree ("category") WHERE is_active = true AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_parent_page_id" ON "page_catalog" USING btree ("parent_page_id") WHERE parent_page_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_is_active" ON "page_catalog" USING btree ("is_active") WHERE "page_catalog"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_page_catalog_display_order" ON "page_catalog" USING btree ("category","display_order");--> statement-breakpoint
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
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_normalized" ON "users" USING btree ("email_normalized") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users" USING btree ("phone") WHERE phone IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" USING btree ("status") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email_confirmed" ON "users" USING btree ("email_confirmed") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_locked_until" ON "users" USING btree ("locked_until") WHERE locked_until IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" USING btree ("created_at");