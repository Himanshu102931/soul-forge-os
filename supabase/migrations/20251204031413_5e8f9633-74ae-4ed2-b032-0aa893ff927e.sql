-- Add xp_reward column to habits table
ALTER TABLE public.habits ADD COLUMN xp_reward INTEGER DEFAULT 10;

-- Add comment for documentation
COMMENT ON COLUMN public.habits.xp_reward IS 'XP reward for completing habit: 5 (Easy), 10 (Medium), 15 (Hard)';