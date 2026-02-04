-- Remove pause functionality from database
-- This migration removes the paused status and paused_at column

-- Step 1: Update any paused logs to skipped status
UPDATE public.habit_logs 
SET status = 'skipped' 
WHERE status = 'paused';

-- Step 2: Drop indexes related to paused_at
DROP INDEX IF EXISTS public.idx_habits_paused_at;

-- Step 3: Drop paused_at column from habits table
ALTER TABLE public.habits 
DROP COLUMN IF EXISTS paused_at;

-- Step 4: Remove 'paused' value from habit_status enum
-- Note: PostgreSQL doesn't support ALTER TYPE... DROP VALUE, so we need to recreate the enum
-- First, create the new enum without 'paused'
CREATE TYPE public.habit_status_new AS ENUM ('completed', 'partial', 'skipped', 'missed');

-- Update the habit_logs table to use the new enum
ALTER TABLE public.habit_logs 
  ALTER COLUMN status TYPE public.habit_status_new 
  USING status::text::public.habit_status_new;

-- Drop the old enum and rename the new one
DROP TYPE IF EXISTS public.habit_status CASCADE;
ALTER TYPE public.habit_status_new RENAME TO habit_status;

-- Step 5: Restore the foreign key constraint if needed
-- (The CASCADE in DROP TYPE would have removed constraints)
-- This is handled automatically by the USING clause above

-- Verification (uncomment to check):
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'paused_at';
