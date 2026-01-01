// Analytics hooks for fetching and calculating stats
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, HabitLog } from '@/hooks/useHabits';
import { 
  calculateHabitStats, 
  generateDateRange, 
  generateHeatmapData,
  getUnlockedMilestones,
  HabitStats,
  HeatmapDay 
} from '@/lib/analytics-utils';

// Fetch all habit logs for analytics
export function useAllHabitLogs(days: number = 90) {
  const { user } = useAuth();
  const { data: habits } = useHabits();
  
  return useQuery({
    queryKey: ['all-habit-logs', user?.id, habits?.length, days],
    enabled: !!user && !!habits,
    queryFn: async () => {
      if (!user || !habits) return [];
      
      const habitIds = habits.map(h => h.id);
      if (habitIds.length === 0) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      type LogRow = { id: string; habit_id: string; date: string; status: string };
      const { data, error } = await supabase
        .from('habit_logs')
        .select('id, habit_id, date, status')
        .in('habit_id', habitIds)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return (data as LogRow[]) as HabitLog[];
    },
  });
}

// Calculate comprehensive stats for all habits
export function useHabitStatistics(days: number = 30) {
  const { data: habits } = useHabits();
  const { data: logs } = useAllHabitLogs(days);
  
  return useQuery({
    queryKey: ['habit-statistics', habits?.length, logs?.length, days],
    queryFn: async () => {
      if (!habits || !logs) return [];
      
      const dateRange = generateDateRange(days);
      
      const stats: HabitStats[] = habits.map(habit => {
        const habitLogs = logs.filter(log => log.habit_id === habit.id);
        return calculateHabitStats(habit.id, habit.title, habitLogs, dateRange);
      });
      
      return stats.sort((a, b) => b.completionRate - a.completionRate);
    },
    enabled: !!habits && !!logs,
  });
}

// Get overall analytics summary
export function useAnalyticsSummary(days: number = 30) {
  const { data: habits } = useHabits();
  const { data: logs } = useAllHabitLogs(days);
  const { data: stats } = useHabitStatistics(days);
  
  return useQuery({
    queryKey: ['analytics-summary', habits?.length, logs?.length, days],
    queryFn: async () => {
      if (!habits || !logs || !stats) return null;
      
      const totalHabits = habits.length;
      const totalCompletions = logs.filter(log => log.status === 'completed').length;
      const totalAttempts = logs.length;
      const overallCompletionRate = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0;
      
      // Find best streak across all habits
      const bestStreak = Math.max(...stats.map(s => s.streak.currentStreak), 0);
      const longestEverStreak = Math.max(...stats.map(s => s.streak.longestStreak), 0);
      
      // Calculate milestones
      const milestones = getUnlockedMilestones(longestEverStreak, totalCompletions);
      
      return {
        totalHabits,
        totalCompletions,
        totalAttempts,
        overallCompletionRate,
        bestCurrentStreak: bestStreak,
        longestEverStreak,
        milestones,
        topPerformers: stats.slice(0, 3),
        strugglingHabits: stats.slice(-3).reverse(),
      };
    },
    enabled: !!habits && !!logs && !!stats,
  });
}

// Get heatmap data for visualization
export function useCompletionHeatmap(days: number = 90) {
  const { data: habits } = useHabits();
  const { data: logs } = useAllHabitLogs(days);
  
  return useQuery({
    queryKey: ['completion-heatmap', habits?.length, logs?.length, days],
    queryFn: async () => {
      if (!habits || !logs) return [];
      
      const dateRange = generateDateRange(days);
      return generateHeatmapData(logs, dateRange, habits.length);
    },
    enabled: !!habits && !!logs,
  });
}

// Get trend data for charts
export interface TrendDataPoint {
  date: string;
  completionRate: number;
  completed: number;
  total: number;
  xp: number;
}

export function useCompletionTrend(days: number = 30) {
  const { data: logs } = useAllHabitLogs(days);
  
  return useQuery({
    queryKey: ['completion-trend', logs?.length, days],
    queryFn: async () => {
      if (!logs) return [];
      
      const dateRange = generateDateRange(days);
      const trendData: TrendDataPoint[] = [];
      
      dateRange.forEach(date => {
        const dayLogs = logs.filter(log => log.date === date);
        const completed = dayLogs.filter(log => log.status === 'completed').length;
        const total = dayLogs.length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;
        
        // Estimate XP (would need actual data from summaries)
        const xp = completed * 10; // Rough estimate
        
        trendData.push({
          date,
          completionRate,
          completed,
          total,
          xp,
        });
      });
      
      return trendData;
    },
    enabled: !!logs,
  });
}

// ============================================================
// PAGINATION AND OPTIMIZATION UTILITIES
// ============================================================

/**
 * Fetch habit logs with pagination support for large datasets
 * Reduces memory usage and improves query performance
 */
export function useHabitLogsPaginated(
  habitId: string,
  page: number = 0,
  pageSize: number = 100,
  days: number = 90
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['habit-logs-paginated', habitId, user?.id, page, pageSize, days],
    enabled: !!user && !!habitId,
    queryFn: async () => {
      if (!user) return { data: [], total: 0, page, pageSize };

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const offset = page * pageSize;

      type LogRow = { id: string; habit_id: string; date: string; status: string };
      const { data, error, count } = await supabase
        .from('habit_logs')
        .select('id, habit_id, date, status', { count: 'exact' })
        .eq('habit_id', habitId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      return {
        data: (data as LogRow[]) as HabitLog[],
        total: count || 0,
        page,
        pageSize,
      };
    },
  });
}

/**
 * Optimized fetch for completed habits only
 * Reduces dataset size for completion-focused queries
 */
export function useCompletedHabitLogs(days: number = 30) {
  const { user } = useAuth();
  const { data: habits } = useHabits();

  return useQuery({
    queryKey: ['completed-habit-logs', user?.id, habits?.length, days],
    enabled: !!user && !!habits,
    queryFn: async () => {
      if (!user || !habits) return [];

      const habitIds = habits.map(h => h.id);
      if (habitIds.length === 0) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      type LogRow = { id: string; habit_id: string; date: string; status: string };
      const { data, error } = await supabase
        .from('habit_logs')
        .select('id, habit_id, date, status')
        .in('habit_id', habitIds)
        .eq('status', 'completed')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return (data as LogRow[]) as HabitLog[];
    },
  });
}

