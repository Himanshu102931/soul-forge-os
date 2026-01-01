/**
 * React Query Configuration
 * Optimized defaults for better caching and performance
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Configure React Query with optimized defaults
 * 
 * Key optimizations:
 * - Longer stale times to reduce unnecessary refetches
 * - Smart cache times to balance memory and performance
 * - Retry logic for better UX on network errors
 * - Background refetch on focus for fresh data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      // 5 minutes for most queries (was 0ms = always stale)
      staleTime: 5 * 60 * 1000,
      
      // Cache time - how long inactive data stays in cache
      // 10 minutes (default is 5 minutes)
      gcTime: 10 * 60 * 1000,
      
      // Retry failed queries (network errors)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (keep data fresh)
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect (sync after offline)
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Query key factories for consistent cache keys
 * Prevents typos and enables better cache invalidation
 */
export const queryKeys = {
  // Habits
  habits: (userId: string, date?: string) => 
    date ? ['habits', userId, date] : ['habits', userId],
  habit: (habitId: string) => ['habit', habitId],
  habitLogs: (habitId: string, startDate?: string, endDate?: string) => 
    ['habit-logs', habitId, startDate, endDate].filter(Boolean),
  
  // Tasks
  tasks: (userId: string, filters?: { completed?: boolean; isForToday?: boolean }) => 
    ['tasks', userId, filters],
  task: (taskId: string) => ['task', taskId],
  archivedTasks: (userId: string, page?: number) => 
    ['archived-tasks', userId, page],
  
  // Daily summaries
  dailySummaries: (userId: string, startDate?: string, endDate?: string) => 
    ['daily-summaries', userId, startDate, endDate].filter(Boolean),
  todaySummary: (userId: string, date: string) => 
    ['today-summary', userId, date],
  recentSummaries: (userId: string, count: number) => 
    ['recent-summaries', userId, count],
  
  // Metrics
  metrics: (userId: string, date?: string) => 
    date ? ['metrics', userId, date] : ['metrics', userId],
  metricLogs: (userId: string, metricId?: string, startDate?: string, endDate?: string) => 
    ['metric-logs', userId, metricId, startDate, endDate].filter(Boolean),
  
  // Profile
  profile: (userId: string) => ['profile', userId],
  
  // Analytics
  analytics: (userId: string, type: string, params?: Record<string, unknown>) => 
    ['analytics', userId, type, params],
  
  // Achievements
  achievements: (userId: string) => ['achievements', userId],
  unlockedAchievements: (userId: string) => ['unlocked-achievements', userId],
} as const;

/**
 * Stale time overrides for specific query types
 * Adjust based on data volatility
 */
export const staleTimes = {
  // Real-time data (update frequently)
  realtime: 30 * 1000,           // 30 seconds
  
  // Semi-static data (habits, profile)
  semiStatic: 5 * 60 * 1000,     // 5 minutes (default)
  
  // Static data (achievements, categories)
  static: 30 * 60 * 1000,        // 30 minutes
  
  // Historical data (past summaries, analytics)
  historical: 60 * 60 * 1000,    // 1 hour
  
  // Rarely changing (profile settings)
  rarelyChanging: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Prefetch strategy for common user flows
 * Improves perceived performance by loading data before it's needed
 */
export async function prefetchCommonData(userId: string, date: string) {
  const prefetches = [
    // Prefetch today's habits and tasks in parallel
    queryClient.prefetchQuery({
      queryKey: queryKeys.habits(userId, date),
      staleTime: staleTimes.realtime,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.tasks(userId, { isForToday: true }),
      staleTime: staleTimes.realtime,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.profile(userId),
      staleTime: staleTimes.semiStatic,
    }),
  ];
  
  await Promise.all(prefetches);
}

/**
 * Optimistic update helper
 * Update UI immediately, rollback on error
 */
export function optimisticUpdate<T>(
  queryKey: unknown[],
  updater: (old: T | undefined) => T
) {
  const previousData = queryClient.getQueryData<T>(queryKey);
  queryClient.setQueryData<T>(queryKey, updater);
  return previousData;
}

/**
 * Batch invalidation helper
 * Invalidate multiple related queries efficiently
 */
export function invalidateRelatedQueries(patterns: string[][]) {
  patterns.forEach(pattern => {
    queryClient.invalidateQueries({ 
      queryKey: pattern,
      exact: false 
    });
  });
}
