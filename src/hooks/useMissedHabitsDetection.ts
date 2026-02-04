import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { useProfile } from './useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { HP_PER_MISSED_HABIT } from '@/lib/rpg-utils';
import { subDays, format, parse, differenceInDays } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to detect and process missed habits from previous days
 * Runs when user opens the app or when the date changes
 */
export function useMissedHabitsDetection() {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hasProcessedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !profile || !logicalDate) return;

    // Prevent processing same day multiple times
    if (hasProcessedRef.current === logicalDate) return;

    const processMissedHabits = async () => {
      try {
        // Get last processed date from localStorage
        const lastProcessedKey = `last_missed_check_${user.id}`;
        const lastProcessed = localStorage.getItem(lastProcessedKey);
        
        // Parse current logical date
        const currentDate = parse(logicalDate, 'yyyy-MM-dd', new Date());
        
        // If no last processed date, set it to yesterday and return
        if (!lastProcessed) {
          localStorage.setItem(lastProcessedKey, format(subDays(currentDate, 1), 'yyyy-MM-dd'));
          hasProcessedRef.current = logicalDate;
          return;
        }

        const lastProcessedDate = parse(lastProcessed, 'yyyy-MM-dd', new Date());
        const daysDiff = differenceInDays(currentDate, lastProcessedDate);

        // If same day or future date, skip
        if (daysDiff <= 0) {
          hasProcessedRef.current = logicalDate;
          return;
        }

        // Process all missed days between lastProcessed and today (exclusive of today)
        let totalMissedCount = 0;
        let totalHPLoss = 0;

        for (let i = daysDiff; i >= 1; i--) {
          const dateToCheck = format(subDays(currentDate, i), 'yyyy-MM-dd');
          const dateObj = parse(dateToCheck, 'yyyy-MM-dd', new Date());
          const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
          
          // Fetch all active habits
          const { data: habits, error: habitsError } = await supabase
            .from('habits')
            .select('id, frequency_days, is_bad_habit')
            .eq('user_id', user.id)
            .eq('archived', false);

          if (habitsError) throw habitsError;
          if (!habits) continue;

          // Check which habits were due on that date
          const dueHabits = habits.filter(h => 
            !h.is_bad_habit && h.frequency_days?.includes(dayOfWeek)
          );

          if (dueHabits.length === 0) continue;

          // Get existing logs for that date
          const { data: existingLogs, error: logsError } = await supabase
            .from('habit_logs')
            .select('habit_id')
            .in('habit_id', dueHabits.map(h => h.id))
            .eq('date', dateToCheck);

          if (logsError) throw logsError;

          const loggedHabitIds = new Set(existingLogs?.map(l => l.habit_id) || []);

          // Find habits that were due but not logged
          const missedHabits = dueHabits.filter(h => !loggedHabitIds.has(h.id));

          if (missedHabits.length > 0) {
            // Create "missed" logs for unlogged habits
            const missedLogs = missedHabits.map(h => ({
              habit_id: h.id,
              date: dateToCheck,
              status: 'missed' as const,
            }));

            const { error: insertError } = await supabase
              .from('habit_logs')
              .insert(missedLogs);

            if (insertError) throw insertError;

            totalMissedCount += missedHabits.length;
            totalHPLoss += missedHabits.length * HP_PER_MISSED_HABIT;
          }
        }

        // Update HP if habits were missed
        if (totalMissedCount > 0 && totalHPLoss > 0) {
          let newHP = profile.hp - totalHPLoss;
          let newLevel = profile.level;

          // Handle level down if HP <= 0
          while (newHP <= 0 && newLevel > 1) {
            newLevel--;
            newHP = 100 + newHP; // Carry over negative HP
          }

          // Ensure HP stays at minimum 1
          if (newHP <= 0) {
            newHP = 1;
          }

          // Update profile
          await supabase
            .from('profiles')
            .update({
              hp: newHP,
              level: newLevel,
            })
            .eq('id', user.id);

          // Invalidate queries to refresh UI immediately
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          queryClient.invalidateQueries({ queryKey: ['habits'] });

          // Show toast notification
          const leveledDown = newLevel < profile.level;
          if (leveledDown) {
            toast({
              title: '💀 Level Down',
              description: `${totalMissedCount} habits missed. Lost ${totalHPLoss} HP and dropped to Level ${newLevel}.`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: '⚠️ Habits Missed',
              description: `${totalMissedCount} habits marked as missed (-${totalHPLoss} HP)`,
              variant: 'destructive',
            });
          }
        }

        // Update last processed date to yesterday (not today, since today's habits aren't due yet)
        localStorage.setItem(lastProcessedKey, format(subDays(currentDate, 1), 'yyyy-MM-dd'));
        hasProcessedRef.current = logicalDate;

      } catch (error) {
        console.error('Error processing missed habits:', error);
      }
    };

    processMissedHabits();
  }, [user, logicalDate, profile, toast, queryClient]);
}
