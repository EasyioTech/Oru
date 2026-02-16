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
CREATE UNIQUE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_idempotency" ON "agency_provisioning_jobs" USING btree ("idempotency_key") WHERE idempotency_key IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_status" ON "agency_provisioning_jobs" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_domain" ON "agency_provisioning_jobs" USING btree ("domain");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_database_name" ON "agency_provisioning_jobs" USING btree ("database_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_requested_by" ON "agency_provisioning_jobs" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_agency_id" ON "agency_provisioning_jobs" USING btree ("agency_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_jobs_created_at" ON "agency_provisioning_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_logs_job_id" ON "agency_provisioning_logs" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_agency_provisioning_logs_level" ON "agency_provisioning_logs" USING btree ("level") WHERE level IN ('error', 'warn');