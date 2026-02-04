# FEATURE DOCUMENTATION FILE STRUCTURE GUIDE

**Version**: v1.1  
**Created**: January 27, 2026  
**Last Updated**: January 27, 2026  
**Purpose**: Reference guide for all feature documentation files and their append markers  
**Status**: ✅ Finalized - Structure enforced across all documentation

---

## 📁 DIRECTORY STRUCTURE

```
e:\App\Habit Checker\
├── MASTER_FEATURE_DOCUMENTATION.md         # Combined view of all features (multi-session)
├── APPEND_PROMPT.md                        # Prompt for other sessions
├── FILE_STRUCTURE_GUIDE.md                 # This file
├── PROBLEM_DOCUMENTATION_PROMPT.md         # Legacy problem documentation prompt
├── Problem faced.md                        # Master problem log (consolidated)
│
├── Feature Documentation Files/
│   ├── Dashboard.md
│   ├── Tasks.md
│   ├── Habits.md
│   ├── Calendar.md
│   ├── Achievements.md
│   ├── Settings.md
│   ├── Profile-Stats.md
│   ├── Nightly-Review.md
│   ├── Import-Export.md
│   ├── Authentication.md
│   ├── Database-Schema.md
│   ├── Performance-Optimization.md
│   ├── Mobile-Responsiveness.md
│   └── AI-Features.md
│
├── archive/
│   ├── COMPLETE_SESSION_REBUILD_GUIDE.md   # Fresh workspace setup guide
│   ├── SESSION_LOG.md                      # Archived chronological session log
│   └── [Other archived files...]
│
└── [Other project files...]
```

---

## 📋 FEATURE FILE LIST

### Core Features (User-Facing)

| # | File Name | Feature | Primary Files | Status |
|---|-----------|---------|---------------|--------|
| 1 | `Dashboard.md` | Main dashboard view | `src/pages/Dashboard.tsx` | Active |
| 2 | `Tasks.md` | Task management | `src/components/tasks/*` | Active |
| 3 | `Habits.md` | Habit tracking | `src/hooks/useHabits.ts`, `src/components/habits/*` | Active |
| 4 | `Calendar.md` | Calendar view | `src/components/calendar/*` | Active |
| 5 | `Achievements.md` | Achievements system | `src/hooks/useAchievements.ts`, `src/components/achievements/*` | Active |
| 6 | `Settings.md` | Settings/configuration | `src/pages/Settings.tsx` | Active |
| 7 | `Profile-Stats.md` | User profile & stats | `src/hooks/useProfile.ts` | Active |
| 8 | `Nightly-Review.md` | Daily review feature | `src/components/NightlyReview.tsx` | Active |
| 9 | `Import-Export.md` | Data import/export | `src/hooks/useDataImport.ts`, `src/hooks/useDataExport.ts` | Active |

### System Features (Infrastructure)

| # | File Name | Feature | Primary Files | Status |
|---|-----------|---------|---------------|--------|
| 10 | `Authentication.md` | User auth & login | `src/hooks/useAuth.ts`, Supabase auth | Active |
| 11 | `Database-Schema.md` | Database structure | `supabase/migrations/*`, schema files | Active |
| 12 | `Performance-Optimization.md` | Performance work | `src/lib/query-config.ts`, optimization efforts | Active |
| 13 | `Mobile-Responsiveness.md` | Mobile/responsive design | CSS, responsive components | Active |
| 14 | `AI-Features.md` | AI integration | AI-related components | Planned |
| 15 | `Documentation-Management.md` | Documentation organization | Problem faced.md, all .md files | Active |

---

## 🔖 MARKER SYSTEM

Every feature file uses these markers for session appending:

### Marker Locations

```markdown
[File Header with metadata]

# [Feature Name]

## Overview
[Feature description]

## Related Files
[List of files]

---

<!-- SESSION 1 START -->
[Session 1 content]
<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## Cross-Feature Issues
[Tags and references]

## Change Log
[Version history]
```

### Critical Markers

1. **`<!-- SESSION [NUMBER] START -->`**
   - Marks beginning of a session's contribution
   - Never edit or remove

2. **`<!-- SESSION [NUMBER] END -->`**
   - Marks end of a session's contribution
   - Never edit or remove

3. **`<!-- APPEND NEW SESSIONS BELOW THIS LINE -->`**
   - This is WHERE new sessions should append
   - Always append IMMEDIATELY after this marker
   - Never remove this marker

### Append Location Example

```markdown
<!-- SESSION 1 START -->
[Session 1 data - DO NOT MODIFY]
<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->
← NEW SESSION 2 DATA GOES RIGHT HERE

<!-- End of sessions -->
```

---

## 📝 FILE STRUCTURE TEMPLATE

Each feature file follows this structure:

```markdown
# [Feature Name]

**Version**: v1.X  
**Last Updated**: [Date]  
**Last Session**: Session [N]  
**Total Sessions**: [Count]  
**Status**: 🟢 Active | 🟡 In Progress | 🔴 Issues

---

## 📖 Overview

[Brief description of feature]

---

## 📂 Related Files

Primary files for this feature:
- `path/to/file1.ts` - [Description]
- `path/to/file2.tsx` - [Description]

Related features: [Links to other .md files]

---

## 🏷️ Cross-Feature Tags

Issues that affect multiple features:
- `#authentication` - Affects: Dashboard, Habits, Settings
- `#performance` - Affects: Calendar, Dashboard

---

<!-- SESSION 1 START -->

## Session 1 ([Date Range])

### 📝 Problems Reported

[Problems]

### 💡 Solutions Applied

[Solutions]

### ❌ Errors Encountered

[Errors]

### ✅ Current Status

[Status]

### 📊 Session Statistics

[Stats]

### 🕐 Last Activity

[Activity summary]

<!-- SESSION 1 END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->

---

## 📜 Change Log

### v1.0 (January 27, 2026)
- Initial documentation structure created
- Session 1 data added

---

**Maintained by**: AI-assisted documentation system  
**Documentation Type**: Feature-based, multi-session  
**Related**: See MASTER_FEATURE_DOCUMENTATION.md for combined view
```

---

## 🔄 APPEND WORKFLOW

### For AI Sessions

1. **Read this guide** to understand structure
2. **Identify your session number** from user
3. **Scan conversation** to detect features worked on
4. **For each feature**:
   ```
   a. Read [Feature].md file
   b. Find: <!-- APPEND NEW SESSIONS BELOW THIS LINE -->
   c. Use replace_string_in_file to insert your session block
   d. Update metadata at top of file
   ```
5. **Update MASTER_FEATURE_DOCUMENTATION.md**
6. **Update this guide** if new files were created

### String to Replace (Example for Dashboard.md)

```markdown
<!-- APPEND NEW SESSIONS BELOW THIS LINE -->
```

Replace with:

```markdown
<!-- SESSION [N] START -->
[Your session content]
<!-- SESSION [N] END -->

<!-- APPEND NEW SESSIONS BELOW THIS LINE -->
```

This preserves the append marker for the next session!

---

## 📊 FILE METADATA TRACKING

### Version Numbering

- **Major version** (X.0): Structural changes, complete rewrites
- **Minor version** (1.X): New session added
- **Format**: v1.0, v1.1, v1.2, etc.

### Update Rules

When appending a session:
1. Increment minor version: v1.2 → v1.3
2. Update "Last Updated" date
3. Update "Last Session" number
4. Increment "Total Sessions" count

Example:
```markdown
**Version**: v1.2 → v1.3
**Last Updated**: January 27, 2026
**Last Session**: Session 2 → Session 3
**Total Sessions**: 2 → 3
```

---

## 🔍 FINDING SPECIFIC INFORMATION

### By Feature
- Go to individual feature file (e.g., `Habits.md`)
- All sessions for that feature in one place

### By Session
- Go to `MASTER_FEATURE_DOCUMENTATION.md`
- Search for `<!-- SESSION [N] START -->`
- See all features worked on in that session

### By Problem/Error
- Use workspace search (Ctrl+Shift+F)
- Search across all .md files
- Check cross-feature tags

### By File Path
- Check "Related Files" section in feature docs
- Use workspace file search to find which feature

---

## ⚠️ CRITICAL RULES

### DO NOT:
- ❌ Remove or edit session markers
- ❌ Modify other session's content
- ❌ Delete the "APPEND NEW SESSIONS" marker
- ❌ Change the file structure without updating this guide

### DO:
- ✅ Always append after the append marker
- ✅ Preserve all existing content
- ✅ Update metadata when adding sessions
- ✅ Use proper markdown formatting
- ✅ Include session markers in your append

---

## 🆘 TROUBLESHOOTING

### Can't Find Append Marker

**Problem**: File missing `<!-- APPEND NEW SESSIONS BELOW THIS LINE -->`

**Solution**:
1. Check if file was created by Session 1
2. Read entire file to find marker
3. If truly missing, add it manually before oldest session

### Wrong Append Location

**Problem**: Accidentally appended in wrong place

**Solution**:
1. Use file history to restore
2. Find correct marker location
3. Cut your content and paste in correct location

### Metadata Not Updating

**Problem**: Version number didn't increment

**Solution**:
1. Manually update metadata at top of file
2. Use `replace_string_in_file` to update version line

### Duplicate Sessions

**Problem**: Session appended twice

**Solution**:
1. Find duplicate session blocks
2. Remove the duplicate
3. Verify marker integrity

---

## 📈 STATISTICS TRACKING

### Per Feature File

Track these statistics in each session:
- Problems Reported: Count
- Solutions Applied: Count
- Errors Encountered: Count
- Files Modified: Count
- Success Rate: Solved/Total

### Across All Features

Master file includes:
- Total sessions documented
- Most worked-on features
- Common cross-cutting issues
- Overall project timeline

---

## 🔗 CROSS-REFERENCES

### Feature Dependencies

Document which features depend on others:
- Habits → Database Schema, Authentication
- Dashboard → All features (aggregates data)
- Import/Export → Database Schema, All data features

### Issue Tags

Use consistent tags across features:
- `#authentication` - Auth-related issues
- `#performance` - Performance problems
- `#schema` - Database schema issues
- `#ui` - UI/UX problems
- `#mobile` - Mobile responsiveness
- `#build` - Build/compilation issues

---

## 📞 QUICK REFERENCE

### File Locations
```
Individual features: e:\App\Habit Checker\[Feature].md
Master file: e:\App\Habit Checker\MASTER_FEATURE_DOCUMENTATION.md
This guide: e:\App\Habit Checker\FILE_STRUCTURE_GUIDE.md
Append prompt: e:\App\Habit Checker\APPEND_PROMPT.md
```

### Key Markers
```
Session start: <!-- SESSION [N] START -->
Session end: <!-- SESSION [N] END -->
Append here: <!-- APPEND NEW SESSIONS BELOW THIS LINE -->
```

### Metadata Location
```
Top of each file, first 5 lines after title
```

---

**End of Guide**

**Next Steps**:
1. Use APPEND_PROMPT.md to document other sessions
2. Check MASTER_FEATURE_DOCUMENTATION.md for combined view
3. Refer to this guide when appending new sessions

**Questions?** Check troubleshooting section above.
