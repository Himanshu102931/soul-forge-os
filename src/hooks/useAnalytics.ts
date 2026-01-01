import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { getLogicalDate } from '@/lib/time-utils';

export interface ConsistencyData {
  date: string;
  consistency: number;
  completed: number;
  total: number;
}

export function useConsistencyScore() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['consistency', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const logicalDate = getLogicalDate();
      const thirtyDaysAgo = subDays(logicalDate, 30);
      
      // Get all habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id, frequency_days, is_bad_habit')
        .eq('user_id', user.id)
        .eq('archived', false)
        .eq('is_bad_habit', false);
      
      if (habitsError) throw habitsError;
      
      // Get all logs for the last 30 days
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('habit_id, date, status')
        .in('habit_id', (habits || []).map(h => h.id))
        .gte('date', format(thirtyDaysAgo, 'yyyy-MM-dd'))
        .lte('date', format(logicalDate, 'yyyy-MM-dd'));
      
      if (logsError) throw logsError;
      
      // Calculate daily consistency
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: logicalDate });
      const consistencyData: ConsistencyData[] = [];
      
      let totalCompleted = 0;
      let totalPossible = 0;
      
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayOfWeek = day.getDay();
        
        // Get habits due on this day
        const dueHabits = (habits || []).filter(h => 
          h.frequency_days.includes(dayOfWeek)
        );
        
        // Get completed habits for this day
        const dayLogs = (logs || []).filter(l => 
          l.date === dateStr && (l.status === 'completed' || l.status === 'partial')
        );
        
        const completed = dayLogs.length;
        const total = dueHabits.length;
        
        totalCompleted += completed;
        totalPossible += total;
        
        consistencyData.push({
          date: dateStr,
          consistency: total > 0 ? Math.round((completed / total) * 100) : 100,
          completed,
          total,
        });
      });
      
      const overallScore = totalPossible > 0 
        ? Math.round((totalCompleted / totalPossible) * 100) 
        : 100;
      
      return {
        score: overallScore,
        data: consistencyData,
      };
    },
    enabled: !!user,
  });
}
