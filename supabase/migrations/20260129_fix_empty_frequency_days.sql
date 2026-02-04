-- Fix habits with empty frequency_days arrays
-- These habits won't show on dashboard because isHabitDueToday returns false for empty arrays

-- Update all habits where frequency_days is empty to have all 7 days (daily habit)
UPDATE public.habits
SET frequency_days = ARRAY[0, 1, 2, 3, 4, 5, 6]
WHERE frequency_days = '{}' OR frequency_days IS NULL;

-- Verify the fix
-- This should return 0 rows after running the migration
-- SELECT id, title, frequency_days FROM public.habits WHERE frequency_days = '{}' OR frequency_days IS NULL;
