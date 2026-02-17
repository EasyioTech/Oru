-- Migration to update tickets table schema
-- This adds missing columns and renames existing ones

-- Step 1: Add new columns if they don't exist
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_number TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS console_logs JSONB;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS error_details JSONB;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS browser_info JSONB;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate data from old columns to new columns (if subject exists)
UPDATE tickets SET title = subject WHERE title IS NULL AND subject IS NOT NULL;

-- Step 3: Generate ticket numbers for existing tickets
UPDATE tickets 
SET ticket_number = 'TKT-' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS TEXT), 6, '0')
WHERE ticket_number IS NULL;

-- Step 4: Set default values for required fields
UPDATE tickets SET category = 'general' WHERE category IS NULL;
UPDATE tickets SET priority = 'medium' WHERE priority = 'normal';
UPDATE tickets SET status = 'in_progress' WHERE status = 'pending';

-- Step 5: Make required columns NOT NULL
ALTER TABLE tickets ALTER COLUMN ticket_number SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN title SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN category SET NOT NULL;
ALTER TABLE tickets ALTER COLUMN category SET DEFAULT 'general';

-- Step 6: Add unique constraint on ticket_number
ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_number_unique UNIQUE (ticket_number);

-- Step 7: Rename timestamp columns to use snake_case
ALTER TABLE tickets RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE tickets RENAME COLUMN "updatedAt" TO updated_at;

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- Step 9: Drop old column (optional, comment out if you want to keep it)
-- ALTER TABLE tickets DROP COLUMN IF EXISTS subject;
