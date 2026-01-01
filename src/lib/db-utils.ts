/**
 * Database Query Optimization Utilities
 * Helpers for efficient Supabase queries
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Batch fetch helper - reduces round trips to database
 * Instead of N queries, makes 1 query with .in()
 */
export async function batchFetch<T>(
  client: SupabaseClient,
  table: string,
  column: string,
  ids: string[],
  select = '*'
): Promise<T[]> {
  if (ids.length === 0) return [];
  
  const { data, error } = await client
    .from(table)
    .select(select)
    .in(column, ids);
  
  if (error) throw error;
  return data as T[];
}

/**
 * Paginated query helper
 * Consistent pagination across all queries
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount?: number;
  hasMore?: boolean;
}

export async function paginatedQuery<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, // Use any for Supabase query builder flexibility
  params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const { page = 1, pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;
  
  // Get total count (optional, for showing "Page X of Y")
  const { count } = await query.select('*', { count: 'exact', head: true });
  
  // Get paginated data
  const { data, error } = await query
    .range(offset, offset + pageSize - 1);
  
  if (error) throw error;
  
  return {
    data: data as T[],
    page,
    pageSize,
    totalCount: count || undefined,
    hasMore: count ? offset + pageSize < count : undefined,
  };
}

/**
 * Optimized date range query
 * Uses indexes effectively with proper ordering
 */
export function dateRangeQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any, // Use any for Supabase query builder flexibility
  startDate?: string,
  endDate?: string,
  orderDirection: 'asc' | 'desc' = 'desc'
) {
  let q = query;
  
  if (startDate) {
    q = q.gte('date', startDate);
  }
  
  if (endDate) {
    q = q.lte('date', endDate);
  }
  
  return q.order('date', { ascending: orderDirection === 'asc' });
}

/**
 * Select only needed columns
 * Reduces data transfer and improves performance
 */
export const SELECT_MINIMAL = {
  habit: 'id, title, frequency_days, is_bad_habit, xp_reward',
  habitWithLog: 'id, title, frequency_days, is_bad_habit, xp_reward, todayLog:habit_logs(*)',
  task: 'id, title, completed, priority, due_date',
  summary: 'id, date, xp_earned, hp_lost, mood_score',
  profile: 'id, display_name, xp, level, hp, profile_image_url',
  metric: 'id, metric_id, value, date',
} as const;

/**
 * Combine queries with proper joins
 * Use Supabase's foreign key relationships
 */
export async function queryWithRelations<T>(
  client: SupabaseClient,
  table: string,
  select: string,
  filters?: Record<string, unknown>
): Promise<T[]> {
  let query = client.from(table).select(select);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data as T[];
}

/**
 * Debounced update helper
 * Prevents database spam from rapid state changes
 */
export function createDebouncedUpdate(delayMs = 500) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingUpdate: (() => Promise<void>) | null = null;
  
  return async (updateFn: () => Promise<void>) => {
    pendingUpdate = updateFn;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(async () => {
      if (pendingUpdate) {
        await pendingUpdate();
        pendingUpdate = null;
      }
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Upsert helper for conflict resolution
 * Efficiently handles insert or update scenarios
 */
export async function upsertRecord<T>(
  client: SupabaseClient,
  table: string,
  record: T,
  conflictColumns: string[]
): Promise<T> {
  const { data, error } = await client
    .from(table)
    .upsert(record, { 
      onConflict: conflictColumns.join(','),
      ignoreDuplicates: false 
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as T;
}

/**
 * Bulk insert/update helper
 * More efficient than individual operations
 */
export async function bulkUpsert<T>(
  client: SupabaseClient,
  table: string,
  records: T[],
  conflictColumns: string[]
): Promise<T[]> {
  if (records.length === 0) return [];
  
  const { data, error } = await client
    .from(table)
    .upsert(records, { 
      onConflict: conflictColumns.join(','),
      ignoreDuplicates: false 
    })
    .select();
  
  if (error) throw error;
  return data as T[];
}

/**
 * Cached query helper
 * Implements simple in-memory caching for static data
 */
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttlMs = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  
  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: now });
  
  // Clean up old entries
  if (queryCache.size > 100) {
    const oldestKeys = Array.from(queryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 20)
      .map(([key]) => key);
    
    oldestKeys.forEach(key => queryCache.delete(key));
  }
  
  return data;
}

/**
 * Query performance monitoring
 * Log slow queries in development
 */
export async function monitoredQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  warnThresholdMs = 1000
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    
    if (duration > warnThresholdMs) {
      console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(0)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Query failed: ${queryName} after ${duration.toFixed(0)}ms`, error);
    throw error;
  }
}
