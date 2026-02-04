-- MANUAL FIX: Add 'paused' status to habit_status enum
-- Only run this if diagnostic shows 'paused' is MISSING

-- This must be run outside a transaction block
-- In Supabase SQL Editor, this should work directly

ALTER TYPE public.habit_status ADD VALUE IF NOT EXISTS 'paused';

-- Verify it was added
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status')
ORDER BY enumsortorder;

-- Expected output:
-- completed
-- partial
-- skipped
-- missed
-- paused
