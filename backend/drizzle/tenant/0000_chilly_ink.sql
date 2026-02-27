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
	"phone_extension" text,
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
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
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
	"agency_id" uuid NOT NULL,
	"agency_name" text NOT NULL,
	"logo_url" text,
	"domain" text,
	"default_currency_id" uuid,
	"default_currency" text DEFAULT 'USD' NOT NULL,
	"primary_color" text DEFAULT '#0a6ed1' NOT NULL,
	"secondary_color" text DEFAULT '#0854a0' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"date_format" text DEFAULT 'YYYY-MM-DD' NOT NULL,
	"fiscal_year_start" text DEFAULT '01-01' NOT NULL,
	"working_hours_start" text DEFAULT '09:00' NOT NULL,
	"working_hours_end" text DEFAULT '17:00' NOT NULL,
	"working_days" jsonb DEFAULT '["monday","tuesday","wednesday","thursday","friday"]'::jsonb NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
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
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"budget" numeric(12, 2) DEFAULT '0',
	"actual_cost" numeric(12, 2) DEFAULT '0',
	"allocated_budget" numeric(12, 2) DEFAULT '0',
	"cost_center" text,
	"currency_id" uuid,
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
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"agency_id" uuid NOT NULL,
	"user_id" uuid,
	"assigned_to" uuid,
	"department" text,
	"page_url" text,
	"screenshot_url" text,
	"console_logs" jsonb,
	"error_details" jsonb,
	"browser_info" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
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
DO $$ BEGIN
 ALTER TABLE "agencies" ADD CONSTRAINT "agencies_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_settings" ADD CONSTRAINT "agency_settings_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_settings" ADD CONSTRAINT "agency_settings_default_currency_id_currencies_id_fk" FOREIGN KEY ("default_currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "projects" ADD CONSTRAINT "projects_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_currency_id_currencies_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE no action ON UPDATE no action;
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
CREATE INDEX IF NOT EXISTS "idx_currencies_code" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_currencies_is_base" ON "currencies" USING btree ("is_base");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email_normalized" ON "users" USING btree ("email_normalized") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_phone" ON "users" USING btree ("phone") WHERE phone IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" USING btree ("status") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email_confirmed" ON "users" USING btree ("email_confirmed") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_locked_until" ON "users" USING btree ("locked_until") WHERE locked_until IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_domain" ON "agencies" USING btree ("domain") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agencies_database_name" ON "agencies" USING btree ("database_name") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_owner_user_id" ON "agencies" USING btree ("owner_user_id") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_status" ON "agencies" USING btree ("status") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_subscription_plan" ON "agencies" USING btree ("subscription_plan");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_is_active" ON "agencies" USING btree ("is_active") WHERE "agencies"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agencies_created_at" ON "agencies" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agency_settings_agency_id" ON "agency_settings" USING btree ("agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_verification_tokens_token_hash" ON "email_verification_tokens" USING btree ("token_hash") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_user_id" ON "email_verification_tokens" USING btree ("user_id") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_verification_tokens_expires_at" ON "email_verification_tokens" USING btree ("expires_at") WHERE "email_verification_tokens"."used_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_password_reset_tokens_token_hash" ON "password_reset_tokens" USING btree ("token_hash") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_user_id" ON "password_reset_tokens" USING btree ("user_id") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_password_reset_tokens_expires_at" ON "password_reset_tokens" USING btree ("expires_at") WHERE "password_reset_tokens"."used_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles" USING btree ("user_id") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_agency_id" ON "profiles" USING btree ("agency_id") WHERE "profiles"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_profiles_employee_code_agency" ON "profiles" USING btree ("employee_code","agency_id") WHERE employee_code IS NOT NULL AND agency_id IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
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
CREATE INDEX IF NOT EXISTS "idx_user_sessions_refresh_token_hash" ON "user_sessions" USING btree ("refresh_token_hash") WHERE refresh_token_hash IS NOT NULL AND is_active = true AND revoked_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_agency_id" ON "clients" USING btree ("agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_client_number_agency" ON "clients" USING btree ("client_number","agency_id") WHERE "clients"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_email" ON "clients" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_clients_status" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_agency_id" ON "projects" USING btree ("agency_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_projects_project_code_agency" ON "projects" USING btree ("project_code","agency_id") WHERE "projects"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_client_id" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_project_manager_id" ON "projects" USING btree ("project_manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_ticket_number" ON "tickets" USING btree ("ticket_number") WHERE "tickets"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets" USING btree ("status") WHERE "tickets"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_priority" ON "tickets" USING btree ("priority") WHERE "tickets"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_agency_id" ON "tickets" USING btree ("agency_id") WHERE "tickets"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_user_id" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tickets_created_at" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_agency_id" ON "notifications" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" USING btree ("created_at");