# SESSION BRIEF TEMPLATE

**Purpose**: Attach this to new AI sessions to quickly orient them on what feature to build/fix  
**Version**: 1.0  
**Created**: January 28, 2026

---

## 📋 HOW TO USE THIS TEMPLATE

### For the User:
1. Copy the "FEATURE BRIEF" section below
2. Fill in the specific feature details
3. Attach to new AI session
4. Tell AI: "Build this feature following the brief"

### For the AI:
1. Read the brief carefully
2. Check if feature exists in codebase
3. If exists: Fix/improve per docs
4. If missing: Build from scratch
5. Ask questions if anything is unclear
6. Provide suggestions for improvements
7. Build and test the feature
8. **IMPORTANT**: When complete, append session report to `SESSION_PROGRESS.md`
9. Update roadmap with completion status

---

## 🎯 FEATURE BRIEF (Copy & Fill This Section)

### Feature Name: [NAME]

**Status in Old App**: [✅ Working | 🟡 Partial | ❌ Missing | 🆕 New]  
**Status in Current App**: [✅ Exists | 🟡 Partial | ❌ Missing]  
**Priority**: [🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low]  
**Estimated Complexity**: [1-5 scale, 1=simple, 5=complex]  
**Dependencies**: [List other features this depends on]

---

### 📖 Feature Overview

[2-3 sentence description of what this feature does]

---

### 📂 Files to Check/Create

**Files mentioned in docs:**
- `path/to/file1.ts` - [Description]
- `path/to/file2.tsx` - [Description]

**Files that exist:**
- ✅ `existing/file.ts`
- ❌ `missing/file.tsx` (need to create)

---

### 🎯 Success Criteria

What MUST work by end of session:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

### 📚 Reference Documentation

**Primary Doc**: [Link to feature .md file, e.g., Habits.md]  
**Related Docs**: [Links to other relevant .md files]

**Key Sections to Read:**
- Section: "Problem #X" - [Brief description]
- Section: "Solution #Y" - [Brief description]

---

### ⚠️ Known Issues from Old App

**Problems that were fixed:**
1. [Problem description] → [Solution applied]

**Problems to avoid:**
- ❌ [Anti-pattern to avoid]
- ❌ [Common mistake]

---

### 💡 Implementation Hints

**Tech Stack:**
- React + TypeScript
- Supabase (PostgreSQL + RLS)
- React Query (data fetching)
- Tailwind CSS + Shadcn UI
- Framer Motion (animations)
- Zod (validation)

**Code Patterns:**
```typescript
// Example: How hooks are structured
export function useFeatureName() {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();
  
  return useQuery({
    queryKey: ['feature', user?.id, logicalDate],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      // Fetch from Supabase
    },
    enabled: !!user,
  });
}
```

**Component Patterns:**
```typescript
// Example: How components are structured
export default function FeaturePage() {
  const { data, isLoading } = useFeatureName();
  
  if (isLoading) return <Loader />;
  if (!data) return <EmptyState />;
  
  return <FeatureUI data={data} />;
}
```

---

### 🔍 Validation Checklist

Before marking complete, verify:
- [ ] TypeScript compiles with no errors
- [ ] App runs without console errors
- [ ] Feature works in browser (manual test)
- [ ] RLS policies prevent unauthorized access
- [ ] Mobile responsive (check at 375px width)
- [ ] Loading states handle async properly
- [ ] Error messages are user-friendly

---

### 🤔 Questions for User (AI: Fill these in)

**Before starting, clarify:**
1. [Question about unclear requirement]
2. [Question about design choice]

**Suggestions:**
1. [Improvement idea beyond docs]
2. [Alternative approach consideration]

---

### 📊 Session Report (AI: Fill after completion)

**What was built:**
- Created: [list files]
- Modified: [list files]
- Deleted: [list files]

**Issues encountered:**
- [Issue 1] → [How resolved]

**Testing results:**
- [What works]
- [What needs follow-up]

**Recommendations for next session:**
- [Suggestion 1]
- [Suggestion 2]

---

## ✅ SESSION COMPLETION INSTRUCTIONS (AI: CRITICAL)

### After completing this feature, you MUST:

1. **Append to SESSION_PROGRESS.md**:
   ```markdown
   ## Session [NUMBER] - [FEATURE NAME] - [DATE]
   
   **Status**: ✅ Complete | 🟡 Partial | ❌ Failed
   **Time Taken**: [X hours]
   **Complexity**: [Actual vs Estimated]
   
   ### What Was Built:
   - Created: [files with line counts]
   - Modified: [files with changes made]
   - Deleted: [files removed]
   
   ### Success Criteria Results:
   - [✅/❌] Criterion 1
   - [✅/❌] Criterion 2
   
   ### Issues & Solutions:
   - [Problem] → [Solution]
   
   ### Testing Summary:
   - Manual testing: [Results]
   - Performance: [Metrics if applicable]
   
   ### Next Feature Recommended:
   **Session [N+1]**: [Feature Name] - [Why this next]
   
   **Reason**: [1-2 sentences on why this is the logical next step]
   
   ---
   ```

2. **Update FEATURE_REBUILD_ROADMAP.md**:
   - Change session status from ⏳ to ✅ or 🟡
   - Update progress percentage
   - Note any deviations from plan

3. **Create Next Session Brief** (optional but helpful):
   - Use SESSION_BRIEF_TEMPLATE.md
   - Fill in details for next feature
   - Save as `SESSION_[N+1]_BRIEF_[FEATURE].md`

---

## 📋 EXAMPLE BRIEF

### Feature Name: Performance Optimization (Query Config)

**Status in Old App**: ✅ Working (docs mention 2min cache, React.memo)  
**Status in Current App**: ❌ Missing (no query-config.ts file)  
**Priority**: 🟡 High (impacts all features)  
**Estimated Complexity**: 2/5 (simple file creation)  
**Dependencies**: None (foundation layer)

---

### 📖 Feature Overview

React Query configuration to prevent aggressive refetching and reduce load times from 4-5 seconds to <2 seconds. Implements stale time, cache time, and retry policies.

---

### 📂 Files to Check/Create

**Files mentioned in docs:**
- `src/lib/query-config.ts` - React Query default options
- `src/App.tsx` - Apply config to QueryClient

**Files that exist:**
- ✅ `src/App.tsx` (modify line 25: `const queryClient = new QueryClient()`)
- ❌ `src/lib/query-config.ts` (create new)

---

### 🎯 Success Criteria

- [ ] `query-config.ts` exists with proper defaults
- [ ] QueryClient uses config in App.tsx
- [ ] Dashboard loads in <2 seconds (vs 4-5 before)
- [ ] Data doesn't refetch on every window focus

---

### 📚 Reference Documentation

**Primary Doc**: [Performance-Optimization.md](Performance-Optimization.md)  
**Related Docs**: None

**Key Sections to Read:**
- Session 1 - "Problem: Slow page loads and refetches"
- Session 1 - "Solution: Query optimization (2min cache)"

---

### ⚠️ Known Issues from Old App

**Problems that were fixed:**
1. Aggressive refetching caused XP jitter → 2min stale time solved it

**Problems to avoid:**
- ❌ Don't set stale time too high (>5min) or data feels stale
- ❌ Don't disable refetch entirely (need fresh data on auth changes)

---

### 💡 Implementation Hints

**Create:** `src/lib/query-config.ts`
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
};

export const createQueryClient = () => new QueryClient(queryConfig);
```

**Modify:** `src/App.tsx`
```typescript
// BEFORE:
const queryClient = new QueryClient();

// AFTER:
import { createQueryClient } from '@/lib/query-config';
const queryClient = createQueryClient();
```

---

### 🔍 Validation Checklist

- [ ] File created with proper exports
- [ ] App.tsx imports and uses config
- [ ] No TypeScript errors
- [ ] Dashboard loads faster (test with Network throttling)
- [ ] Habits don't refetch on window focus

---

### 🤔 Questions for User

**Before starting:**
1. Should stale time be 2min (docs) or adjust based on feature?
2. Any features that need real-time updates (shorter stale time)?

**Suggestions:**
1. Add per-query override capability (some queries need fresh data)
2. Add React Query DevTools in development mode

---

**End of Template**
