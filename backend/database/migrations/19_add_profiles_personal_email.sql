-- ============================================================================
-- Add personal_email column and update unified_employees view
-- ============================================================================
-- Run this on each agency database (not main buildflow_db).
-- 1. Adds personal_email to profiles (for sending login credentials)
-- 2. Updates unified_employees view to include avatar_url
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_email TEXT;

-- Update unified_employees view to include avatar_url from profiles
CREATE OR REPLACE VIEW public.unified_employees AS
SELECT 
  COALESCE(ed.id, p.id, u.id) as id,
  u.id as user_id,
  ed.id as employee_detail_id,
  p.id as profile_id,
  COALESCE(p.agency_id, ed.agency_id) as agency_id,
  COALESCE(ed.first_name || ' ' || ed.last_name, p.full_name, u.email) as display_name,
  ed.first_name,
  ed.last_name,
  p.full_name,
  u.email,
  ed.employee_id,
  p.phone,
  p.department,
  p.position,
  ed.employment_type,
  ed.work_location,
  ed.supervisor_id,
  COALESCE(ed.is_active, p.is_active, u.is_active, true) as is_active,
  (u.is_active = true AND (p.id IS NULL OR p.is_active = true) AND (ed.id IS NULL OR ed.is_active = true)) as is_fully_active,
  ed.date_of_birth,
  p.avatar_url,
  p.hire_date,
  p.hire_date as profile_hire_date,
  u.created_at,
  ed.created_at as employee_detail_created_at,
  p.created_at as profile_created_at,
  ur.role
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.employee_details ed ON ed.user_id = u.id
LEFT JOIN LATERAL (
  SELECT role FROM public.user_roles 
  WHERE user_id = u.id 
  ORDER BY assigned_at DESC NULLS LAST
  LIMIT 1
) ur ON true;
