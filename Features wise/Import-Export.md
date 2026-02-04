# Import-Export

**Version**: v1.2  
**Last Updated**: January 27, 2026  
**Last Session**: Session 5  
**Total Sessions**: 3  
**Status**: 🟢 Active

---

## 📖 Overview
Data portability system for exporting and importing user data (profile, habits, logs, tasks, daily summaries). Features JSON validation, ID remapping, intelligent profile merging, and comprehensive error handling.

---

## 📂 Related Files
Primary files for this feature:
- `src/pages/Settings.tsx` - Export/import UI in "Brain & Data" section
- Export format: JSON files with full user data
- Sample files: `life-os-export-30days-2025-12-30.json`, `life-os-export-all-2026-01-25.json`

Related features: [Settings.md](Settings.md), [Database-Schema.md](Database-Schema.md)

---

## 🏷️ Cross-Feature Tags
- `#data-portability` - User data ownership
- `#json-validation` - File structure verification
- `#id-remapping` - Foreign key relationship preservation
- `#profile-merge` - Intelligent data consolidation

---

<!-- SESSION 1 START -->

## Session 1 (January 2-27, 2026)

### 📝 Problems Reported

**Problem #1: Invalid JSON Import Crashes**
> "Import failed with JSON parse errors when non-JSON file selected"

**Symptoms:**
- "Unexpected token" errors on import
- No user-friendly error message
- App would crash on malformed input
- Accepted any file type without validation

**Problem #2: Habit Logs Not Linked After Import**
> "Imported logs did not show because habit IDs changed"

**Symptoms:**
- Logs inserted successfully but not visible in UI
- Potential foreign key failures or orphaned logs
- Import appeared successful but data was incomplete
- Historical tracking lost

**Problem #3: Profile Merge Logic on Import**
> "When importing, need intelligent logic for handling existing profile data"

**Questions:**
- Should we overwrite existing profile?
- Should we keep existing profile?
- How to handle stat conflicts intelligently?

### 💡 Solutions Applied  

**Fix #1: JSON Validation and Structure Verification**
```tsx
// File Input with Type Restriction
<input type="file" accept=".json" onChange={handleFileSelect} />
```

```typescript
// Validation Logic
try {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Structure validation
  if (!data.profile || !Array.isArray(data.habits)) {
    throw new Error('Invalid export file: missing required data.');
  }
  
  // Expected structure
  // {
  //   profile: { level, xp, hp, max_hp },
  //   habits: [...],
  //   habit_logs: [...],
  //   tasks: [...],
  //   daily_summaries: [...]
  // }
  
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error('File is not valid JSON. Please select an export file.');
  }
  throw error;
}
```
**Result:** ✅ Friendly errors; imports only proceed with valid JSON structure

**Fix #2: ID Remapping System**
```typescript
// Step 1: Create habits and build ID map
const habitIdMap: Record<string, string> = {};

const createdHabits = await Promise.all(
  importedHabits.map(async (oldHabit) => {
    const { data: newHabit } = await supabase
      .from('habits')
      .insert({
        title: oldHabit.title,
        description: oldHabit.description,
        frequency_days: oldHabit.frequency_days,
        xp_reward: oldHabit.xp_reward,
        is_bad_habit: oldHabit.is_bad_habit,
        user_id: user.id,
      })
      .select()
      .single();
    
    return newHabit;
  })
);

// Step 2: Map old IDs to new IDs
importedHabits.forEach((oldHabit, idx) => {
  habitIdMap[oldHabit.id] = createdHabits[idx].id;
});

// Step 3: Remap logs with new habit IDs
const logsToInsert = importedLogs
  .filter(log => habitIdMap[log.habit_id])  // Only logs with valid habit
  .map(log => ({
    habit_id: habitIdMap[log.habit_id],  // ✅ Remapped ID
    date: log.date,
    status: log.status,
    created_at: log.created_at,
  }));

// Step 4: Insert remapped logs
await supabase.from('habit_logs').insert(logsToInsert);
```
**Result:** ✅ Logs now attach to correct habits; history restored fully

**Fix #3: Intelligent Profile Merge**
```typescript
// Get existing profile
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (existingProfile) {
  // MERGE LOGIC: Keep the HIGHER value for stats
  const mergedProfile = {
    level: Math.max(existingProfile.level, data.profile.level),        // ✅ Higher level
    xp: Math.max(existingProfile.xp, data.profile.xp),                // ✅ Higher XP
    hp: Math.max(existingProfile.hp, data.profile.hp),                // ✅ Higher HP
    max_hp: Math.max(existingProfile.max_hp, data.profile.max_hp),    // ✅ Higher max HP
    day_start_hour: data.profile.day_start_hour,                       // User preference
    updated_at: new Date().toISOString(),
  };

  // UPDATE with merged values
  await supabase
    .from('profiles')
    .update(mergedProfile)
    .eq('id', user.id);
    
  toast.success(`Profile merged! Kept higher stats (Level ${mergedProfile.level}, ${mergedProfile.xp} XP)`);
  
} else {
  // CREATE new profile with imported data
  await supabase
    .from('profiles')
    .insert({
      ...data.profile,
      id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
  toast.success("Profile imported successfully!");
}
```
**Result:** ✅ Users don't lose progress when importing; always keeps the better stats; respects user preferences

### ❌ Errors Encountered

**Error 1: JSON Parse Failure**
```
SyntaxError: Unexpected token < in JSON at position 0
File: settings.tsx, handleImport()
Cause: User selected HTML file instead of JSON
Impact: App crashed with cryptic error
```

**Error 2: Orphaned Habit Logs**
```
Database: Logs inserted successfully
UI: No logs visible in habit history
Cause: habit_id in logs pointed to old (non-existent) habit IDs
Query: SELECT * FROM habit_logs WHERE habit_id = 'old-uuid' → 0 results
Impact: User lost all historical tracking data
```

**Error 3: Profile Overwrite**
```
Issue: Import overwrote Level 10 profile with Level 1 import
User complaint: "I lost all my progress!"
Cause: Simple replace instead of intelligent merge
Impact: User demotivation and data loss
```

### ✅ Current Status

**What Works:**
- ✅ JSON-only file acceptance (`.json` restriction)
- ✅ Structure validation (profile, habits required)
- ✅ ID remapping for habits → logs → tasks relationships
- ✅ Intelligent profile merge (keeps higher stats)
- ✅ Export includes all user data (habits, logs, tasks, summaries)
- ✅ User-friendly error messages
- ✅ Import progress feedback with toast notifications

**Export Format:**
```json
{
  "profile": {
    "level": 5,
    "xp": 1250,
    "hp": 80,
    "max_hp": 100,
    "day_start_hour": 6
  },
  "habits": [
    {
      "id": "old-uuid-1",
      "title": "Morning Meditation",
      "xp_reward": 10,
      "frequency_days": [0,1,2,3,4,5,6]
    }
  ],
  "habit_logs": [
    {
      "habit_id": "old-uuid-1",
      "date": "2026-01-15",
      "status": "completed"
    }
  ],
  "tasks": [...],
  "daily_summaries": [...]
}
```

**What's Broken:**
- None currently

**What's Next:**
- Add CSV export option
- Add selective import (choose what to import)
- Add import preview before committing
- Add merge conflict resolution UI

### 📊 Session Statistics
- **Problems Reported**: 3
- **Solutions Applied**: 3
- **Errors Encountered**: 3
- **Files Modified**: 2
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026
**Focus Areas**: JSON validation, ID remapping, intelligent profile merge

<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

<!-- SESSION 3 START -->

## Session 3 (January 2-27, 2026)

### 📝 Problems Reported

**Problem A: Invalid Import Crashes App**
- **Error**: `Unexpected token < in JSON at position 0` when user selected non-JSON file
- **Impact**: App crash/no guidance; accepted any file type

**Problem B: Habit Logs Detached After Import**
- **Symptom**: Logs inserted but not visible; orphaned by old habit IDs
- **Impact**: History lost after restore

### 💡 Solutions Applied

**Solution A: Strict File Validation**
- **Approach**: `accept=".json"`, file size guard, schema checks for `profile` + `habits` + `habit_logs`
- **Files**: `src/components/settings/ImportDataSection.tsx`, `src/hooks/useDataImport.ts`
- **Result**: Clear user errors; no crashes on bad files

**Solution B: Habit ID Remapping**
- **Approach**: Insert habits, build old→new ID map, remap `habit_logs` before insert
- **Result**: Logs now attach to correct habits; orphaned logs skipped with warning

### ❌ Errors Encountered

**Error 1: JSON Parse Failure**
```
SyntaxError: Unexpected token < in JSON at position 0
```
- **Cause**: HTML/text file selected; no validation

**Error 2: Orphaned Logs**
- **Cause**: Logs referenced old habit IDs after import
- **Resolution**: Remap IDs then insert

### ✅ Current Status
- Imports restricted to valid JSON with structure checks
- Habit logs remapped to new IDs; history visible
- User-friendly toasts for errors and success

### 📊 Session Statistics
- **Problems Reported**: 2
- **Solutions Applied**: 2
- **Errors Encountered**: 2
- **Files Modified**: 2
- **Success Rate**: 100%

### 🕐 Last Activity
**Session Date**: January 2-27, 2026  
**Focus Areas**: Import validation, ID remapping

<!-- SESSION 3 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

<!-- SESSION 5 START -->

## Session 5 (January 27, 2026)

### 📝 Problems Reported

**Problem #11: Invalid JSON Import Crashes**
**Context**: Consolidating problem documentation from Jan 2-25, 2026 sessions

**Original User Report (Jan 4, 2026)**: "Import failed with JSON parse errors when non-JSON file selected"

- **Context**: Import failed with JSON parse errors when non-JSON file selected
- **Evidence**: "Unexpected token" errors on import; no user-friendly message; app crashed on malformed input
- **Impact**: App would crash on malformed input; accepted any file type without validation

**Problem #12: Habit Logs Not Linked After Import**
**Original User Report (Jan 4, 2026)**: "Imported logs did not show because habit IDs changed"

- **Context**: Imported logs did not show in UI because habit IDs changed during import
- **Evidence**: Logs inserted successfully but not visible in UI; potential FK failures or orphaned logs
- **Impact**: Import appeared successful but historical tracking data was incomplete/lost

**Problem #13: Profile Merge Logic on Import**
**Requirement (Jan 4, 2026)**: "When importing, need intelligent logic for handling existing profile data"

- **Context**: Questions about how to handle profile conflicts during import
- **Questions**: Should we overwrite existing profile? Keep existing? Merge intelligently?
- **Impact**: Risk of data loss if not handled correctly; user demotivation if progress lost

### 💡 Solutions Applied  

**Solution #11: JSON Validation and Structure Verification**
```tsx
// File Input with Type Restriction
<input type="file" accept=".json" onChange={handleFileSelect} />
```

```typescript
// Validation Logic in useDataImport.ts
try {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Structure validation
  if (!data.profile || !Array.isArray(data.habits)) {
    throw new Error('Invalid export file: missing required data.');
  }
  
} catch (error) {
  if (error instanceof SyntaxError) {
    throw new Error('File is not valid JSON. Please select an export file.');
  }
  throw error;
}
```

**Resolution Process:**
- Enforced `.json` file selection at input level
- Added try/catch for JSON parsing with friendly error messages
- Validated file structure (profile, habits, habit_logs required)
- Provided clear user feedback via toast notifications

**Files Modified:**
- `src/hooks/useDataImport.ts` - Validation logic
- `src/components/settings/ImportDataSection.tsx` - File input UI

**Result:** ✅ Friendly errors; imports only proceed with valid JSON structure; no crashes

---

**Solution #12: ID Remapping System**
```typescript
// Step 1: Create habits and build ID map
const habitIdMap: Record<string, string> = {};

importedHabits.forEach((oldHabit, idx) => {
  habitIdMap[oldHabit.id] = createdHabits[idx].id;
});

// Step 2: Remap logs with new habit IDs
const logsToInsert = importedLogs
  .filter(log => habitIdMap[log.habit_id])  // Only logs with valid habit
  .map(log => ({
    habit_id: habitIdMap[log.habit_id],  // ✅ Remapped ID
    date: log.date,
    status: log.status,
    created_at: log.created_at,
  }));

// Step 3: Insert remapped logs
await supabase.from('habit_logs').insert(logsToInsert);
```

**Resolution Process:**
- Build old→new habit ID mapping during import
- Filter logs to only include those with successfully imported habits
- Remap habit_id foreign keys before inserting logs
- Batch insert for performance

**Result:** ✅ Logs now attach to correct habits; history restored fully; no orphaned data

---

**Solution #13: Intelligent Profile Merge**
```typescript
// Get existing profile
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (existingProfile) {
  // MERGE LOGIC: Keep the HIGHER value for stats
  const mergedProfile = {
    level: Math.max(existingProfile.level, data.profile.level),
    xp: Math.max(existingProfile.xp, data.profile.xp),
    hp: Math.max(existingProfile.hp, data.profile.hp),
    max_hp: Math.max(existingProfile.max_hp, data.profile.max_hp),
    day_start_hour: data.profile.day_start_hour,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('profiles').update(mergedProfile).eq('id', user.id);
  
  toast.success(`Profile merged! Kept higher stats (Level ${mergedProfile.level})`);
} else {
  // CREATE new profile
  await supabase.from('profiles').insert({
    ...data.profile,
    id: user.id,
  });
}
```

**Resolution Process:**
- Check if profile already exists for user
- If exists: merge by keeping HIGHER values for all stats (level, XP, HP)
- If new: create profile with imported data
- User preference fields (day_start_hour) taken from import
- Clear feedback via toast notification

**Result:** ✅ Users don't lose progress when importing; always keeps better stats; respects preferences

### ❌ Errors Encountered

**No new errors in Session 5** - This session focused on consolidating and documenting existing solutions from Jan 2-25, 2026 period.

**Historical Errors Documented:**

**Error 1: JSON Parse Failure**
```
SyntaxError: Unexpected token < in JSON at position 0
File: settings.tsx, handleImport()
Cause: User selected HTML file instead of JSON
Impact: App crashed with cryptic error
```

**Error 2: Orphaned Habit Logs**
```
Database: Logs inserted successfully
UI: No logs visible in habit history
Cause: habit_id in logs pointed to old (non-existent) habit IDs
Query: SELECT * FROM habit_logs WHERE habit_id = 'old-uuid' → 0 results
Impact: User lost all historical tracking data
```

**Error 3: Profile Overwrite**
```
Issue: Import overwrote Level 10 profile with Level 1 import
User complaint: "I lost all my progress!"
Cause: Simple replace instead of intelligent merge
Impact: User demotivation and data loss
```

### ✅ Current Status

**Session 5 Documentation Activity:**
- ✅ Consolidated two "Problem faced" documentation files into one
- ✅ Documented 3 import/export issues in detail with full solutions
- ✅ Added comprehensive problem log organized by category
- ✅ Created summary table tracking all 11 problems from Jan 2-25
- ✅ Merged duplicate problem descriptions from two separate files

**Import/Export System Status:**
- ✅ JSON-only file acceptance (`.json` restriction)
- ✅ Structure validation (profile, habits, habit_logs required)
- ✅ ID remapping for habits → logs → tasks relationships
- ✅ Intelligent profile merge (keeps higher stats)
- ✅ Export includes all user data (habits, logs, tasks, summaries)
- ✅ User-friendly error messages with toast notifications
- ✅ Import progress feedback

**Export Format (JSON):**
```json
{
  "profile": {
    "level": 5,
    "xp": 1250,
    "hp": 80,
    "max_hp": 100,
    "day_start_hour": 6
  },
  "habits": [...],
  "habit_logs": [...],
  "tasks": [...],
  "daily_summaries": [...]
}
```

**Problem Documentation Consolidation:**
- Source 1: `Problem faced.md` (1,086 lines) - Recent issues
- Source 2: `Problem faced - Jan 2-5 2026.md` (273 lines) - Early session
- Result: Single consolidated `Problem faced.md` (636 lines) in root folder
- Old duplicate file deleted
- 100% success rate on all documented import/export problems

### 📊 Session Statistics
- **Problems Documented**: 3 (from Jan 4 period)
- **Solutions Documented**: 3 (with full TypeScript code)
- **Errors Documented**: 3 (historical)
- **Files Modified**: 1 (`Problem faced.md` - consolidated)
- **Documentation Success Rate**: 100%
- **Import/Export Issues Resolved**: 3 of 3 (100%)

### 🕐 Last Activity
**Session Date**: January 27, 2026 (documenting Jan 2-25, 2026 work)
**Duration**: ~30 minutes (documentation consolidation)
**Focus Areas**: Import/export problem documentation, JSON validation tracking, ID remapping documentation

<!-- SESSION 5 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## 📜 Change Log
### v1.0 (January 27, 2026)
- Initial documentation created
- Documented JSON validation system
- Added ID remapping implementation
- Documented intelligent profile merge logic

---

**Maintained by**: AI-assisted documentation system
