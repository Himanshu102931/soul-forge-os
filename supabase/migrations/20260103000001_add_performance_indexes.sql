-- Performance optimization: Add indexes for frequently queried columns
-- This migration improves query performance for tables with 10K+ records per user

-- Index habits table for user_id + created_at queries (sorting, filtering)
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON habits(user_id, created_at DESC);

-- Index tasks table for user_id + archived queries (filtering active/archived)
CREATE INDEX IF NOT EXISTS idx_tasks_user_archived ON tasks(user_id, archived);

-- Index daily_summaries table for user_id + date queries (date range queries)
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- Comments for documentation
COMMENT ON INDEX idx_habits_user_created IS 'Composite index for filtering and sorting habits by user and creation date';
COMMENT ON INDEX idx_tasks_user_archived IS 'Composite index for filtering tasks by user and archive status';
COMMENT ON INDEX idx_daily_summaries_user_date IS 'Composite index for querying daily summaries by user and date';
