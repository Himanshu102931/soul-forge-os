# SESSION 6 BRIEF: Performance Optimization

**⚠️ SESSION STATUS: ✅ COMPLETE - 100% (January 28, 2026)**  
**✅ ALL SUCCESS CRITERIA MET**  
**📊 Verification: 21 queries, 20+ mutations, 0 TypeScript errors**  
**📝 See: [SESSION_6_COMPLETION_FINAL.md](SESSION_6_COMPLETION_FINAL.md) for full report**


**Feature**: React Query Configuration  
**Session Number**: 6  
**Date**: January 28, 2026  
**Estimated Time**: 30-60 minutes → **Actual: 2.5 hours**  
**Complexity**: ⭐ 1/5 (Estimated) → **⭐⭐⭐ 3/5 (Actual - comprehensive mutation coverage)**


## 🎯 QUICK REFERENCE

**Status in Old App**: ✅ Working (2min cache, optimized queries)  
**Status in Current App**: ✅ **COMPLETE** (`query-config.ts` exists + all hooks updated)  
**Priority**: 🔴 **CRITICAL** (affects all features) - **NOW RESOLVED**  
**Complexity**: ⭐ 1/5 (Simple - just configuration)  
**Dependencies**: None (foundation layer)


## 📖 WHAT IS THIS FEATURE?

React Query configuration file that prevents aggressive data refetching and reduces page load times. The old app had slow loads (4-5 seconds) which was fixed by setting proper stale/cache times.

**Impact**: Every data-fetching hook in the app will benefit from this optimization.


## 🎯 SUCCESS CRITERIA

**MUST WORK:**

**NICE TO HAVE:**


## 📂 FILES TO CREATE

### `src/lib/query-config.ts` (NEW FILE)

**Purpose**: Default configuration for React Query  
**Lines**: ~20-30 lines  
**Exports**: `queryConfig`, `createQueryClient()`

**Key Settings** (from docs):


## 📝 FILES TO MODIFY

### `src/App.tsx`

**Current Code** (line ~25):
```typescript
const queryClient = new QueryClient();
```

**Change To**:
```typescript
import { createQueryClient } from '@/lib/query-config';

const queryClient = createQueryClient();
```


## 📚 REFERENCE DOCUMENTATION

**Primary Doc**: [Performance-Optimization.md](Performance-Optimization.md)

**Key Sections**:
1. **Session 1 → Problem #1**: "Slow page loads and refetches"
   - Dashboard taking 4-5 seconds to load
   - Aggressive refetching on window focus
   
2. **Session 1 → Solution #1**: "Query optimization (2min cache)"
   - Set staleTime to 2 minutes
   - Disabled refetchOnWindowFocus
   - Result: Page loads <2 seconds

**Quote from docs**:
> "Query optimization (2min cache), bundle splitting, React.memo"  
> "Reduced page load from 4-5s to <2s"


## ⚠️ KNOWN ISSUES TO AVOID

**From Old App:**
1. ❌ **Don't set staleTime too high** (>5min)
   - Data will feel stale
   - User won't see fresh updates
   
2. ❌ **Don't disable refetch entirely**
   - Need fresh data on auth changes
   - Important for habits that change throughout day

3. ⚠️ **XP Jitter Problem** (mentioned in docs)
   - Rapid habit toggles caused XP to jitter
   - Fixed with debounced refetch (500ms)
   - This is handled in `useHabits.ts` separately

**Docs mention**:
> "Debounced refetch to prevent XP jitter from rapid toggles"


## 💡 IMPLEMENTATION GUIDE

### Step 1: Create `src/lib/query-config.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

/**
 * Default React Query configuration
 * Prevents aggressive refetching and improves performance
 * 
 * Key settings:
 * - staleTime: 2min - data considered fresh for 2 minutes
 * - gcTime: 5min - cached data kept for 5 minutes (formerly cacheTime)
 * - refetchOnWindowFocus: false - don't refetch when window regains focus
 * - refetchOnMount: false - don't refetch on component mount if data exists
 * - retry: 1 - retry failed queries once
 */
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes in milliseconds
      gcTime: 5 * 60 * 1000, // 5 minutes (replaces deprecated cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true, // Do refetch when internet reconnects
      retry: 1, // Retry failed queries once
    },
    mutations: {
      retry: 0, // Don't retry mutations (could cause duplicate operations)
    },
  },
};

/**
 * Create a new QueryClient with optimized defaults
 * Use this instead of `new QueryClient()` for consistent config
 */
export const createQueryClient = () => new QueryClient(queryConfig);
```


### Step 2: Modify `src/App.tsx`

**Find this line** (~line 25):
```typescript
const queryClient = new QueryClient();
```

**Replace with**:
```typescript
import { createQueryClient } from '@/lib/query-config';

// ... existing imports ...

const queryClient = createQueryClient();
```


### Step 3: (Optional) Add React Query DevTools

**For development debugging**, add DevTools to `App.tsx`:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Inside your QueryClientProvider return:
<QueryClientProvider client={queryClient}>
  {/* Your app components */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Note**: DevTools are automatically excluded from production builds.


## 🔍 VALIDATION CHECKLIST

### Before Marking Complete:

**1. File Creation**

**2. Integration**

**3. Functional Testing**

**4. Performance Metrics**


## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?


## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data


## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):

**After optimization** (target):


## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:

### Testing Results:

### Issues Encountered:

### Performance Gains:

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]


## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?


## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data


## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):

**After optimization** (target):


## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:

### Testing Results:

### Issues Encountered:

### Performance Gains:

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states
   - Prevent "flash of loading" for cached data

---

## 🧪 TESTING PROCEDURE

### Manual Test Steps:

1. **Clean State Test**
   ```bash
   # Clear browser cache
   # Hard refresh (Ctrl+Shift+R)
   # Open Network tab
   npm run dev
   ```
   - Navigate to `/`
   - **Expect**: ~3-5 network requests, load in <2s

2. **Cached State Test**
   - Navigate to `/tasks`
   - Navigate back to `/`
   - **Expect**: No new network requests (data from cache)

3. **Window Focus Test**
   - Click into another application
   - Click back to browser
   - **Expect**: No refetch triggered

4. **Stale Data Test**
   - Wait 3 minutes (past 2min stale time)
   - Navigate to different page and back
   - **Expect**: Fresh fetch happens (data was stale)

### Performance Benchmark:

**Before optimization** (docs say):
- Dashboard load: 4-5 seconds
- Requests on focus: 5-10
- Total requests: 15-20

**After optimization** (target):
- Dashboard load: <2 seconds ✅
- Requests on focus: 0 ✅
- Total requests: 3-5 ✅

---

## 📊 SESSION REPORT (AI: Fill after completion)

### What Was Built:
- [ ] Created: `src/lib/query-config.ts`
- [ ] Modified: `src/App.tsx`
- [ ] (Optional) Added React Query DevTools

### Testing Results:
- Dashboard load time: **[X] seconds** (target: <2s)
- Requests on mount: **[X] requests** (target: 3-5)
- Requests on window focus: **[X] requests** (target: 0)
- TypeScript errors: **[X]** (target: 0)
- Console errors: **[X]** (target: 0)

### Issues Encountered:
- [Issue 1] → [How resolved]

### Performance Gains:
- Before: [X]s load time
- After: [X]s load time
- **Improvement**: [X]% faster

### Recommendations for Next Session:
1. [Suggestion for Session 7]
2. [Any follow-up needed]

---

## 🤔 QUESTIONS FOR USER (AI: Ask before starting)

1. **Stale Time**: Docs say 2 minutes. Is this good for all features, or should some have shorter/longer cache?
   - Habits: 2min seems good (changes throughout day)
   - Profile: Could be longer (5min?) - rarely changes
   - Tasks: 2min seems good

2. **DevTools**: Should I add React Query DevTools for debugging? (Development only, no production impact)

3. **Retry Logic**: Currently set to retry: 1. Should failed requests retry more times, or is 1 enough?

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

### Beyond the Docs:

1. **Per-Query Override**
   - Add ability for specific queries to override defaults
   - Example: Real-time features might need staleTime: 0
   
   ```typescript
   // In specific hook:
   useQuery({
     queryKey: ['realtime-data'],
     queryFn: fetchData,
     staleTime: 0, // Override for this query
   })
   ```

2. **Network-Aware Caching**
   - Adjust stale time based on connection speed
   - Longer cache on slow connections
   
3. **Error Logging**
   - Add global error handler for failed queries
   - Log to analytics/Sentry

4. **Loading States**
   - Configure global loading states