import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { isHabitDueToday } from '@/lib/time-utils';
import { HabitStatus } from '@/lib/rpg-utils';
<<<<<<< HEAD
import { queryKeys, staleTimes } from '@/lib/query-config';

// Debounced refetch to prevent XP jitter from rapid toggles
// Reduced from 500ms to 200ms for better responsiveness
=======
import { queryKeys, STALE_TIMES } from '@/lib/query-config';

// Debounced refetch to prevent XP jitter from rapid toggles
>>>>>>> cf46c6e (Initial commit: project files)
let refetchTimeout: ReturnType<typeof setTimeout> | null = null;
const debounceRefetch = (queryClient: QueryClient) => {
  if (refetchTimeout) clearTimeout(refetchTimeout);
  refetchTimeout = setTimeout(() => {
<<<<<<< HEAD
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    refetchTimeout = null;
  }, 200);
};

=======
    // Invalidate all habits queries (partial match)
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    // Invalidate all profile queries (partial match)
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    refetchTimeout = null;
  }, 500);
};

export type HabitCategory = 'health' | 'productivity' | 'social' | 'learning' | 'wellness' | 'other';

>>>>>>> cf46c6e (Initial commit: project files)
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  frequency_days: number[];
  sort_order: number;
  archived: boolean;
  is_bad_habit: boolean;
  xp_reward: number;
<<<<<<< HEAD
=======
  category: HabitCategory;
>>>>>>> cf46c6e (Initial commit: project files)
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  status: HabitStatus;
}

export interface HabitWithLog extends Habit {
  todayLog: HabitLog | null;
}

export function useHabits() {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useQuery({
<<<<<<< HEAD
    queryKey: queryKeys.habits(user?.id || '', logicalDate),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Fetch habits
=======
    queryKey: user ? queryKeys.habits(user.id, logicalDate) : ['habits'],
    staleTime: STALE_TIMES.habits,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Fetch habits (exclude archived)
>>>>>>> cf46c6e (Initial commit: project files)
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('sort_order', { ascending: true });
      
      if (habitsError) throw habitsError;
      
<<<<<<< HEAD
      // Fetch today's logs
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', (habits as Habit[]).map(h => h.id))
        .eq('date', logicalDate);
      
      if (logsError) throw logsError;
=======
      // Fetch today's logs (only if we have habits)
      let logs: HabitLog[] = [];
      if (habits && habits.length > 0) {
        const { data: logsData, error: logsError } = await supabase
          .from('habit_logs')
          .select('*')
          .in('habit_id', (habits as Habit[]).map(h => h.id))
          .eq('date', logicalDate);
        
        if (logsError) throw logsError;
        logs = logsData as HabitLog[];
      }
>>>>>>> cf46c6e (Initial commit: project files)
      
      // Combine habits with their logs
      const habitsWithLogs: HabitWithLog[] = (habits as Habit[]).map(habit => ({
        ...habit,
<<<<<<< HEAD
        todayLog: (logs as HabitLog[]).find(l => l.habit_id === habit.id) || null,
=======
        todayLog: logs.find(l => l.habit_id === habit.id) || null,
>>>>>>> cf46c6e (Initial commit: project files)
      }));
      
      return habitsWithLogs;
    },
    enabled: !!user,
<<<<<<< HEAD
    staleTime: staleTimes.realtime, // 30s - habits change frequently during the day
=======
>>>>>>> cf46c6e (Initial commit: project files)
  });
}

export function useTodayHabits() {
  const { data: habits, ...rest } = useHabits();
<<<<<<< HEAD
  
  const todayHabits = habits?.filter(h => 
    !h.is_bad_habit && isHabitDueToday(h.frequency_days)
=======
  const { logicalDate } = useLogicalDate();
  
  // Parse logicalDate string to Date object for filtering
  const logicalDateObj = new Date(logicalDate + 'T00:00:00');
  
  const todayHabits = habits?.filter(h => 
    !h.is_bad_habit && isHabitDueToday(h.frequency_days, logicalDateObj)
>>>>>>> cf46c6e (Initial commit: project files)
  ) || [];
  
  const badHabits = habits?.filter(h => h.is_bad_habit) || [];
  
  return { 
    todayHabits, 
    badHabits, 
    allHabits: habits || [],
    ...rest 
  };
}

export function useUpdateHabitLog() {
  const queryClient = useQueryClient();
  const { logicalDate } = useLogicalDate();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      habitId, 
      status 
    }: { 
      habitId: string; 
      status: HabitStatus;
    }) => {
      if (status === null) {
        // Delete the log
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', logicalDate);
        
        if (error) throw error;
        return null;
      }
      
      // Upsert the log
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert({
          habit_id: habitId,
          date: logicalDate,
          status,
        }, {
          onConflict: 'habit_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ habitId, status }) => {
      // Cancel outgoing refetches
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      
      // Snapshot previous data
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      
      // Optimistically update the cache
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
      }
      
      // Snapshot previous data
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      
      // Optimistically update the cache
      if (previousHabits && user) {
        queryClient.setQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousHabits.map(habit => {
            if (habit.id === habitId) {
              return {
                ...habit,
                todayLog: status === null 
                  ? null 
                  : { 
                      id: habit.todayLog?.id || 'temp-id', 
                      habit_id: habitId, 
                      date: logicalDate, 
                      status 
                    }
              };
            }
            return habit;
          })
        );
      }
      
      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
>>>>>>> cf46c6e (Initial commit: project files)
      }
    },
    onSettled: () => {
      // Debounce refetch to prevent jitter from rapid toggles
      debounceRefetch(queryClient);
    },
  });
}

export function useUpdateHabitOrder() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async (habits: { id: string; sort_order: number }[]) => {
      const updates = habits.map(({ id, sort_order }) =>
        supabase
          .from('habits')
          .update({ sort_order })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onMutate: async (newOrder) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      
      // Optimistically reorder
      if (previousHabits) {
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
      }
      
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      
      // Optimistically reorder
      if (previousHabits && user) {
>>>>>>> cf46c6e (Initial commit: project files)
        const orderMap = new Map(newOrder.map(h => [h.id, h.sort_order]));
        const reorderedHabits = [...previousHabits].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? a.sort_order;
          const orderB = orderMap.get(b.id) ?? b.sort_order;
          return orderA - orderB;
        });
<<<<<<< HEAD
        queryClient.setQueryData(['habits', user?.id, logicalDate], reorderedHabits);
=======
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), reorderedHabits);
>>>>>>> cf46c6e (Initial commit: project files)
      }
      
      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
    },
    onSettled: () => {
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
      }
    },
    onSettled: () => {
      // Invalidate all habits queries
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('habits')
        .insert({
          title: habit.title,
          description: habit.description,
          frequency_days: habit.frequency_days,
          sort_order: habit.sort_order,
          archived: habit.archived,
          is_bad_habit: habit.is_bad_habit,
          xp_reward: habit.xp_reward,
<<<<<<< HEAD
=======
          category: habit.category,
>>>>>>> cf46c6e (Initial commit: project files)
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newHabit) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
        await queryClient.cancelQueries({ queryKey: queryKeys.allHabits(user.id) });
      }
      
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      const previousAllHabits = user ? queryClient.getQueryData<Habit[]>(queryKeys.allHabits(user.id)) : undefined;
>>>>>>> cf46c6e (Initial commit: project files)
      
      // Optimistically add to cache
      const optimisticHabit: HabitWithLog = {
        ...newHabit,
        id: 'temp-' + Date.now(),
        user_id: user?.id || '',
<<<<<<< HEAD
=======
        category: newHabit.category || 'other',
>>>>>>> cf46c6e (Initial commit: project files)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        todayLog: null,
      };
      
<<<<<<< HEAD
      if (previousHabits && !newHabit.archived) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], [...previousHabits, optimisticHabit]);
      }
      
      if (previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], [...previousAllHabits, optimisticHabit]);
=======
      if (previousHabits && !newHabit.archived && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), [...previousHabits, optimisticHabit]);
      }
      
      if (previousAllHabits && user) {
        queryClient.setQueryData(queryKeys.allHabits(user.id), [...previousAllHabits, optimisticHabit]);
>>>>>>> cf46c6e (Initial commit: project files)
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
      }
      if (context?.previousAllHabits && user) {
        queryClient.setQueryData(queryKeys.allHabits(user.id), context.previousAllHabits);
      }
    },
    onSettled: () => {
      // Invalidate all habits queries
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}

export function useAllHabits() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['all-habits', user?.id],
=======
    queryKey: user ? queryKeys.allHabits(user.id) : ['all-habits'],
    staleTime: STALE_TIMES.habits,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically update habits cache
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
        await queryClient.cancelQueries({ queryKey: queryKeys.allHabits(user.id) });
      }
      
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      const previousAllHabits = user ? queryClient.getQueryData<Habit[]>(queryKeys.allHabits(user.id)) : undefined;
      
      // Optimistically update habits cache
      if (previousHabits && user) {
        queryClient.setQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousHabits.map(habit => 
            habit.id === id ? { ...habit, ...updates } : habit
          )
        );
      }
      
      // Optimistically update all-habits cache
<<<<<<< HEAD
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
=======
      if (previousAllHabits && user) {
        queryClient.setQueryData<Habit[]>(queryKeys.allHabits(user.id), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousAllHabits.map(habit => 
            habit.id === id ? { ...habit, ...updates } : habit
          )
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
      }
      if (context?.previousAllHabits && user) {
        queryClient.setQueryData(queryKeys.allHabits(user.id), context.previousAllHabits);
      }
    },
    onSettled: () => {
      // Invalidate all habits queries
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}

export function useArchiveHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('habits')
        .update({ archived })
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, archived }) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically update habits cache
      if (previousHabits) {
        if (archived) {
          // Archiving: Remove from active habits
          queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
        await queryClient.cancelQueries({ queryKey: queryKeys.allHabits(user.id) });
      }
      
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      const previousAllHabits = user ? queryClient.getQueryData<Habit[]>(queryKeys.allHabits(user.id)) : undefined;
      
      // Optimistically update habits cache
      if (previousHabits && user) {
        if (archived) {
          // Archiving: Remove from active habits
          queryClient.setQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate), 
>>>>>>> cf46c6e (Initial commit: project files)
            previousHabits.filter(habit => habit.id !== id)
          );
        } else {
          // Restoring: Add back to active habits (find from all-habits)
          const habitToRestore = previousAllHabits?.find(h => h.id === id);
          if (habitToRestore) {
            const restoredHabit: HabitWithLog = { ...habitToRestore, archived: false, todayLog: null };
<<<<<<< HEAD
            queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
=======
            queryClient.setQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate), 
>>>>>>> cf46c6e (Initial commit: project files)
              [...previousHabits, restoredHabit]
            );
          }
        }
      }
      
      // Optimistically update all-habits cache
<<<<<<< HEAD
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
=======
      if (previousAllHabits && user) {
        queryClient.setQueryData<Habit[]>(queryKeys.allHabits(user.id), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousAllHabits.map(habit => 
            habit.id === id ? { ...habit, archived } : habit
          )
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
      }
      if (context?.previousAllHabits && user) {
        queryClient.setQueryData(queryKeys.allHabits(user.id), context.previousAllHabits);
      }
    },
    onSettled: () => {
      // Invalidate all habits queries
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete habit (cascading delete will handle logs due to foreign key)
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async (id) => {
<<<<<<< HEAD
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically remove from caches
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
=======
      if (user) {
        await queryClient.cancelQueries({ queryKey: queryKeys.habits(user.id, logicalDate) });
        await queryClient.cancelQueries({ queryKey: queryKeys.allHabits(user.id) });
      }
      
      const previousHabits = user ? queryClient.getQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate)) : undefined;
      const previousAllHabits = user ? queryClient.getQueryData<Habit[]>(queryKeys.allHabits(user.id)) : undefined;
      
      // Optimistically remove from caches
      if (previousHabits && user) {
        queryClient.setQueryData<HabitWithLog[]>(queryKeys.habits(user.id, logicalDate), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousHabits.filter(habit => habit.id !== id)
        );
      }
      
<<<<<<< HEAD
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
=======
      if (previousAllHabits && user) {
        queryClient.setQueryData<Habit[]>(queryKeys.allHabits(user.id), 
>>>>>>> cf46c6e (Initial commit: project files)
          previousAllHabits.filter(habit => habit.id !== id)
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
<<<<<<< HEAD
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
=======
      if (context?.previousHabits && user) {
        queryClient.setQueryData(queryKeys.habits(user.id, logicalDate), context.previousHabits);
      }
      if (context?.previousAllHabits && user) {
        queryClient.setQueryData(queryKeys.allHabits(user.id), context.previousAllHabits);
      }
    },
    onSettled: () => {
      // Invalidate all habits queries
>>>>>>> cf46c6e (Initial commit: project files)
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}
<<<<<<< HEAD
=======

// Fetch mastery stats for a specific habit
export function useHabitMastery(habitId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user ? queryKeys.habitMastery(habitId) : ['habit-mastery'],
    staleTime: STALE_TIMES.habits,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Count completions from habit_logs
      const { data, error } = await supabase
        .from('habit_logs')
        .select('status')
        .eq('habit_id', habitId);
      
      if (error) throw error;
      
      const completions = data.filter(log => log.status === 'completed').length;
      const partials = data.filter(log => log.status === 'partial').length;
      
      return {
        totalCompletions: completions,
        partialCompletions: partials,
      };
    },
    enabled: !!user && !!habitId,
  });
}

// Calculate current streak for a habit
export function useHabitStreak(habitId: string) {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useQuery({
    queryKey: user ? [...queryKeys.habitMastery(habitId), 'streak', logicalDate] : ['habit-streak'],
    staleTime: STALE_TIMES.habits,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Fetch habit to get frequency
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('frequency_days')
        .eq('id', habitId)
        .single();
      
      if (habitError) throw habitError;
      
      // Fetch all logs sorted by date descending
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('date, status')
        .eq('habit_id', habitId)
        .order('date', { ascending: false });
      
      if (logsError) throw logsError;
      
      // Calculate streak (count consecutive days where habit was due AND completed)
      let currentStreak = 0;
      let checkDate = new Date(logicalDate);
      
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayOfWeek = checkDate.getDay();
        
        // Check if habit was due on this day
        const wasDue = habit.frequency_days.includes(dayOfWeek);
        
        if (!wasDue) {
          // Skip days when habit wasn't due
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        
        // Find log for this date
        const log = logs.find(l => l.date === dateStr);
        
        if (log && log.status === 'completed') {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break; // Streak broken
        }
        
        // Safety limit: don't check more than 365 days back
        if (currentStreak > 365) break;
      }
      
      return currentStreak;
    },
    enabled: !!user && !!habitId,
  });
}
>>>>>>> cf46c6e (Initial commit: project files)
