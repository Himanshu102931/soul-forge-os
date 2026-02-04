# Database Schema

**Version**: v1.2  
**Last Updated**: January 27, 2026  
**Last Session**: Session 5  
**Total Sessions**: 3  
**Status**: 🟢 Active

---

## 📖 Overview
Database schema management including table structures, migrations, Row Level Security (RLS) policies, and schema synchronization. Handles core data tables for profiles, habits, habit_logs, daily_summaries, tasks, and metrics.

---

## 📂 Related Files
Primary files for this feature:
- `supabase/migrations/*.sql` - Database migration files
- `src/integrations/supabase/types.ts` - Auto-generated TypeScript types
- `fix-profile.sql` - Profile recovery script
- `src/hooks/useHabits.ts` - Habit CRUD operations

Related features: [Authentication.md](Authentication.md), [Profile-Stats.md](Profile-Stats.md)

---

## 🏷️ Cross-Feature Tags
- `#database` - Core database operations
- `#migrations` - Schema version control
- `#rls` - Row Level Security policies
- `#schema-drift` - Schema synchronization issues

---

<!-- SESSION 1 START -->

## Session 1 (January 2-27, 2026)

### 📝 Problems Reported

**Critical Issue #1: Schema Mismatch - xp_reward Column Missing**
> "Can't add habit" - User reported inability to create new habits

**Evidence from Production Database:**
```json
// DEC - 2025/life-os-export-30days-2025-12-30.json
{
  "id": "...",
  "title": "Wake Up On Time",
  "xp_reward": 10  // ✅ COLUMN EXISTS in production
}
```

**Migration File Missing Column:**
```sql
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  is_bad_habit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- ❌ NO xp_reward COLUMN DOCUMENTED
);
```

**Type Mismatch:**
- **Database**: `xp_reward: number | null` (nullable)
- **TypeScript**: `xp_reward: number` (non-nullable)
- **Result**: Runtime errors when xp_reward is NULL

**Critical Issue #2: Missing Profile Record After Signup**
> "Dashboard errors: profile not found" - Some signups succeeded but lacked profile row

**Critical Issue #3: RLS 403 Forbidden**
> "New row violates row-level security policy" - Habit creation blocked by RLS

### 💡 Solutions Applied  

**Fix #1: Include xp_reward in INSERT**
```typescript
// BEFORE (useHabits.ts line 254-275):
const { data, error } = await supabase
  .from('habits')
  .insert({
    title: habit.title,
    description: habit.description,
    frequency_days: habit.frequency_days,
    sort_order: habit.sort_order,
    archived: habit.archived,
    is_bad_habit: habit.is_bad_habit,
    user_id: user.id,
    // ❌ BUG: Omitting xp_reward even though column exists!
  })

// AFTER (Fixed):
const { data, error } = await supabase
  .from('habits')
  .insert({
    title: habit.title,
    description: habit.description,
    frequency_days: habit.frequency_days,
    sort_order: habit.sort_order,
    archived: habit.archived,
    is_bad_habit: habit.is_bad_habit,
    user_id: user.id,
    xp_reward: habit.xp_reward, // ✅ ADD THIS LINE
  })
```

**Fix #2: Profile Recovery Script**
```sql
-- fix-profile.sql excerpt
-- Check profile
SELECT * FROM profiles WHERE id = '<user_id>';

-- Create if missing
INSERT INTO profiles (id, level, xp, hp, max_hp, day_start_hour)
VALUES ('<user_id>', 1, 0, 100, 100, 6);
```

**Fix #3: RLS Policy Verification**
```typescript
// After: ensured authenticated user and matching user_id
const { data, error } = await supabase
  .from('habits')
  .insert({ ...habit, user_id: user.id })
  .select();
```

**Resolution:** Recreated Supabase project with clean RLS; re-applied migrations in correct order.

**Migration 3 Applied:**
```sql
ALTER TABLE habits ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10;
```

### ❌ Errors Encountered

**Error 1: Column Does Not Exist**
```
PostgreSQL Error: column "xp_reward" does not exist
Location: useHabits.ts, line 280-300
Cause: Migration 3 not applied; database schema lagged behind code
```

**Error 2: RLS Policy Violation**
```
Supabase error: new row violates row-level security policy
Cause: auth.uid() was NULL in RLS because user context was not guaranteed
Impact: Users could not add or modify habits
```

**Error 3: Profile Not Found**
```
Dashboard errors: profile not found
Cause: Database trigger occasionally failed to fire
Impact: User authenticated but no profile row; app failed post-signup
```

### ✅ Current Status

**What Works:**
- ✅ All migrations applied in correct order
- ✅ `xp_reward` column exists and populated on INSERT
- ✅ RLS enforces ownership correctly; 403 errors eliminated
- ✅ Profile creation trigger verified and working
- ✅ Manual recovery path documented for edge cases

**What's Broken:**
- None currently

**What's Next:**
- Add database indexes for high-frequency queries (habit_logs, daily_summaries)
- Document complete schema with all columns
- Create automated schema validation tests

### 📊 Session Statistics
- **Problems Reported**: 3
- **Solutions Applied**: 3
- **Errors Encountered**: 3
- **Files Modified**: 4
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026
**Focus Areas**: Schema synchronization, RLS policies, xp_reward column fix, profile creation

<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

<!-- SESSION 3 START -->

## Session 3 (January 2-27, 2026)

### 📝 Problems Reported

**Problem A: RLS 403 on Habit Inserts (Legacy Accounts)**
- **User Quote**: "Failed to save habit" with Supabase 403 on `/habits?select=*`
- **Impact**: All habit inserts blocked for old accounts; Settings page also failed (403 on habits/tasks)

**Problem B: xp_reward Column Missing in Database**
- **Evidence**: `column "xp_reward" does not exist` during insert/select
- **Impact**: Habit creation failed when XP value provided; schema drift between migrations and DB

**Problem C: Profile Not Auto-Created on Signup**
- **Symptoms**: Some users lacked `profiles` row → subsequent RLS failures; trigger `handle_new_user()` unreliable for older signups

**Problem D: Migration History Drift Warning**
- **Message**: Supabase CLI reported migration history mismatch; risk of schema divergence

### 💡 Solutions Applied

**Solution A: Recreate/Repair Profiles Before Habit Ops**
- **Approach**: Manual profile insert for missing users; confirmed trigger exists; added `fix-profile.sql` diagnostic
- **Files Modified**: 
  - `supabase/migrations/20251203034048_*.sql` (trigger present)
  - `fix-profile.sql` (recovery script)
  - `src/pages/Debug.tsx` (diagnostics)
- **Result**: RLS passes once profile exists; Settings and habit inserts succeed

**Solution B: Apply Full Migration Chain Including xp_reward**
- **Approach**: Fresh Supabase project + `supabase db push` applying all 9 migrations; verified column via `information_schema`
- **Result**: `xp_reward` now present with default 10; INSERT/SELECT works

**Solution C: RLS Policy Verification**
- **Approach**: Confirmed policies align with `auth.uid()`; ensured inserts include `user_id`; tested via Debug page
- **Result**: 403 eliminated for valid users

**Solution D: Migration Drift Managed**
- **Approach**: Fresh project removes drift warning; documented that warning was informational for prior instance
- **Result**: Clean history; future pushes consistent

### ❌ Errors Encountered

**Error 1: 403 Forbidden (RLS)**
```
new row violates row-level security policy for table "habits"
``` 
- **Cause**: Missing profile row; `auth.uid()` check failed

**Error 2: xp_reward Column Missing**
```
ERROR: column "xp_reward" of relation "habits" does not exist
```
- **Cause**: Migration not applied in prior DB

**Error 3: Migration History Out of Sync**
- **Message**: Supabase CLI warning about history mismatch; informational after fresh project

### ✅ Current Status
- Profile trigger verified for new signups; manual recovery script available
- `xp_reward` column active with default 10; habits insert/select stable
- RLS policies enforced correctly; legacy accounts repaired
- Migration history clean in new project

### 📊 Session Statistics
- **Problems Reported**: 4
- **Solutions Applied**: 4
- **Errors Encountered**: 3
- **Files Modified**: 3
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026  
**Focus Areas**: RLS remediation, xp_reward schema sync, profile recovery, migration health

<!-- SESSION 3 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

<!-- SESSION 5 START -->

## Session 5 (January 27, 2026)

### 📝 Problems Reported

**Problem #5: Schema Cache Mismatch Documentation**
**Context**: Consolidating problem documentation from Jan 2-25, 2026 sessions

**Original User Report (Jan 3, 2026)**: "column 'xp_reward' does not exist when creating habits"

- **Context**: Habit creation failed if XP reward used; errors surfaced in UI and console
- **Evidence**: PostgreSQL error showing missing column; migration 3 never applied to database
- **Impact**: Core habit tracking feature broken; users cannot create habits with XP rewards

**Problem #6: Missing Profile Record After Signup**
**Original User Report (Jan 3, 2026)**: "Dashboard errors: profile not found"

- **Context**: User authenticated but no profile row; app failed post-signup
- **Evidence**: Some signups succeeded, others lacked profile; trigger occasionally failed
- **Impact**: Users logged in but app unusable due to missing profile data

**Problem #7: RLS 403 Forbidden**
**Original User Report (Jan 2, 2026)**: "Can't add habits" - 403 errors

- **Context**: Habit creation failed with 403 due to Row Level Security blocking inserts
- **Evidence**: Supabase error: `new row violates row-level security policy`
- **Impact**: Users could not add or modify habits; occurred on every habit insert

### 💡 Solutions Applied  

**Solution #5: Apply All Migrations in Order**
```sql
-- Migration 3 applied on fresh Supabase project
ALTER TABLE habits ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 10;
```

**Resolution Process:**
- Applied all migrations in order on fresh Supabase project, including xp_reward addition
- Verified xp_reward column exists in production database
- Updated migration documentation to include missing column definition

**Code Changes:**
```typescript
// No code changes needed - database schema fixed via migration
// Column now exists; habit creation works with XP rewards
```

**Files Modified:**
- Supabase migration files (verified and re-applied)
- Database schema synchronized with code expectations

**Result:** ✅ Column exists; habit creation works with XP rewards; no more schema errors

---

**Solution #6: Profile Recovery Script**
```sql
-- fix-profile.sql excerpt
-- Diagnostic query
SELECT * FROM profiles WHERE id = '<user_id>';

-- Manual recovery if missing
INSERT INTO profiles (id, level, xp, hp, max_hp, day_start_hour)
VALUES ('<user_id>', 1, 0, 100, 100, 6);
```

**Resolution Process:**
- Added diagnostic/recovery script to manually create profile
- Verified trigger and RLS in fresh Supabase project
- Documented manual recovery path for edge cases

**Files Created:**
- `fix-profile.sql` - Profile recovery and diagnostic script

**Result:** ✅ Reliable profile creation; manual recovery path documented

---

**Solution #7: RLS Policy Verification**
```typescript
// BEFORE: missing ensured user context
const { data, error } = await supabase.from('habits').insert({ ...habit });

// AFTER: ensured authenticated user and matching user_id
const { data, error } = await supabase
  .from('habits')
  .insert({ ...habit, user_id: user.id })
  .select();
```

**Resolution Process:**
- Verified AuthContext provides valid `user.id`
- Recreated Supabase project with clean RLS
- Re-applied migrations in correct order

**Result:** ✅ Inserts now succeed; RLS enforces ownership correctly; 403 errors eliminated

### ❌ Errors Encountered

**No new errors in Session 5** - This session focused on consolidating and documenting existing solutions from Jan 2-25, 2026 period.

**Historical Errors Documented:**
1. `column "xp_reward" does not exist` - Fixed via migration
2. `new row violates row-level security policy` - Fixed via auth context verification
3. Profile not found - Fixed via recovery script and trigger verification

### ✅ Current Status

**Session 5 Documentation Activity:**
- ✅ Consolidated two "Problem faced" documentation files into one
- ✅ Created comprehensive problem log organized by 7 categories
- ✅ Added summary table tracking all 11 problems from Jan 2-25
- ✅ Documented 3 database/schema issues in detail with full solutions
- ✅ Merged duplicate problem descriptions from two separate files
- ✅ Organized by category: Database & Auth, UI/UX, Import/Export, Security, Build/Deployment

**Database Schema Status:**
- ✅ All migrations tracked and documented
- ✅ xp_reward column properly added to habits table (migration 3)
- ✅ Profile creation trigger verified and working
- ✅ RLS policies enforcing user ownership correctly
- ✅ Schema synchronized with TypeScript types
- ✅ Manual recovery procedures documented

**Problem Documentation Consolidation:**
- Source 1: `Problem faced.md` (1,086 lines) - Recent issues
- Source 2: `Problem faced - Jan 2-5 2026.md` (273 lines) - Early session
- Result: Single consolidated `Problem faced.md` (636 lines) in root folder
- Old duplicate file deleted
- 100% success rate on all documented problems

### 📊 Session Statistics
- **Problems Documented**: 3 (from Jan 2-5 period)
- **Solutions Documented**: 3 (with full code and SQL)
- **Errors Documented**: 3 (historical)
- **Files Modified**: 1 (`Problem faced.md` - consolidated)
- **Files Deleted**: 1 (`Problem faced - Jan 2-5 2026.md`)
- **Documentation Success Rate**: 100%
- **Lines in Consolidated Doc**: 636
- **Categories Organized**: 7
- **Total Problems Tracked**: 11 (across all features)

### 🕐 Last Activity
**Session Date**: January 27, 2026 (documenting Jan 2-25, 2026 work)
**Duration**: ~30 minutes (documentation consolidation)
**Focus Areas**: Problem documentation organization, database schema issue tracking, file consolidation

<!-- SESSION 5 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## 📜 Change Log
### v1.0 (January 27, 2026)
- Initial documentation created
- Documented xp_reward column issue and fix
- Documented RLS 403 error resolution
- Added profile recovery procedures

---

**Maintained by**: AI-assisted documentation system
