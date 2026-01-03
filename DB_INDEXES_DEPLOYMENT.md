# Database Indexes - Deployment Instructions

**Status:** Migration file created ✅  
**File:** `supabase/migrations/20260103000001_add_performance_indexes.sql`  
**Ready for:** Manual execution in Supabase SQL Editor

---

## What This Migration Does

Adds 3 performance indexes to optimize queries for tables with 10K+ records per user:

```sql
-- Index 1: habits table
CREATE INDEX idx_habits_user_created ON habits(user_id, created_at DESC);

-- Index 2: tasks table  
CREATE INDEX idx_tasks_user_archived ON tasks(user_id, archived);

-- Index 3: daily_summaries table
CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
```

---

## Why These Indexes

| Index | Table | Columns | Benefit |
|-------|-------|---------|---------|
| idx_habits_user_created | habits | user_id, created_at | Fast filtering & sorting by user |
| idx_tasks_user_archived | tasks | user_id, archived | Fast filtering active/archived tasks |
| idx_daily_summaries_user_date | daily_summaries | user_id, date | Fast date range queries |

**Performance Impact:**
- Without indexes: Full table scans (O(n))
- With indexes: Direct lookups (O(log n))
- For 10K records: ~100x faster

---

## How to Deploy

### Option 1: Automatic (Recommended if CLI works)
```bash
npx supabase db push
# Type: Y to confirm
```

### Option 2: Manual (Via Supabase Dashboard) ⭐ Use This

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select **soul-forge-os** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy & paste this SQL:

```sql
-- Performance optimization: Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_habits_user_created ON habits(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_archived ON tasks(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);
```

6. Click **Run** button (▶️ in top right)
7. Should see: ✅ Success - "Query OK"

---

## Verification

After deployment, verify indexes were created:

```sql
-- List all indexes on these tables
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('habits', 'tasks', 'daily_summaries') 
AND indexname LIKE 'idx_%';
```

Expected output:
```
indexname
─────────────────────────────
idx_habits_user_created
idx_tasks_user_archived
idx_daily_summaries_user_date
```

---

## Testing Performance (Optional)

Before/after query performance:

```sql
-- Test query 1: Get user's recent habits
EXPLAIN ANALYZE
SELECT * FROM habits 
WHERE user_id = 'some-user-id'
ORDER BY created_at DESC 
LIMIT 10;

-- Without index: Sequential Scan (slow)
-- With index: Index Scan (fast)
```

---

## Rollback (If Needed)

If you need to remove the indexes:

```sql
DROP INDEX IF EXISTS idx_habits_user_created;
DROP INDEX IF EXISTS idx_tasks_user_archived;
DROP INDEX IF EXISTS idx_daily_summaries_user_date;
```

---

## Git Commit

After deploying:

```bash
git add supabase/migrations/20260103000001_add_performance_indexes.sql
git commit -m "feat: Add database performance indexes for 10K+ record scalability

- Index habits(user_id, created_at DESC) for filtering and sorting
- Index tasks(user_id, archived) for archive status filtering
- Index daily_summaries(user_id, date DESC) for date range queries

Improves query performance from O(n) to O(log n) for large datasets.
Expected impact: ~100x faster queries at 10K+ records per user."
```

---

## Status Tracking

- [ ] Migration file created (DONE ✅)
- [ ] Deployed to Supabase (TODO)
- [ ] Verified indexes exist (TODO)
- [ ] Committed to git (TODO)

---

## Next Steps

1. **Deploy via Supabase Dashboard** (recommended, 2 minutes)
2. **Verify** with the SQL query above
3. **Commit** to git
4. **Done!** Ready for scaling

Need help with any step?
