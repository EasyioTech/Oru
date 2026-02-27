-- ============================================================================
-- BuildFlow ERP - Agency Provisioning Jobs (Main DB)
-- ============================================================================
-- Async agency creation: jobs table for 202 Accepted + poll pattern.
-- Database: buildflow_db
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agency_provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    domain TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.agency_provisioning_jobs IS 'Async agency creation jobs; poll by id for status and result';

CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_status ON public.agency_provisioning_jobs(status);
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_idempotency_key ON public.agency_provisioning_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_created_at ON public.agency_provisioning_jobs(created_at);
