import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { addDays, format } from 'date-fns';
import { getLogicalDate, getLogicalDateString } from '@/lib/time-utils';
import { queryKeys, staleTimes } from '@/lib/query-config';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completed_at?: string | null;
  is_for_today: boolean;
  due_date: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

const priorityOrder = { high: 0, medium: 1, low: 2 };

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.tasks(user?.id || ''),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Sort by priority then by created_at
      const sorted = (data as Task[]).sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      return sorted;
    },
    enabled: !!user,
    staleTime: staleTimes.realtime, // 30s - tasks change frequently
  });
}

export function useBacklogTasks() {
  const { data: tasks, ...rest } = useTasks();
  const todayStr = getLogicalDateString();
  
  return {
    // Backlog: is_for_today=false AND (no due_date OR due_date != today)
    data: tasks?.filter(t => {
      if (t.completed) return false;
      if (t.is_for_today) return false;
      // If due today, it should be in Today's Focus
      if (t.due_date === todayStr) return false;
      return true;
    }) || [],
    ...rest,
  };
}

export function useTodayTasks() {
  const { data: tasks, ...rest } = useTasks();
  const todayStr = getLogicalDateString();
  
  return {
    // Today's Focus: is_for_today=true OR due_date=today
    data: tasks?.filter(t => {
      if (t.completed) return false;
      return t.is_for_today || t.due_date === todayStr;
    }) || [],
    ...rest,
  };
}

export function useHorizonTasks() {
  const { data: tasks, ...rest } = useTasks();
  const { logicalDate } = useLogicalDate();
  
  const logical = getLogicalDate();
  const horizonEnd = addDays(logical, 3);
  
  const horizonTasks = tasks?.filter(t => {
    if (t.completed || !t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return dueDate <= horizonEnd;
  }).sort((a, b) => {
    const dateA = new Date(a.due_date!);
    const dateB = new Date(b.due_date!);
    return dateA.getTime() - dateB.getTime();
  }) || [];
  
  return { data: horizonTasks, ...rest };
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'archived' | 'completed'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData(['tasks', user?.id]);
      
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map(task => 
          task.id === id ? { ...task, ...updates } : task
        );
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const updates: { completed: boolean; completed_at: string | null } = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData(['tasks', user?.id]);
      
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map(task => 
          task.id === id ? { 
            ...task, 
            completed,
            completed_at: completed ? new Date().toISOString() : null 
          } : task
        );
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, is_for_today }: { id: string; is_for_today: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_for_today })
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, is_for_today }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData(['tasks', user?.id]);
      
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map(task => 
          task.id === id ? { ...task, is_for_today } : task
        );
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      const deletedTask = previousTasks?.find(t => t.id === id);
      
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.filter(task => task.id !== id);
      });
      
      return { previousTasks, deletedTask };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (task: Task) => {
      if (!user) throw new Error('Not authenticated');
      
      const { id, user_id, created_at, updated_at, ...taskData } = task;
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useArchiveTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ archived: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', user?.id]);
      
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.filter(task => task.id !== id);
      });
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
    },
  });
}

// Fetch archived tasks for restore functionality
export function useArchivedTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['archived-tasks', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });
}

// Restore an archived task
export function useUnarchiveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ archived: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
    },
  });
}

// ============================================================
// PAGINATION AND OPTIMIZATION UTILITIES
// ============================================================

/**
 * Fetch tasks with pagination support
 * Useful for large task lists to reduce memory usage
 */
export function useTasksPaginated(
  page: number = 0,
  pageSize: number = 50,
  includeArchived: boolean = false
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks-paginated', user?.id, page, pageSize, includeArchived],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const offset = page * pageSize;
      const { data, error, count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('archived', includeArchived)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      const sorted = (data as Task[]).sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      return {
        data: sorted,
        total: count || 0,
        page,
        pageSize,
      };
    },
  });
}

/**
 * Fetch only today's tasks (optimized subset)
 * Reduces dataset for daily task view
 */
export function useTodaysTasks() {
  const { user } = useAuth();
  const { logicalNow } = useLogicalDate();

  return useQuery({
    queryKey: ['tasks-today', user?.id, getLogicalDateString(logicalNow)],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_for_today', true)
        .eq('archived', false)
        .order('priority', { ascending: true });

      if (error) throw error;

      const sorted = (data as Task[]).sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      return sorted;
    },
  });
}

/**
 * Fetch completed tasks only (for history/archive)
 * Reduces memory for completion tracking
 */
export function useCompletedTasks(page: number = 0, pageSize: number = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks-completed', user?.id, page, pageSize],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const offset = page * pageSize;
      const { data, error, count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      return {
        data: (data as Task[]),
        total: count || 0,
        page,
        pageSize,
      };
    },
  });
}

