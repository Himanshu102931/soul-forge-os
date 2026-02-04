import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
<<<<<<< HEAD
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { getLogicalDate } from '@/lib/time-utils';
=======
import { subDays, format, eachDayOfInterval, startOfDay, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import { getLogicalDate } from '@/lib/time-utils';
import { queryKeys, STALE_TIMES } from '@/lib/query-config';
>>>>>>> cf46c6e (Initial commit: project files)

export interface ConsistencyData {
  date: string;
  consistency: number;
  completed: number;
  total: number;
}

<<<<<<< HEAD
=======
export interface HabitStreak {
  habitId: string;
  habitTitle: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 1=low, 2=medium, 3=high, 4=very high
}

export interface TopPerformer {
  habitId: string;
  habitTitle: string;
  completionRate: number;
  totalDays: number;
  completedDays: number;
}

export interface XPHPDataPoint {
  date: string;
  xp: number;
  hp: number;
}

>>>>>>> cf46c6e (Initial commit: project files)
export function useConsistencyScore() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: ['consistency', user?.id],
=======
    queryKey: user ? queryKeys.consistency(user.id) : ['consistency'],
    staleTime: STALE_TIMES.analytics,
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
=======

// Calculate habit streaks (ANY completion counts)
export function useHabitStreaks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: user ? queryKeys.habitStreaks(user.id) : ['habit-streaks'],
    staleTime: STALE_TIMES.streaks,
    queryFn: async () => {
      if (!user) return [];

      // Fetch all habits and their logs
      const { data: habits } = await supabase
        .from('habits')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('title');

      if (!habits) return [];

      const streaks: HabitStreak[] = [];

      for (const habit of habits) {
        // Fetch all logs for this habit, ordered by date desc
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('date, status')
          .eq('habit_id', habit.id)
          .order('date', { ascending: false });

        if (!logs || logs.length === 0) {
          streaks.push({
            habitId: habit.id,
            habitTitle: habit.title,
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
          });
          continue;
        }

        // Calculate current streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let expectedDate = startOfDay(new Date());
        let lastCompletedDate: string | null = null;

        for (const log of logs) {
          const logDate = startOfDay(new Date(log.date));
          
          // ANY completion (completed or partial) counts
          const countsForStreak = log.status === 'completed' || log.status === 'partial';

          if (countsForStreak) {
            if (!lastCompletedDate) {
              lastCompletedDate = log.date;
            }

            // Check if this is consecutive
            const daysDiff = differenceInDays(expectedDate, logDate);
            
            if (daysDiff === 0) {
              // Same day or consecutive
              tempStreak++;
              if (currentStreak === 0 || differenceInDays(new Date(), logDate) <= 1) {
                currentStreak = tempStreak;
              }
              expectedDate = subDays(logDate, 1);
            } else if (daysDiff === 1) {
              // Consecutive day
              tempStreak++;
              if (currentStreak === 0 || differenceInDays(new Date(), logDate) <= 1) {
                currentStreak = tempStreak;
              }
              expectedDate = subDays(logDate, 1);
            } else {
              // Break in streak
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
              expectedDate = subDays(logDate, 1);
              if (differenceInDays(new Date(), logDate) > 1) {
                currentStreak = 0;
              }
            }
          } else {
            // Missed or skipped: breaks streak
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
            currentStreak = 0;
            expectedDate = subDays(logDate, 1);
          }
        }

        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

        streaks.push({
          habitId: habit.id,
          habitTitle: habit.title,
          currentStreak,
          longestStreak,
          lastCompletedDate,
        });
      }

      return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
    },
    enabled: !!user,
  });
}

// Calculate heatmap data for full year (GitHub-style)
export function useHabitHeatmap(year: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user ? queryKeys.habitHeatmap(user.id, year) : ['habit-heatmap', year],
    staleTime: STALE_TIMES.analytics,
    queryFn: async () => {
      if (!user) return [];

      const startDate = startOfYear(new Date(year, 0, 1));
      const endDate = endOfYear(new Date(year, 0, 1));
      
      // Generate all days in the year
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });

      // Fetch all habit logs for the year
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('date, status, habits!inner(user_id)')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .eq('habits.user_id', user.id)
        .in('status', ['completed', 'partial']);

      // Count completions per day
      const countsPerDay = new Map<string, number>();
      
      if (logs) {
        for (const log of logs) {
          const dateKey = log.date;
          countsPerDay.set(dateKey, (countsPerDay.get(dateKey) || 0) + 1);
        }
      }

      // Generate heatmap data with intensity levels
      const heatmapData: HeatmapDay[] = allDays.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const count = countsPerDay.get(dateKey) || 0;
        
        // Intensity levels: 0=none, 1=1-2, 2=3-4, 3=5-6, 4=7+
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count === 0) level = 0;
        else if (count <= 2) level = 1;
        else if (count <= 4) level = 2;
        else if (count <= 6) level = 3;
        else level = 4;

        return { date: dateKey, count, level };
      });

      return heatmapData;
    },
    enabled: !!user,
  });
}

// Calculate top performing habits by completion rate
export function useTopPerformers(days: number = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user ? queryKeys.topPerformers(user.id, days) : ['top-performers', days],
    staleTime: STALE_TIMES.analytics,
    queryFn: async () => {
      if (!user) return [];

      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

      // Fetch all active habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id, title, frequency_days')
        .eq('user_id', user.id)
        .eq('archived', false);

      if (!habits) return [];

      const performers: TopPerformer[] = [];

      for (const habit of habits) {
        // Fetch logs for this habit in the time range
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('date, status')
          .eq('habit_id', habit.id)
          .gte('date', startDate);

        if (!logs) continue;

        // Count days where habit was due (based on frequency)
        const daysInRange = eachDayOfInterval({
          start: new Date(startDate),
          end: new Date(),
        });

        let totalDueDays = 0;
        let completedDays = 0;

        for (const day of daysInRange) {
          const dayOfWeek = day.getDay();
          const isDue = habit.frequency_days.includes(dayOfWeek);

          if (isDue) {
            totalDueDays++;
            const dateKey = format(day, 'yyyy-MM-dd');
            const log = logs.find(l => l.date === dateKey);
            if (log && (log.status === 'completed' || log.status === 'partial')) {
              completedDays++;
            }
          }
        }

        if (totalDueDays > 0) {
          performers.push({
            habitId: habit.id,
            habitTitle: habit.title,
            completionRate: (completedDays / totalDueDays) * 100,
            totalDays: totalDueDays,
            completedDays,
          });
        }
      }

      // Sort by completion rate desc (return all, component will handle limiting)
      return performers.sort((a, b) => b.completionRate - a.completionRate);
    },
    enabled: !!user,
  });
}

// Calculate XP and HP trends over time
export function useXPHPTrends(days: number = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: user ? queryKeys.xpHpTrends(user.id, days) : ['xp-hp-trends', days],
    staleTime: STALE_TIMES.analytics,
    queryFn: async () => {
      if (!user) return [];

      // Fetch profile to get current XP/HP
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, hp, level')
        .eq('id', user.id)
        .single();

      if (!profile) return [];

      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
      
      // Fetch habit logs to calculate XP earned per day
      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('date, status, habits!inner(xp_reward, user_id)')
        .eq('habits.user_id', user.id)
        .gte('date', startDate)
        .order('date');

      // Fetch tasks completed to calculate XP from tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('completed_at, priority')
        .eq('user_id', user.id)
        .gte('completed_at', startDate)
        .not('completed_at', 'is', null)
        .order('completed_at');

      const daysArray = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(),
      });

      // Calculate daily XP and HP based on actual data
      let runningXP = 0;
      let runningHP = 100;

      const trends: XPHPDataPoint[] = daysArray.map((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        
        // Calculate XP earned from habits this day
        const dayHabitLogs = habitLogs?.filter(log => log.date === dateKey) || [];
        let dayXP = 0;
        let hpLoss = 0;

        for (const log of dayHabitLogs) {
          const xpReward = (log.habits as any)?.xp_reward || 10;
          if (log.status === 'completed') {
            dayXP += xpReward;
          } else if (log.status === 'partial') {
            dayXP += Math.floor(xpReward / 2);
          } else if (log.status === 'missed') {
            hpLoss += 10;
          }
        }

        // Calculate XP from tasks completed this day
        const dayTasks = tasks?.filter(t => {
          const completedDate = t.completed_at ? format(new Date(t.completed_at), 'yyyy-MM-dd') : null;
          return completedDate === dateKey;
        }) || [];

        for (const task of dayTasks) {
          if (task.priority === 'high') dayXP += 20;
          else if (task.priority === 'medium') dayXP += 15;
          else dayXP += 10;
        }

        runningXP += dayXP;
        runningHP = Math.max(0, Math.min(100, runningHP - hpLoss));

        // On last day, use actual profile values
        if (index === daysArray.length - 1) {
          runningXP = profile.xp;
          runningHP = profile.hp;
        }

        return {
          date: dateKey,
          xp: runningXP,
          hp: runningHP,
        };
      });

      return trends;
    },
    enabled: !!user,
  });
}
>>>>>>> cf46c6e (Initial commit: project files)
