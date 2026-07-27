DROP INDEX IF EXISTS "idx_workspace_activity_workspace_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_workspace_activity_timestamp";--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "workspace_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "workspace_id" SET DEFAULT gen_random_uuid();