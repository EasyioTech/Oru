CREATE TABLE IF NOT EXISTS "workspace_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"module" text,
	"action" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata_json" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_profiles" (
	"workspace_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modules_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"collaboration_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"adoption_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"health_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recommendations_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quick_wins_json" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_activity" ADD CONSTRAINT "workspace_activity_workspace_id_workspace_profiles_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace_profiles"("workspace_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workspace_activity_workspace_id" ON "workspace_activity" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_workspace_activity_timestamp" ON "workspace_activity" USING btree ("timestamp");