-- Complete Session 8 Migration Fix
-- Applies all pending migrations to enable full functionality

-- Step 1: Add 'paused' status to habit_status enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'paused' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status')
    ) THEN
        ALTER TYPE public.habit_status ADD VALUE 'paused';
    END IF;
END $$;

-- Step 2: Create category enum type (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_category') THEN
        CREATE TYPE public.habit_category AS ENUM (
            'health',
            'productivity', 
            'social',
            'learning',
            'wellness',
            'other'
        );
    END IF;
END $$;

-- Step 3: Add category column to habits (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habits' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.habits 
        ADD COLUMN category public.habit_category DEFAULT 'other';
    END IF;
END $$;

-- Step 4: Add paused_at column to habits (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habits' AND column_name = 'paused_at'
    ) THEN
        ALTER TABLE public.habits 
        ADD COLUMN paused_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Step 5: Add indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_habits_category ON public.habits(category);
CREATE INDEX IF NOT EXISTS idx_habits_paused_at ON public.habits(paused_at) WHERE paused_at IS NOT NULL;

-- Step 6: Add documentation comments
COMMENT ON COLUMN public.habits.category IS 'Category for organizing habits: health (green), productivity (blue), social (purple), learning (yellow), wellness (teal), other (gray)';
COMMENT ON COLUMN public.habits.paused_at IS 'Timestamp when habit was paused. NULL = active, NOT NULL = paused. Different from archived - paused habits can be resumed and keep their streak frozen.';

-- Verification queries (uncomment to check after running):
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'habit_status');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'habits' ORDER BY ordinal_position;
