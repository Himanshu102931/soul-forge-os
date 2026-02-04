-- Verification query for Session 8 migration
-- Run this to check if all required schema changes are in place

-- Check 1: Verify 'paused' is in habit_status enum
SELECT 
    'habit_status enum values:' as check_name,
    string_agg(enumlabel::text, ', ' ORDER BY enumsortorder) as result
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status');

-- Check 2: Verify habit_category enum exists and has values
SELECT 
    'habit_category enum values:' as check_name,
    string_agg(enumlabel::text, ', ' ORDER BY enumsortorder) as result
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_category');

-- Check 3: Verify habits table columns
SELECT 
    'habits table columns:' as check_name,
    string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as result
FROM information_schema.columns 
WHERE table_name = 'habits' 
AND column_name IN ('category', 'paused_at');

-- Check 4: Test if we can insert a paused habit_log
SELECT 
    'Can insert paused status?' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'paused' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status')
        ) THEN 'YES - paused value exists'
        ELSE 'NO - paused value MISSING'
    END as result;
