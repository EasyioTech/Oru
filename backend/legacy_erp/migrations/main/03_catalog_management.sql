CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE page_category_type AS ENUM ('dashboard', 'management', 'finance', 'hr', 'projects', 'reports', 'personal', 'settings', 'system', 'inventory', 'procurement', 'assets', 'workflows', 'automation', 'compliance', 'analytics');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE page_assignment_status AS ENUM ('active', 'pending_approval', 'suspended', 'trial', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE page_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.page_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category page_category_type NOT NULL,
    parent_page_id UUID REFERENCES public.page_catalog(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    base_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'one_time')),
    min_subscription_tier TEXT,
    required_features TEXT[] DEFAULT '{}',
    dependent_pages UUID[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_beta BOOLEAN NOT NULL DEFAULT false,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    requires_onboarding BOOLEAN NOT NULL DEFAULT false,
    has_trial BOOLEAN NOT NULL DEFAULT false,
    trial_duration_days INTEGER,
    permissions_required TEXT[] DEFAULT '{}',
    api_quota_default INTEGER,
    storage_quota_mb INTEGER,
    max_concurrent_users INTEGER,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    documentation_url TEXT,
    video_tutorial_url TEXT,
    support_email TEXT,
    release_date DATE,
    deprecation_date DATE,
    replacement_page_id UUID REFERENCES public.page_catalog(id),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    analytics_enabled BOOLEAN NOT NULL DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_catalog_path ON public.page_catalog(lower(path)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_page_catalog_category ON public.page_catalog(category) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_page_catalog_parent_page_id ON public.page_catalog(parent_page_id) WHERE parent_page_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_catalog_is_active ON public.page_catalog(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_page_catalog_tags ON public.page_catalog USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_page_catalog_display_order ON public.page_catalog(category, display_order);

CREATE TABLE IF NOT EXISTS public.page_recommendation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL UNIQUE REFERENCES public.page_catalog(id) ON DELETE CASCADE,
    industry TEXT[],
    company_size TEXT[],
    primary_focus TEXT[],
    business_goals TEXT[],
    priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    is_required BOOLEAN NOT NULL DEFAULT false,
    min_employees INTEGER,
    max_employees INTEGER,
    min_revenue NUMERIC(15,2),
    max_revenue NUMERIC(15,2),
    geographic_regions TEXT[],
    exclude_industries TEXT[],
    custom_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_recommendation_rules_page_id ON public.page_recommendation_rules(page_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_page_recommendation_rules_priority ON public.page_recommendation_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_page_recommendation_rules_required ON public.page_recommendation_rules(is_required) WHERE is_required = true;

CREATE TABLE IF NOT EXISTS public.agency_page_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.page_catalog(id) ON DELETE CASCADE,
    status page_assignment_status NOT NULL DEFAULT 'active',
    cost_override NUMERIC(12,2),
    billing_cycle_override TEXT CHECK (billing_cycle_override IN ('monthly', 'quarterly', 'annual', 'one_time')),
    discount_percent NUMERIC(5,2) DEFAULT 0,
    is_trial BOOLEAN NOT NULL DEFAULT false,
    trial_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES public.users(id),
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    suspended_by UUID REFERENCES public.users(id),
    suspension_reason TEXT,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    custom_quota JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_agency_page UNIQUE (agency_id, page_id)
);

CREATE INDEX IF NOT EXISTS idx_agency_page_assignments_agency_id ON public.agency_page_assignments(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_page_assignments_page_id ON public.agency_page_assignments(page_id);
CREATE INDEX IF NOT EXISTS idx_agency_page_assignments_status ON public.agency_page_assignments(status);
CREATE INDEX IF NOT EXISTS idx_agency_page_assignments_trial ON public.agency_page_assignments(trial_ends_at) WHERE is_trial = true AND status = 'trial';
CREATE INDEX IF NOT EXISTS idx_agency_page_assignments_expires ON public.agency_page_assignments(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.page_pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.page_catalog(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    tier_level INTEGER NOT NULL,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'one_time')),
    quota_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_page_tier UNIQUE (page_id, tier_name, billing_cycle)
);

CREATE INDEX IF NOT EXISTS idx_page_pricing_tiers_page_id ON public.page_pricing_tiers(page_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_page_pricing_tiers_tier_name ON public.page_pricing_tiers(tier_name);
CREATE INDEX IF NOT EXISTS idx_page_pricing_tiers_tier_level ON public.page_pricing_tiers(tier_level);

CREATE TABLE IF NOT EXISTS public.agency_page_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.page_catalog(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.users(id),
    status page_request_status NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    reason TEXT NOT NULL,
    business_justification TEXT,
    expected_usage TEXT,
    expected_users INTEGER,
    budget_allocated NUMERIC(12,2),
    desired_start_date DATE,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    approved_cost NUMERIC(12,2),
    rejection_reason TEXT,
    auto_approved BOOLEAN NOT NULL DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_page_requests_agency_id ON public.agency_page_requests(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_page_requests_page_id ON public.agency_page_requests(page_id);
CREATE INDEX IF NOT EXISTS idx_agency_page_requests_status ON public.agency_page_requests(status);
CREATE INDEX IF NOT EXISTS idx_agency_page_requests_requested_by ON public.agency_page_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_agency_page_requests_priority ON public.agency_page_requests(priority, status);

CREATE TABLE IF NOT EXISTS public.page_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    page_id UUID NOT NULL REFERENCES public.page_catalog(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    date DATE NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    avg_session_duration_seconds INTEGER,
    action_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    performance_score NUMERIC(5,2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_page_usage_daily UNIQUE (agency_id, page_id, date, user_id)
);

CREATE INDEX IF NOT EXISTS idx_page_usage_analytics_agency_id ON public.page_usage_analytics(agency_id);
CREATE INDEX IF NOT EXISTS idx_page_usage_analytics_page_id ON public.page_usage_analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_page_usage_analytics_date ON public.page_usage_analytics(date DESC);

DROP TRIGGER IF EXISTS update_page_catalog_updated_at ON public.page_catalog;
CREATE TRIGGER update_page_catalog_updated_at
    BEFORE UPDATE ON public.page_catalog
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_recommendation_rules_updated_at ON public.page_recommendation_rules;
CREATE TRIGGER update_page_recommendation_rules_updated_at
    BEFORE UPDATE ON public.page_recommendation_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_page_assignments_updated_at ON public.agency_page_assignments;
CREATE TRIGGER update_agency_page_assignments_updated_at
    BEFORE UPDATE ON public.agency_page_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_pricing_tiers_updated_at ON public.page_pricing_tiers;
CREATE TRIGGER update_page_pricing_tiers_updated_at
    BEFORE UPDATE ON public.page_pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_page_requests_updated_at ON public.agency_page_requests;
CREATE TRIGGER update_agency_page_requests_updated_at
    BEFORE UPDATE ON public.agency_page_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
