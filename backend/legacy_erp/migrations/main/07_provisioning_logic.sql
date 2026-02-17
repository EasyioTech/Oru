CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE provisioning_job_status AS ENUM ('pending', 'validating', 'creating_database', 'seeding_data', 'assigning_permissions', 'completed', 'failed', 'cancelled', 'timeout');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.agency_provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key TEXT,
    status provisioning_job_status NOT NULL DEFAULT 'pending',
    domain TEXT NOT NULL,
    database_name TEXT NOT NULL,
    agency_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    subscription_plan TEXT,
    requested_by UUID REFERENCES public.users(id),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    validation_errors JSONB,
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    current_step TEXT,
    steps_completed TEXT[] DEFAULT '{}',
    steps_total INTEGER,
    result JSONB,
    agency_id UUID REFERENCES public.agencies(id),
    error_message TEXT,
    error_code TEXT,
    error_details JSONB,
    stack_trace TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    priority INTEGER NOT NULL DEFAULT 5,
    timeout_seconds INTEGER NOT NULL DEFAULT 300,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT,
    estimated_completion_at TIMESTAMPTZ,
    worker_id TEXT,
    worker_hostname TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT progress_valid CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT retry_count_valid CHECK (retry_count >= 0 AND retry_count <= max_retries),
    CONSTRAINT timeout_valid CHECK (timeout_seconds > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_idempotency ON public.agency_provisioning_jobs(idempotency_key) 
    WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_status ON public.agency_provisioning_jobs(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_domain ON public.agency_provisioning_jobs(lower(domain));
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_database_name ON public.agency_provisioning_jobs(lower(database_name));
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_requested_by ON public.agency_provisioning_jobs(requested_by) WHERE requested_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_agency_id ON public.agency_provisioning_jobs(agency_id) WHERE agency_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_created_at ON public.agency_provisioning_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_retry ON public.agency_provisioning_jobs(next_retry_at) 
    WHERE status = 'failed' AND retry_count < max_retries AND next_retry_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_jobs_timeout ON public.agency_provisioning_jobs(started_at, timeout_seconds) 
    WHERE status IN ('validating', 'creating_database', 'seeding_data', 'assigning_permissions');

CREATE TABLE IF NOT EXISTS public.agency_provisioning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.agency_provisioning_jobs(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    step TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agency_provisioning_logs_job_id ON public.agency_provisioning_logs(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_provisioning_logs_level ON public.agency_provisioning_logs(level) WHERE level IN ('error', 'warn');

DROP TRIGGER IF EXISTS update_agency_provisioning_jobs_updated_at ON public.agency_provisioning_jobs;
CREATE TRIGGER update_agency_provisioning_jobs_updated_at
    BEFORE UPDATE ON public.agency_provisioning_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
