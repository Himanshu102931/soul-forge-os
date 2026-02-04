import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
<<<<<<< HEAD
=======
import { queryKeys, STALE_TIMES } from '@/lib/query-config';
>>>>>>> cf46c6e (Initial commit: project files)

export interface MetricLog {
  id: string;
  user_id: string;
  metric_id: 'sleep' | 'steps';
  date: string;
  value: number;
}

export function useMetrics() {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['metrics', user?.id, logicalDate],
=======
    queryKey: user ? queryKeys.metrics(user.id, logicalDate) : ['metrics'],
    staleTime: STALE_TIMES.metrics,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('metric_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', logicalDate);
      
      if (error) throw error;
      
      const metrics: Record<string, number> = {};
      (data as MetricLog[]).forEach(m => {
        metrics[m.metric_id] = m.value;
      });
      
      return metrics;
    },
    enabled: !!user,
  });
}

export function useUpdateMetric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async ({ metricId, value }: { metricId: 'sleep' | 'steps'; value: number }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('metric_logs')
        .upsert({
          user_id: user.id,
          metric_id: metricId,
          date: logicalDate,
          value,
        }, {
          onConflict: 'user_id,metric_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.metrics(user.id, logicalDate) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
    },
  });
}
