ALTER TABLE "agency_page_assignments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agency_page_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_catalog" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_dependencies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_feature_requirements" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_pricing_tiers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_recommendation_rules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "page_usage_analytics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "agency_page_assignments" CASCADE;--> statement-breakpoint
DROP TABLE "agency_page_requests" CASCADE;--> statement-breakpoint
DROP TABLE "page_catalog" CASCADE;--> statement-breakpoint
DROP TABLE "page_dependencies" CASCADE;--> statement-breakpoint
DROP TABLE "page_feature_requirements" CASCADE;--> statement-breakpoint
DROP TABLE "page_pricing_tiers" CASCADE;--> statement-breakpoint
DROP TABLE "page_recommendation_rules" CASCADE;--> statement-breakpoint
DROP TABLE "page_usage_analytics" CASCADE;--> statement-breakpoint
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_related_feature_id_page_catalog_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_blog_posts_feature";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "related_feature_id";