-- DIAGNOSTIC: Check if habits.paused_at column exists

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'habits' 
AND column_name IN ('category', 'paused_at')
ORDER BY column_name;

-- Expected output:
-- category     | USER-DEFINED (habit_category) | YES | 'other'::habit_category
-- paused_at    | timestamp with time zone      | YES | NULL

-- If paused_at is missing, run this:
-- ALTER TABLE public.habits ADD COLUMN paused_at TIMESTAMPTZ DEFAULT NULL;
-- CREATE INDEX idx_habits_paused_at ON public.habits(paused_at) WHERE paused_at IS NOT NULL;
