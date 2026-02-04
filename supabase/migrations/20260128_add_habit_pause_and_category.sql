-- Add permanent pause and category features to habits
-- Session 8: Habits Feature Enhancement

-- 1. Add category enum type
CREATE TYPE public.habit_category AS ENUM (
  'health',
  'productivity', 
  'social',
  'learning',
  'wellness',
  'other'
);

-- 2. Add category column to habits
ALTER TABLE public.habits 
ADD COLUMN category public.habit_category DEFAULT 'other';

-- 3. Add permanent pause timestamp column
ALTER TABLE public.habits 
ADD COLUMN paused_at TIMESTAMPTZ DEFAULT NULL;

-- 4. Add comments for documentation
COMMENT ON COLUMN public.habits.category IS 'Category for organizing habits: health (green), productivity (blue), social (purple), learning (yellow), wellness (teal), other (gray)';
COMMENT ON COLUMN public.habits.paused_at IS 'Timestamp when habit was paused. NULL = active, NOT NULL = paused. Different from archived - paused habits can be resumed and keep their streak frozen.';

-- 5. Create index for better query performance
CREATE INDEX idx_habits_category ON public.habits(category);
CREATE INDEX idx_habits_paused_at ON public.habits(paused_at) WHERE paused_at IS NOT NULL;
