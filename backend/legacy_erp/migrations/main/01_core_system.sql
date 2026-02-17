CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE subscription_plan_type AS ENUM ('trial', 'starter', 'basic', 'professional', 'enterprise', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agency_status_type AS ENUM ('active', 'suspended', 'cancelled', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    is_base BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currencies_code ON public.currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_base ON public.currencies(is_base);

INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_base) VALUES
  ('INR', 'Indian Rupee', '₹', 1, true),
  ('USD', 'US Dollar', '$', 0.012, false),
  ('EUR', 'Euro', '€', 0.011, false),
  ('GBP', 'British Pound', '£', 0.0095, false)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    database_name TEXT NOT NULL,
    owner_user_id UUID,
    subscription_plan subscription_plan_type NOT NULL DEFAULT 'trial',
    status agency_status_type NOT NULL DEFAULT 'pending',
    max_users INTEGER NOT NULL DEFAULT 50,
    max_storage_gb INTEGER NOT NULL DEFAULT 10,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    contact_email TEXT,
    contact_phone TEXT,
    billing_email TEXT,
    address JSONB,
    tax_id TEXT,
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT domain_format CHECK (domain ~* '^[a-z0-9][a-z0-9-.]*[a-z0-9]$'),
    CONSTRAINT database_name_format CHECK (database_name ~* '^[a-z][a-z0-9_]*$')
);

-- Currencies index
CREATE INDEX IF NOT EXISTS idx_currencies_code ON public.currencies(code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_base ON public.currencies(is_base);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_domain ON public.agencies(lower(domain)) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_agencies_database_name ON public.agencies(lower(database_name)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_owner_user_id ON public.agencies(owner_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_subscription_plan ON public.agencies(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_agencies_is_active ON public.agencies(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON public.agencies(created_at);
CREATE INDEX IF NOT EXISTS idx_agencies_subscription_ends_at ON public.agencies(subscription_ends_at) WHERE subscription_ends_at IS NOT NULL;

DO $$ BEGIN
    CREATE TYPE user_status_type AS ENUM ('active', 'inactive', 'suspended', 'locked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    email_normalized TEXT NOT NULL GENERATED ALWAYS AS (lower(trim(email))) STORED,
    password_hash TEXT NOT NULL,
    email_confirmed BOOLEAN NOT NULL DEFAULT false,
    email_confirmed_at TIMESTAMPTZ,
    phone TEXT,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified_at TIMESTAMPTZ,
    status user_status_type NOT NULL DEFAULT 'active',
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    terms_version TEXT,
    privacy_accepted_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    last_sign_in_ip INET,
    sign_in_count INTEGER NOT NULL DEFAULT 0,
    raw_user_meta_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_normalized ON public.users(email_normalized) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone) WHERE phone IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_confirmed ON public.users(email_confirmed) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON public.users(locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON public.user_sessions(token_hash) WHERE is_active = true AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token_hash ON public.user_sessions(refresh_token_hash) WHERE refresh_token_hash IS NOT NULL AND is_active = true;

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON public.email_verification_tokens(token_hash) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON public.email_verification_tokens(expires_at) WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id) WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at) WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    full_name TEXT,
    display_name TEXT,
    phone TEXT,
    phone_extension TEXT,
    department TEXT,
    position TEXT,
    employee_code TEXT,
    hire_date DATE,
    avatar_url TEXT,
    personal_email TEXT,
    personal_email_verified BOOLEAN NOT NULL DEFAULT false,
    personal_email_verified_at TIMESTAMPTZ,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    date_format TEXT DEFAULT 'YYYY-MM-DD',
    time_format TEXT DEFAULT '24h',
    notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    theme_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    bio TEXT,
    social_links JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT personal_email_format CHECK (
        personal_email IS NULL OR 
        personal_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_agency_id ON public.profiles(agency_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_employee_code ON public.profiles(employee_code) WHERE employee_code IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_personal_email ON public.profiles(lower(personal_email)) 
    WHERE personal_email IS NOT NULL AND deleted_at IS NULL;

DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('super_admin', 'agency_admin', 'manager', 'employee', 'auditor', 'viewer', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    role role_type NOT NULL,
    custom_role_name TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    assigned_by UUID REFERENCES public.users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.users(id),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT valid_custom_role CHECK (
        (role != 'custom') OR (role = 'custom' AND custom_role_name IS NOT NULL)
    ),
    CONSTRAINT valid_date_range CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_active_unique ON public.user_roles(user_id, role, agency_id) 
    WHERE is_active = true AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_agency_id ON public.user_roles(agency_id) WHERE agency_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until ON public.user_roles(valid_until) WHERE valid_until IS NOT NULL;

DO $$ BEGIN
    CREATE TYPE audit_action_type AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    session_id UUID REFERENCES public.user_sessions(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    action audit_action_type NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_id ON public.audit_logs(agency_id) WHERE agency_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON public.audit_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id) WHERE record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON public.audit_logs(request_id) WHERE request_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_sign_in_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
        NEW.sign_in_count = OLD.sign_in_count + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reset_failed_login_attempts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_sign_in_at IS NOT NULL AND NEW.last_sign_in_at > COALESCE(OLD.last_sign_in_at, '1970-01-01'::timestamptz) THEN
        NEW.failed_login_attempts = 0;
        NEW.locked_until = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_agencies_updated_at ON public.agencies;
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS increment_user_sign_in_count ON public.users;
CREATE TRIGGER increment_user_sign_in_count
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_sign_in_count();

DROP TRIGGER IF EXISTS reset_user_failed_logins ON public.users;
CREATE TRIGGER reset_user_failed_logins
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.reset_failed_login_attempts();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_currencies_updated_at ON public.currencies;
CREATE TRIGGER update_currencies_updated_at
    BEFORE UPDATE ON public.currencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
