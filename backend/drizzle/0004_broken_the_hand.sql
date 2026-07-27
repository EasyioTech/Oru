DROP INDEX IF EXISTS "idx_workspace_activity_workspace_id";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_workspace_activity_timestamp";--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "workspace_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "timestamp" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "timestamp" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "timestamp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_activity" ALTER COLUMN "metadata_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "created_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "updated_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "modules_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "modules_json" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "collaboration_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "collaboration_json" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "adoption_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "adoption_json" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "health_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "health_json" SET DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "recommendations_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "recommendations_json" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "quick_wins_json" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "workspace_profiles" ALTER COLUMN "quick_wins_json" SET DEFAULT '[]'::json;