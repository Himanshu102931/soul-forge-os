import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { isHabitDueToday } from '@/lib/time-utils';
import { HabitStatus } from '@/lib/rpg-utils';
import { queryKeys, staleTimes } from '@/lib/query-config';

// Debounced refetch to prevent XP jitter from rapid toggles
// Reduced from 500ms to 200ms for better responsiveness
let refetchTimeout: ReturnType<typeof setTimeout> | null = null;
const debounceRefetch = (queryClient: QueryClient) => {
  if (refetchTimeout) clearTimeout(refetchTimeout);
  refetchTimeout = setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    refetchTimeout = null;
  }, 200);
};

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
    queryKey: queryKeys.habits(user?.id || '', logicalDate),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Fetch habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('sort_order', { ascending: true });
      
      if (habitsError) throw habitsError;
      
      // Fetch today's logs
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .in('habit_id', (habits as Habit[]).map(h => h.id))
        .eq('date', logicalDate);
      
      if (logsError) throw logsError;
      
      // Combine habits with their logs
      const habitsWithLogs: HabitWithLog[] = (habits as Habit[]).map(habit => ({
        ...habit,
        todayLog: (logs as HabitLog[]).find(l => l.habit_id === habit.id) || null,
      }));
      
      return habitsWithLogs;
    },
    enabled: !!user,
    staleTime: staleTimes.realtime, // 30s - habits change frequently during the day
  });
}

export function useTodayHabits() {
  const { data: habits, ...rest } = useHabits();
  
  const todayHabits = habits?.filter(h => 
    !h.is_bad_habit && isHabitDueToday(h.frequency_days)
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
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      
      // Snapshot previous data
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      
      // Optimistically update the cache
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
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
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
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
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      
      // Optimistically reorder
      if (previousHabits) {
        const orderMap = new Map(newOrder.map(h => [h.id, h.sort_order]));
        const reorderedHabits = [...previousHabits].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? a.sort_order;
          const orderB = orderMap.get(b.id) ?? b.sort_order;
          return orderA - orderB;
        });
        queryClient.setQueryData(['habits', user?.id, logicalDate], reorderedHabits);
      }
      
      return { previousHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
    },
    onSettled: () => {
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
      
      // Log attempt for debugging
      console.log('[Habit Creation] Attempting to create:', {
        title: habit.title,
        userId: user.id,
        xpReward: habit.xp_reward,
        timestamp: new Date().toISOString(),
      });
      
      const insertData: any = {
        title: habit.title,
        description: habit.description,
        frequency_days: habit.frequency_days,
        sort_order: habit.sort_order,
        archived: habit.archived,
        is_bad_habit: habit.is_bad_habit,
        user_id: user.id,
      };
      
      // Only add xp_reward if it exists in the habit object
      // This prevents schema cache issues
      if (habit.xp_reward !== undefined && habit.xp_reward !== null) {
        insertData.xp_reward = habit.xp_reward;
      }
      
      const { data, error } = await supabase
        .from('habits')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('[Habit Creation] Failed with error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId: user.id,
          habitTitle: habit.title,
          xpReward: habit.xp_reward,
        });
        throw new Error(error.message || 'Failed to create habit');
      }
      
      console.log('[Habit Creation] Success:', data.id);
      return data;
    },
    onMutate: async (newHabit) => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically add to cache
      const optimisticHabit: HabitWithLog = {
        ...newHabit,
        id: 'temp-' + Date.now(),
        user_id: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        todayLog: null,
      };
      
      if (previousHabits && !newHabit.archived) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], [...previousHabits, optimisticHabit]);
      }
      
      if (previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], [...previousAllHabits, optimisticHabit]);
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}

export function useAllHabits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-habits', user?.id],
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
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically update habits cache
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
          previousHabits.map(habit => 
            habit.id === id ? { ...habit, ...updates } : habit
          )
        );
      }
      
      // Optimistically update all-habits cache
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
          previousAllHabits.map(habit => 
            habit.id === id ? { ...habit, ...updates } : habit
          )
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
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
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically update habits cache
      if (previousHabits) {
        if (archived) {
          // Archiving: Remove from active habits
          queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
            previousHabits.filter(habit => habit.id !== id)
          );
        } else {
          // Restoring: Add back to active habits (find from all-habits)
          const habitToRestore = previousAllHabits?.find(h => h.id === id);
          if (habitToRestore) {
            const restoredHabit: HabitWithLog = { ...habitToRestore, archived: false, todayLog: null };
            queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
              [...previousHabits, restoredHabit]
            );
          }
        }
      }
      
      // Optimistically update all-habits cache
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
          previousAllHabits.map(habit => 
            habit.id === id ? { ...habit, archived } : habit
          )
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
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
      await queryClient.cancelQueries({ queryKey: ['habits'] });
      await queryClient.cancelQueries({ queryKey: ['all-habits'] });
      
      const previousHabits = queryClient.getQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate]);
      const previousAllHabits = queryClient.getQueryData<Habit[]>(['all-habits', user?.id]);
      
      // Optimistically remove from caches
      if (previousHabits) {
        queryClient.setQueryData<HabitWithLog[]>(['habits', user?.id, logicalDate], 
          previousHabits.filter(habit => habit.id !== id)
        );
      }
      
      if (previousAllHabits) {
        queryClient.setQueryData<Habit[]>(['all-habits', user?.id], 
          previousAllHabits.filter(habit => habit.id !== id)
        );
      }
      
      return { previousHabits, previousAllHabits };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', user?.id, logicalDate], context.previousHabits);
      }
      if (context?.previousAllHabits) {
        queryClient.setQueryData(['all-habits', user?.id], context.previousAllHabits);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['all-habits'] });
    },
  });
}
