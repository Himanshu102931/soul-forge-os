import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const XP_PER_COMPLETE = 10;
const XP_PER_PARTIAL = 5;
const XP_PER_RESISTANCE = 10;

export function useRebuildDailySummaries() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (daysBack?: number) => {
      if (!user) throw new Error('Not authenticated');

      // Fetch all habits to determine which are resistance (bad habits)
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id, is_bad_habit')
        .eq('user_id', user.id)
        .eq('archived', false);

      if (habitsError) throw habitsError;

      const resistanceHabits = new Set(
        habits
          ?.filter(h => h.is_bad_habit === true)
          .map(h => h.id) || []
      );

      // Fetch all habit logs - simplified query to avoid type inference issues
      const logsResult = await supabase
        .from('habit_logs')
        .select('habit_id, date, status');

      let logs = logsResult.data || [];
      const logsError = logsResult.error;

      if (logsError) throw logsError;

      // Filter logs to date range if daysBack is specified
      if (daysBack && daysBack > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
        logs = logs.filter(log => log.date >= cutoffDateStr);
      }

      // Group logs by date and calculate XP per day
      const dailyXP: Record<string, number> = {};

      logs?.forEach(log => {
        if (!dailyXP[log.date]) {
          dailyXP[log.date] = 0;
        }

        // Calculate XP based on status
        if (log.status === 'completed') {
          const xp = resistanceHabits.has(log.habit_id) ? XP_PER_RESISTANCE : XP_PER_COMPLETE;
          dailyXP[log.date] += xp;
        } else if (log.status === 'partial') {
          dailyXP[log.date] += XP_PER_PARTIAL;
        }
        // skipped/paused = 0 XP
      });

      // Fetch existing daily_summaries to compare
      const { data: existingSummaries } = await supabase
        .from('daily_summaries')
        .select('date, xp_earned')
        .eq('user_id', user.id);

      const existingXP = new Map(
        (existingSummaries || []).map(s => [s.date, s.xp_earned || 0])
      );

      // Update all daily_summaries with correct XP values
      let updatedCount = 0;
      let unchangedCount = 0;
      const errors: string[] = [];

      for (const [date, xp] of Object.entries(dailyXP)) {
        // Skip if XP hasn't changed
        if (existingXP.get(date) === xp) {
          unchangedCount++;
          continue;
        }

        const { error } = await supabase
          .from('daily_summaries')
          .upsert({
            user_id: user.id,
            date,
            xp_earned: xp,
          }, {
            onConflict: 'user_id,date',
          });

        if (error) {
          errors.push(`${date}: ${error.message}`);
        } else {
          updatedCount++;
        }
      }

      if (errors.length > 0) {
        throw new Error(`Updated ${updatedCount} days, but got errors: ${errors.join('; ')}`);
      }

      return {
        daysUpdated: updatedCount,
        unchangedDays: unchangedCount,
        totalXPRecovered: Object.values(dailyXP).reduce((a, b) => a + b, 0),
      };
    },
    onSuccess: (data) => {
      // Invalidate all caches
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['day-summary'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['habit-logs-month'] });

      if (data.daysUpdated === 0) {
        toast({
          title: '✅ Already Up to Date',
          description: `All ${data.unchangedDays} days already have correct XP values. No changes needed.`,
        });
      } else {
        toast({
          title: '✨ Daily Summaries Rebuilt!',
          description: `Updated ${data.daysUpdated} days with correct XP. ${data.unchangedDays} days unchanged. Total: ${data.totalXPRecovered} XP. Now run "Recover XP" to recalculate your profile.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Rebuild Failed',
        description: error instanceof Error ? error.message : 'Failed to rebuild summaries',
        variant: 'destructive',
      });
    },
  });
}
