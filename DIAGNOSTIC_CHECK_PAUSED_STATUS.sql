-- DIAGNOSTIC SCRIPT: Check if 'paused' status exists in database
-- Run this in Supabase SQL Editor to verify migration status

-- 1. Check habit_status enum values
SELECT 
    enumlabel as "Status Value",
    enumsortorder as "Sort Order"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status')
ORDER BY enumsortorder;

-- Expected output should include:
-- completed
-- partial
-- skipped
-- missed
-- paused  <-- This should be present

-- 2. If 'paused' is missing, check why
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'paused' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status')
        ) THEN '✅ PAUSED EXISTS - Everything should work'
        ELSE '❌ PAUSED MISSING - Need to add it manually'
    END as "Migration Status";

-- 3. Check if habit_logs table can accept 'paused' status
SELECT 
    table_name,
    column_name,
    udt_name as enum_type
FROM information_schema.columns
WHERE table_name = 'habit_logs' AND column_name = 'status';
