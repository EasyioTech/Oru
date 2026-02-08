-- ============================================================================
-- BuildFlow ERP - Core Schema Migration
-- ============================================================================
-- This migration creates the core authentication and agency tables
-- Database: buildflow_db
-- Created: 2025-01-15
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- AGENCIES TABLE (tenant catalog - control plane only)
-- ============================================================================
-- domain and database_name are NOT NULL for routing: domain -> database_name O(1)
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    database_name TEXT NOT NULL UNIQUE,
    owner_user_id UUID,
    subscription_plan TEXT DEFAULT 'basic',
    max_users INTEGER DEFAULT 50,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agencies IS 'Tenant catalog: domain -> database_name for routing; control plane only';
COMMENT ON COLUMN public.agencies.domain IS 'Workspace domain; unique, used for O(1) lookup';
COMMENT ON COLUMN public.agencies.database_name IS 'PostgreSQL database name for this agency';

-- Indexes for O(1) routing (no full table scan in hot path)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_domain ON public.agencies(domain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_database_name ON public.agencies(database_name);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_confirmed BOOLEAN DEFAULT false,
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_sign_in_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.users IS 'User accounts for authentication';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    hire_date DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended user profiles with agency association';

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id);

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID REFERENCES public.users(id),
    UNIQUE(user_id, role, agency_id)
);

COMMENT ON TABLE public.user_roles IS 'User role assignments linking users to roles and agencies';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_agency_id ON public.user_roles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.audit_logs IS 'System audit trail for all operations';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();
