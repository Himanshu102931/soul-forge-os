-- Database Optimization - Indexes and Performance Improvements
-- January 1, 2026

-- ============================================================
-- INDEXES FOR HABIT_LOGS (High-frequency queries)
-- ============================================================

-- Index for filtering habit logs by user (via habit) and date range
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_date 
  ON public.habit_logs(habit_id, date DESC);

-- Index for analytics queries filtering by date
CREATE INDEX IF NOT EXISTS idx_habit_logs_date 
  ON public.habit_logs(date DESC);

-- Index for habit status queries
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_status 
  ON public.habit_logs(habit_id, status);

-- ============================================================
-- INDEXES FOR HABITS (User habit management)
-- ============================================================

-- Index for retrieving user's habits (active or all)
CREATE INDEX IF NOT EXISTS idx_habits_user_id_archived 
  ON public.habits(user_id, archived);

-- Index for habit ordering
CREATE INDEX IF NOT EXISTS idx_habits_user_id_sort_order 
  ON public.habits(user_id, sort_order);

-- ============================================================
-- INDEXES FOR TASKS (Task filtering and completion)
-- ============================================================

-- Index for retrieving user's tasks with completion status
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_completed 
  ON public.tasks(user_id, completed);

-- Index for filtering tasks by date
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_due_date 
  ON public.tasks(user_id, due_date);

-- Index for today's tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_is_for_today 
  ON public.tasks(user_id, is_for_today);

-- ============================================================
-- INDEXES FOR DAILY_SUMMARIES (Analytics and history)
-- ============================================================

-- Index for retrieving daily summaries by date range
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id_date 
  ON public.daily_summaries(user_id, date DESC);

-- Index for mood tracking analytics
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id_mood 
  ON public.daily_summaries(user_id, mood_score);

-- ============================================================
-- INDEXES FOR METRIC_LOGS (Sleep and steps tracking)
-- ============================================================

-- Index for metric queries by user and date
CREATE INDEX IF NOT EXISTS idx_metric_logs_user_id_date 
  ON public.metric_logs(user_id, date DESC);

-- Index for filtering by metric type
CREATE INDEX IF NOT EXISTS idx_metric_logs_metric_id_date 
  ON public.metric_logs(metric_id, date DESC);

-- Index for specific metric and user queries
CREATE INDEX IF NOT EXISTS idx_metric_logs_user_metric_date 
  ON public.metric_logs(user_id, metric_id, date DESC);

-- ============================================================
-- INDEXES FOR PROFILES (User metadata)
-- ============================================================

-- Index for created_at sorting (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
  ON public.profiles(created_at);

-- ============================================================
-- ANALYZE TABLE STATISTICS (For query planner optimization)
-- ============================================================

-- Update table statistics to help query planner
ANALYZE public.habits;
ANALYZE public.habit_logs;
ANALYZE public.tasks;
ANALYZE public.daily_summaries;
ANALYZE public.metric_logs;
ANALYZE public.profiles;

-- ============================================================
-- COMMENTS FOR MAINTENANCE
-- ============================================================

COMMENT ON INDEX idx_habit_logs_habit_id_date IS 'Primary index for habit log filtering by habit and date range - supports analytics queries';
COMMENT ON INDEX idx_habits_user_id_archived IS 'Index for active/archived habit filtering - supports habit list views';
COMMENT ON INDEX idx_tasks_user_id_completed IS 'Index for task completion status filtering - supports task dashboard';
COMMENT ON INDEX idx_daily_summaries_user_id_date IS 'Index for daily summary retrieval by date - supports historical analysis';
COMMENT ON INDEX idx_metric_logs_user_id_date IS 'Index for metric tracking by date - supports sleep/steps analytics';
