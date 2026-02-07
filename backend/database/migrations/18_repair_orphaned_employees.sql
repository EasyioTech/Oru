-- ============================================================================
-- Repair Orphaned Employees Migration
-- ============================================================================
-- Creates employee_details for users who have profiles but no employee_details.
-- These "orphaned" records occur when employee creation partially failed (e.g.
-- before the create-employee fix). This migration repairs them so they have
-- proper employee_id and can be edited/deleted via the employee management UI.
-- ============================================================================

-- Create employee_details for users with profile but no employee_details
-- Use a DO block to generate unique employee_ids
DO $$
DECLARE
  profile_rec RECORD;
  new_emp_id TEXT;
  max_num INT;
  next_num INT;
BEGIN
  FOR profile_rec IN
    SELECT p.user_id, p.agency_id, p.full_name, p.is_active, p.created_at
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.employee_details ed WHERE ed.user_id = p.user_id
    )
  LOOP
    -- Generate unique employee_id: EMP-0001, EMP-0002, etc.
    SELECT COALESCE(MAX(
      NULLIF(REGEXP_REPLACE(ed.employee_id, '^EMP-0*([0-9]+)$', '\1'), '')::INT
    ), 0) INTO max_num
    FROM public.employee_details ed
    WHERE ed.employee_id ~ '^EMP-[0-9]+$';
    
    next_num := max_num + 1;
    new_emp_id := 'EMP-' || LPAD(next_num::TEXT, 4, '0');
    
    -- Ensure uniqueness (in case of concurrent inserts)
    WHILE EXISTS (SELECT 1 FROM public.employee_details WHERE employee_id = new_emp_id) LOOP
      next_num := next_num + 1;
      new_emp_id := 'EMP-' || LPAD(next_num::TEXT, 4, '0');
    END LOOP;
    
    INSERT INTO public.employee_details (
      id, user_id, employee_id, agency_id,
      first_name, last_name, employment_type, work_location, is_active,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      profile_rec.user_id,
      new_emp_id,
      profile_rec.agency_id,
      COALESCE(NULLIF(TRIM(SPLIT_PART(COALESCE(profile_rec.full_name, 'Unknown User'), ' ', 1)), ''), 'Unknown'),
      COALESCE(NULLIF(TRIM(SUBSTRING(COALESCE(profile_rec.full_name, 'User') FROM LENGTH(SPLIT_PART(COALESCE(profile_rec.full_name, ' '), ' ', 1)) + 2)), ''), 'User'),
      'full_time',
      NULL,
      COALESCE(profile_rec.is_active, true),
      COALESCE(profile_rec.created_at, NOW()),
      NOW()
    );
  END LOOP;
END $$;
