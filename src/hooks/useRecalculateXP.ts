import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { subDays, format } from 'date-fns';
import { getLogicalDate } from '@/lib/time-utils';
import { calculateLevelThreshold } from '@/lib/rpg-utils';

export function useRecalculateXP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ daysBack = 7, endDate: customEndDate }: { daysBack?: number; endDate?: string } = {}) => {
      if (!user || !profile) throw new Error('Not authenticated or profile not loaded');

      // Get date range
      const today = customEndDate ? new Date(customEndDate) : getLogicalDate();
      const daysBackAgo = subDays(today, daysBack - 1);
      
      const startDate = format(daysBackAgo, 'yyyy-MM-dd');
      const endDateStr = format(today, 'yyyy-MM-dd');

      // Fetch all daily summaries to check current state
      const { data: currentSummaries, error: currentError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (currentError) throw currentError;

      // Calculate what SHOULD be the total XP based on existing summaries
      // Don't rebuild from habits - trust the nightly review XP values
      let totalXP = 0;
      currentSummaries?.forEach(summary => {
        totalXP += summary.xp_earned || 0;
      });

      // Recalculate level from total XP
      let currentXP = totalXP;
      let currentLevel = 1;

      // Calculate levels using correct exponential formula
      while (currentXP >= calculateLevelThreshold(currentLevel)) {
        currentXP -= calculateLevelThreshold(currentLevel);
        currentLevel++;
      }

      // Check if values actually changed
      const profileChanged = profile.xp !== currentXP || profile.level !== currentLevel;

      // Update profile with recalculated values only if changed
      if (profileChanged) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            xp: currentXP,
            level: currentLevel,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      }

      return {
        totalXPEarned: totalXP,
        currentLevel: currentLevel,
        currentXP: currentXP,
        daysProcessed: currentSummaries?.length || 0,
        profileChanged,
      };
    },
    onSuccess: (data) => {
      // Invalidate all relevant caches
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['all-daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['day-summary'] });
      queryClient.invalidateQueries({ queryKey: ['habit-logs-month'] });
      queryClient.invalidateQueries({ queryKey: ['day-habit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['day-metrics'] });
      
      if (!data.profileChanged) {
        toast({
          title: '✅ Already Up to Date',
          description: `Your profile is already correct: Level ${data.currentLevel} with ${data.currentXP} XP. Total: ${data.totalXPEarned} XP from ${data.daysProcessed} days.`,
        });
      } else {
        toast({
          title: '✨ XP Recalculated!',
          description: `Level ${data.currentLevel} with ${data.currentXP} XP. Total earned: ${data.totalXPEarned} XP from ${data.daysProcessed} days.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Recalculation Failed',
        description: error instanceof Error ? error.message : 'Failed to recalculate XP',
        variant: 'destructive',
      });
    },
  });
}
