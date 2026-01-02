-- Force schema cache refresh by adding a comment to habits table
COMMENT ON TABLE public.habits IS 'Personal habits tracking with XP rewards. Schema refreshed on 2026-01-02.';

-- Ensure xp_reward column exists with proper defaults
-- This is idempotent - won't error if column already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='habits' AND column_name='xp_reward') THEN
    ALTER TABLE public.habits ADD COLUMN xp_reward INTEGER DEFAULT 10;
  END IF;
END $$;
