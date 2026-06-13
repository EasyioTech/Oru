CREATE TABLE IF NOT EXISTS "crm_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"lead_id" uuid,
	"client_id" uuid,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"assigned_to" uuid,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"lead_number" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text,
	"contact_phone" text,
	"source" text,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"value" numeric(12, 2),
	"currency" text DEFAULT 'USD',
	"assigned_to" uuid,
	"expected_close" date,
	"notes" text,
	"converted_to_client_id" uuid,
	"converted_at" timestamp with time zone,
	"created_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"display_order" timestamp DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image" text,
	"author_id" uuid,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"seo_title" text,
	"seo_description" text,
	"seo_keywords" text[],
	"related_feature_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"manager_id" uuid,
	"parent_department_id" uuid,
	"budget" numeric(12, 2),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"user_id" uuid,
	"profile_id" uuid,
	"department_id" uuid,
	"employee_code" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"position" text,
	"employment_type" text,
	"status" text DEFAULT 'active' NOT NULL,
	"hire_date" date,
	"salary" numeric(12, 2),
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"address" text,
	"avatar_url" text,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"total_days" integer NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leave_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"max_days_per_year" integer,
	"is_paid" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_catalog" DROP CONSTRAINT "page_catalog_replacement_page_id_page_catalog_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_agencies_database_name";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_agency_provisioning_jobs_database_name";--> statement-breakpoint
ALTER TABLE "system_settings" ALTER COLUMN "system_name" SET DEFAULT 'Oru ERP';--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "agency_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_client_id_clients_id_fk" FOREIGN KEY ("converted_to_client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_related_feature_id_page_catalog_id_fk" FOREIGN KEY ("related_feature_id") REFERENCES "public"."page_catalog"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_profiles_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_activities_agency_id" ON "crm_activities" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_activities_lead_id" ON "crm_activities" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_activities_client_id" ON "crm_activities" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_activities_status" ON "crm_activities" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_crm_activities_due_date" ON "crm_activities" USING btree ("due_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_leads_agency_lead_number" ON "leads" USING btree ("agency_id","lead_number") WHERE "leads"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_agency_id" ON "leads" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_assigned_to" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_blog_posts_slug" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_posts_published" ON "blog_posts" USING btree ("published_at") WHERE is_published = true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_posts_category" ON "blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_blog_posts_feature" ON "blog_posts" USING btree ("related_feature_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_departments_agency_name" ON "departments" USING btree ("agency_id","name") WHERE "departments"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_employees_agency_code" ON "employees" USING btree ("agency_id","employee_code") WHERE employee_code IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_employees_agency_email" ON "employees" USING btree ("agency_id","email") WHERE "employees"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employees_department" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_employees_status" ON "employees" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leave_requests_agency_id" ON "leave_requests" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leave_requests_employee_id" ON "leave_requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leave_requests_status" ON "leave_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_leave_types_agency_name" ON "leave_types" USING btree ("agency_id","name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_agency_id" ON "user_sessions" USING btree ("agency_id") WHERE agency_id IS NOT NULL AND is_active = true;--> statement-breakpoint
ALTER TABLE "agencies" DROP COLUMN IF EXISTS "database_name";--> statement-breakpoint
ALTER TABLE "agency_settings" DROP COLUMN IF EXISTS "default_currency";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "personal_email";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "personal_email_verified";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "personal_email_verified_at";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "bio";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "social_links";--> statement-breakpoint
ALTER TABLE "user_sessions" DROP COLUMN IF EXISTS "device_fingerprint";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "api_quota_default";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "storage_quota_mb";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "max_concurrent_users";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "seo_title";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "seo_description";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "seo_keywords";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "documentation_url";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "video_tutorial_url";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "support_email";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "release_date";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "deprecation_date";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "replacement_page_id";--> statement-breakpoint
ALTER TABLE "page_catalog" DROP COLUMN IF EXISTS "analytics_enabled";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "phone_extension";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "logo_light_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "logo_dark_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "login_logo_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "email_logo_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "meta_title";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "meta_description";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "meta_keywords";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "og_image_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "og_title";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "og_description";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "twitter_card_type";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "twitter_site";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "twitter_creator";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "google_analytics_id";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "google_tag_manager_id";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "facebook_pixel_id";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "custom_tracking_code";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "custom_head_scripts";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "custom_body_scripts";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "ad_network_enabled";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "ad_network_code";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "ad_placement_config";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "mailgun_api_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "mailgun_domain";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "mailgun_region";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_ses_region";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_ses_access_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_ses_secret_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_ses_from_email";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_ses_from_name";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "resend_api_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "resend_from_email";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "resend_from_name";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "postmark_api_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "postmark_from_email";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "postmark_from_name";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "email_test_mode";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "email_test_recipient";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "session_absolute_timeout_hours";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "max_concurrent_sessions";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "progressive_lockout";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_captcha";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "captcha_provider";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "captcha_site_key";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "captcha_secret_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "captcha_threshold";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "ip_whitelist";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "ip_blacklist";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_ip_geolocation";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "blocked_countries";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "allowed_countries";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_virus_scanning";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "virus_scan_provider";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_bucket";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_region";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_access_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_secret_key_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_endpoint";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "aws_s3_public_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "cdn_enabled";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "cdn_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_api_documentation";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "api_documentation_url";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "cors_allowed_methods";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "cors_allowed_headers";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "cors_max_age_seconds";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_error_tracking";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "sentry_dsn_encrypted";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "sentry_environment";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "sentry_sample_rate";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "enable_performance_monitoring";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "performance_sample_rate";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "registration_requires_approval";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "registration_auto_verify_email";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "default_user_role";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "terms_last_updated";--> statement-breakpoint
ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "privacy_last_updated";--> statement-breakpoint
ALTER TABLE "agency_provisioning_jobs" DROP COLUMN IF EXISTS "database_name";--> statement-breakpoint
ALTER TABLE "agency_provisioning_jobs" DROP COLUMN IF EXISTS "steps_total";--> statement-breakpoint
ALTER TABLE "agency_provisioning_jobs" DROP COLUMN IF EXISTS "worker_hostname";--> statement-breakpoint
ALTER TABLE "agency_provisioning_jobs" DROP COLUMN IF EXISTS "estimated_completion_at";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "allocated_budget";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "currency";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "categories";--> statement-breakpoint
ALTER TABLE "public"."system_settings" ALTER COLUMN "file_storage_provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."system_settings" ALTER COLUMN "backup_storage_provider" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."system_storage_providers" ALTER COLUMN "provider_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."storage_provider_type";--> statement-breakpoint
CREATE TYPE "public"."storage_provider_type" AS ENUM('local', 'aws_s3', 'azure_blob', 'gcp_storage', 'digitalocean_spaces', 'r2', 'minio');--> statement-breakpoint
ALTER TABLE "public"."system_settings" ALTER COLUMN "file_storage_provider" SET DATA TYPE "public"."storage_provider_type" USING "file_storage_provider"::"public"."storage_provider_type";--> statement-breakpoint
ALTER TABLE "public"."system_settings" ALTER COLUMN "backup_storage_provider" SET DATA TYPE "public"."storage_provider_type" USING "backup_storage_provider"::"public"."storage_provider_type";--> statement-breakpoint
ALTER TABLE "public"."system_storage_providers" ALTER COLUMN "provider_type" SET DATA TYPE "public"."storage_provider_type" USING "provider_type"::"public"."storage_provider_type";