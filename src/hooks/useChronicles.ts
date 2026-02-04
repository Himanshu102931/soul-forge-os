import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfDay } from 'date-fns';
import { HabitStatus, getNextHabitStatus } from '@/lib/rpg-utils';
<<<<<<< HEAD
=======
import { queryKeys, STALE_TIMES } from '@/lib/query-config';
>>>>>>> cf46c6e (Initial commit: project files)

export interface DaySummary {
  id: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  notes: string | null;
  xp_earned: number;
  hp_lost: number;
  ai_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitLogEntry {
  id: string;
  habit_id: string;
  date: string;
  status: HabitStatus;
}

export interface CompletedTask {
  id: string;
  title: string;
  completed_at: string;
}

// Fetch all daily summaries for calendar view
export function useAllDailySummaries() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['all-daily-summaries', user?.id],
=======
    queryKey: user ? queryKeys.allDailySummaries(user.id) : ['all-daily-summaries'],
    staleTime: STALE_TIMES.chronicles,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as DaySummary[];
    },
    enabled: !!user,
  });
}

// Fetch summary for a specific date
export function useDaySummary(date: string) {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['day-summary', user?.id, date],
=======
    queryKey: user ? queryKeys.daySummary(user.id, date) : ['day-summary'],
    staleTime: STALE_TIMES.chronicles,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();
      
      if (error) throw error;
      return data as DaySummary | null;
    },
    enabled: !!user && !!date,
  });
}

// Fetch habit logs for a specific date
export function useDayHabitLogs(date: string) {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['day-habit-logs', user?.id, date],
=======
    queryKey: user ? queryKeys.dayHabitLogs(user.id, date) : ['day-habit-logs'],
    staleTime: STALE_TIMES.chronicles,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // First get all user's habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('archived', false);
      
      if (habitsError) throw habitsError;
      
      if (!habits?.length) return [];
      
      // Then get logs for those habits on the specific date
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', habits.map(h => h.id))
        .eq('date', date);
      
      if (logsError) throw logsError;
      return logs as HabitLogEntry[];
    },
    enabled: !!user && !!date,
  });
}

// Fetch metrics for a specific date
export function useDayMetrics(date: string) {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['day-metrics', user?.id, date],
=======
    queryKey: user ? queryKeys.dayMetrics(user.id, date) : ['day-metrics'],
    staleTime: STALE_TIMES.chronicles,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('metric_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date);
      
      if (error) throw error;
      
      const metrics: Record<string, number> = {};
      data?.forEach(m => {
        metrics[m.metric_id] = m.value;
      });
      
      return metrics;
    },
    enabled: !!user && !!date,
  });
}

// Fetch completed tasks for a specific date (IGNORES archived flag for history)
export function useDayCompletedTasks(date: string) {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['day-completed-tasks', user?.id, date],
=======
    queryKey: user ? queryKeys.dayCompletedTasks(user.id, date) : ['day-completed-tasks'],
    staleTime: STALE_TIMES.chronicles,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Get tasks where completed_at falls on the selected date
      // CRITICAL: We DO NOT filter by archived here - completed tasks remain in history
      const startOfDate = new Date(date);
      const endOfDate = new Date(date);
      endOfDate.setDate(endOfDate.getDate() + 1);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, completed_at, archived')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('completed_at', startOfDate.toISOString())
        .lt('completed_at', endOfDate.toISOString());
      
      if (error) throw error;
      return (data || []) as (CompletedTask & { archived?: boolean })[];
    },
    enabled: !!user && !!date,
  });
}

// Update day notes
export function useUpdateDayNotes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, notes }: { date: string; notes: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: user.id,
          date,
          notes,
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { date }) => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['day-summary', user?.id, date] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.daySummary(user.id, date) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
    },
  });
}

<<<<<<< HEAD
// Update day mood
export function useUpdateDayMood() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, moodScore }: { date: string; moodScore: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: user.id,
          date,
          mood_score: moodScore,
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['day-summary', user?.id, date] });
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
    },
  });
}

// Toggle habit log for past date (retroactive editing) - FULL CYCLE with optimistic updates
=======
// Toggle habit log for past date (retroactive editing) - FULL CYCLE
>>>>>>> cf46c6e (Initial commit: project files)
export function useToggleHistoricalHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      habitId, 
      date, 
      currentStatus,
      isBadHabit = false,
<<<<<<< HEAD
      xpReward = 10,
=======
>>>>>>> cf46c6e (Initial commit: project files)
    }: { 
      habitId: string; 
      date: string; 
      currentStatus: HabitStatus;
      isBadHabit?: boolean;
<<<<<<< HEAD
      xpReward?: number;
=======
>>>>>>> cf46c6e (Initial commit: project files)
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Get next status using the RPG utility
      const nextStatus = getNextHabitStatus(currentStatus, isBadHabit);
      
<<<<<<< HEAD
      // Calculate XP delta based on actual xpReward and transition
      let xpDelta = 0;
      if (!isBadHabit) {
        // Regular habit XP transitions
        if (currentStatus === null && nextStatus === 'completed') xpDelta = xpReward;
        else if (currentStatus === 'completed' && nextStatus === 'partial') xpDelta = Math.floor(xpReward / 2) - xpReward; // full -> half
        else if (currentStatus === 'partial' && nextStatus === 'skipped') xpDelta = -Math.floor(xpReward / 2); // half -> 0
        else if (currentStatus === 'skipped' && nextStatus === null) xpDelta = 0;
        else if (currentStatus === null && nextStatus === 'partial') xpDelta = Math.floor(xpReward / 2);
        else if (currentStatus === 'partial' && nextStatus === 'completed') xpDelta = xpReward - Math.floor(xpReward / 2);
      } else {
        // Bad habit XP transitions
        if (currentStatus === null && nextStatus === 'completed') xpDelta = xpReward;
        else if (currentStatus === 'completed' && nextStatus === null) xpDelta = -xpReward;
=======
      // Calculate XP delta based on transition
      let xpDelta = 0;
      if (!isBadHabit) {
        // Regular habit XP transitions
        if (currentStatus === null && nextStatus === 'completed') xpDelta = 10;
        else if (currentStatus === 'completed' && nextStatus === 'partial') xpDelta = -5; // 10 -> 5
        else if (currentStatus === 'partial' && nextStatus === 'skipped') xpDelta = -5; // 5 -> 0
        else if (currentStatus === 'skipped' && nextStatus === null) xpDelta = 0;
      } else {
        // Bad habit XP transitions
        if (currentStatus === null && nextStatus === 'completed') xpDelta = 10;
        else if (currentStatus === 'completed' && nextStatus === null) xpDelta = -10;
>>>>>>> cf46c6e (Initial commit: project files)
      }
      
      if (nextStatus === null) {
        // Delete the log
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', date);
        
        if (error) throw error;
      } else {
        // Upsert with new status
        const { error } = await supabase
          .from('habit_logs')
          .upsert({
            habit_id: habitId,
            date,
            status: nextStatus,
          }, {
            onConflict: 'habit_id,date',
          });
        
        if (error) throw error;
      }
      
<<<<<<< HEAD
      return { habitId, date, newStatus: nextStatus, xpDelta };
    },
    onMutate: async ({ habitId, date, currentStatus, isBadHabit, xpReward = 10 }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['day-habit-logs', user?.id, date] });
      
      // Snapshot previous value
      const previousLogs = queryClient.getQueryData(['day-habit-logs', user?.id, date]);
      
      // Calculate next status
      const nextStatus = getNextHabitStatus(currentStatus, isBadHabit ?? false);
      
      // Optimistically update the habit logs
      queryClient.setQueryData(['day-habit-logs', user?.id, date], (old: any) => {
        if (!old) return old;
        
        const existingLog = old.find((log: any) => log.habit_id === habitId);
        
        if (nextStatus === null) {
          // Remove the log
          return old.filter((log: any) => log.habit_id !== habitId);
        } else if (existingLog) {
          // Update existing log
          return old.map((log: any) => 
            log.habit_id === habitId 
              ? { ...log, status: nextStatus }
              : log
          );
        } else {
          // Add new log
          return [...old, { habit_id: habitId, date, status: nextStatus }];
        }
      });
      
      return { previousLogs };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLogs) {
        queryClient.setQueryData(['day-habit-logs', user?.id, variables.date], context.previousLogs);
      }
    },
    onSuccess: async (result, { date }) => {
      // Update profile XP in background (no await to not block UI)
      if (user && result.xpDelta !== 0) {
        supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const newXP = Math.max(0, profile.xp + result.xpDelta);
              return supabase
                .from('profiles')
                .update({ xp: newXP })
                .eq('id', user.id);
            }
          });
      }
      
      // DO NOT invalidate day-habit-logs - trust optimistic update
      // Only invalidate analytics queries (they're not optimistically updated)
      queryClient.invalidateQueries({ queryKey: ['xp-velocity'] });
      queryClient.invalidateQueries({ queryKey: ['habit-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
=======
      return { newStatus: nextStatus, xpDelta };
    },
    onSuccess: async (result, { date }) => {
      // Update profile XP
      if (user && result.xpDelta !== 0) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const newXP = Math.max(0, profile.xp + result.xpDelta);
          await supabase
            .from('profiles')
            .update({ xp: newXP })
            .eq('id', user.id);
        }
      }
      
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dayHabitLogs(user.id, date) });
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      }
      // Invalidate XP Velocity and Habit Mastery so graphs update instantly
      queryClient.invalidateQueries({ queryKey: ['xp-velocity'] });
      queryClient.invalidateQueries({ queryKey: ['habit-mastery'] });
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
>>>>>>> cf46c6e (Initial commit: project files)
    },
  });
}

// Update AI response for a date
export function useUpdateAIResponse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, ai_response }: { date: string; ai_response: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
          user_id: user.id,
          date,
          ai_response,
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { date }) => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['day-summary', user?.id, date] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.daySummary(user.id, date) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
    },
  });
}

// Get XP data for the last 30 days
export function useXPVelocity() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['xp-velocity', user?.id],
=======
    queryKey: user ? queryKeys.xpVelocity(user.id) : ['xp-velocity'],
    staleTime: STALE_TIMES.analytics,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('date, xp_earned')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Get vitals (sleep/steps) for the last 30 days
export function useVitalsHistory() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['vitals-history', user?.id],
=======
    queryKey: user ? queryKeys.vitalsHistory(user.id) : ['vitals-history'],
    staleTime: STALE_TIMES.analytics,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('metric_logs')
        .select('date, metric_id, value')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Group by date
      const grouped: Record<string, { sleep?: number; steps?: number }> = {};
      data?.forEach(m => {
        if (!grouped[m.date]) grouped[m.date] = {};
        grouped[m.date][m.metric_id as 'sleep' | 'steps'] = m.value;
      });
      
      return Object.entries(grouped).map(([date, metrics]) => ({
        date,
        sleep: metrics.sleep || 0,
        steps: metrics.steps || 0,
      }));
    },
    enabled: !!user,
  });
}

// Get habit mastery levels (total completions per habit) - with FAIR XP scaling
export function useHabitMastery() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['habit-mastery', user?.id],
=======
    queryKey: user ? queryKeys.habitMastery(user.id) : ['habit-mastery'],
    staleTime: STALE_TIMES.analytics,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Get all habits with frequency_days
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id, title, frequency_days')
        .eq('user_id', user.id)
        .eq('archived', false);
      
      if (habitsError) throw habitsError;
      if (!habits?.length) return [];
      
      // Get all logs for these habits (both completed and partial)
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('habit_id, status')
        .in('habit_id', habits.map(h => h.id))
        .in('status', ['completed', 'partial']);
      
      if (logsError) throw logsError;
      
      // Count completions and partials per habit
      const completionCounts: Record<string, number> = {};
      const partialCounts: Record<string, number> = {};
      logs?.forEach(log => {
        if (log.status === 'completed') {
          completionCounts[log.habit_id] = (completionCounts[log.habit_id] || 0) + 1;
        } else if (log.status === 'partial') {
          partialCounts[log.habit_id] = (partialCounts[log.habit_id] || 0) + 1;
        }
      });
      
      // Fair mastery XP calculation:
      // Weekly habit (1 day): 100 XP per completion
      // Daily habit (7 days): ~15 XP per completion
      // 100 XP = 1 Level
      const XP_PER_LEVEL = 100;
      
      return habits.map(habit => {
        const totalCompletions = completionCounts[habit.id] || 0;
        const totalPartials = partialCounts[habit.id] || 0;
        const frequencyDaysCount = habit.frequency_days?.length || 7;
        
        // XP per completion = 100 / frequency (weekly = 100, daily = ~14)
        const xpPerComplete = Math.round(100 / frequencyDaysCount);
        const xpPerPartial = Math.round(xpPerComplete * 0.5);
        
        const totalXP = (totalCompletions * xpPerComplete) + (totalPartials * xpPerPartial);
        const level = Math.floor(totalXP / XP_PER_LEVEL);
        const currentXP = totalXP % XP_PER_LEVEL;
        const progressPercent = (currentXP / XP_PER_LEVEL) * 100;
        
        return {
          id: habit.id,
          title: habit.title,
          level,
          currentXP,
          progressPercent,
        };
      });
    },
    enabled: !!user,
  });
}

// Update metric for a specific date (for editable vitals in Time Machine)
export function useUpdateMetric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ date, metricId, value }: { date: string; metricId: string; value: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('metric_logs')
        .upsert({
          user_id: user.id,
          date,
          metric_id: metricId,
          value,
        }, {
          onConflict: 'user_id,date,metric_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { date }) => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['day-metrics', user?.id, date] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dayMetrics(user.id, date) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['vitals-history'] });
    },
  });
}
