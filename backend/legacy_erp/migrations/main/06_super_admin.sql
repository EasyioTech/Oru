CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_super_admin_user_id UUID;
    v_super_admin_profile_id UUID;
BEGIN
    INSERT INTO public.users (
        email,
        password_hash,
        email_confirmed,
        email_confirmed_at,
        status,
        terms_accepted_at,
        terms_version,
        created_at,
        updated_at
    ) VALUES (
        'super@buildflow.local',
        '$2a$10$YourSecureHashHere',
        true,
        now(),
        'active'::user_status_type,
        now(),
        '1.0',
        now(),
        now()
    )
    ON CONFLICT (email_normalized) WHERE deleted_at IS NULL
    DO UPDATE SET
        email_confirmed = true,
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        status = 'active'::user_status_type,
        updated_at = now()
    RETURNING id INTO v_super_admin_user_id;

    IF v_super_admin_user_id IS NULL THEN
        SELECT id INTO v_super_admin_user_id 
        FROM public.users 
        WHERE email_normalized = 'super@buildflow.local' 
        AND deleted_at IS NULL;
    END IF;

    INSERT INTO public.profiles (
        user_id,
        full_name,
        display_name,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_super_admin_user_id,
        'Super Administrator',
        'Super Admin',
        true,
        now(),
        now()
    )
    ON CONFLICT (user_id) WHERE deleted_at IS NULL
    DO UPDATE SET
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
        is_active = true,
        updated_at = now();

    INSERT INTO public.user_roles (
        user_id,
        role,
        permissions,
        is_active,
        valid_from,
        assigned_at
    ) VALUES (
        v_super_admin_user_id,
        'super_admin'::role_type,
        '["*"]'::jsonb,
        true,
        now(),
        now()
    )
    ON CONFLICT (user_id, role, agency_id) 
    WHERE is_active = true AND revoked_at IS NULL
    DO UPDATE SET
        permissions = EXCLUDED.permissions,
        is_active = true;

    RAISE NOTICE 'Super admin user created/updated: %', v_super_admin_user_id;
    RAISE NOTICE 'IMPORTANT: Change the default password immediately after first login';
    RAISE NOTICE 'Default credentials: super@buildflow.local / [Set via environment variable or admin panel]';

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating super admin: % %', SQLERRM, SQLSTATE;
        RAISE;
END $$;
