-- Add ai_response column to daily_summaries for storing AI roasts
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS ai_response TEXT;

-- Add completed_at column to tasks for tracking completion timestamp
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;