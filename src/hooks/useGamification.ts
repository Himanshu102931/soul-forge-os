import { useQuery } from '@tanstack/react-query';
import { useHabits } from '@/hooks/useHabits';
import { useAllHabitLogs } from '@/hooks/useAdvancedAnalytics';
import { 
  calculateTotalXP, 
  calculateUserLevel, 
  checkLevelUp,
  GAMIFICATION_ACHIEVEMENTS,
  LEVEL_THRESHOLDS
} from '@/lib/gamification-utils';
import { getRankByLevel, getRanksWithStatus, getNextRank } from '@/lib/rank-utils';

export function useUserXP() {
  const { data: habits } = useHabits();
  const { data: logs } = useAllHabitLogs(365); // Use all-time data for XP

  return useQuery({
    queryKey: ['user-xp', habits?.length, logs?.length],
    enabled: !!habits && !!logs,
    queryFn: () => {
      if (!logs) return 0;
      return calculateTotalXP(logs);
    },
  });
}

export function useUserLevel() {
  const { data: totalXP } = useUserXP();

  return useQuery({
    queryKey: ['user-level', totalXP],
    enabled: totalXP !== undefined,
    queryFn: () => {
      if (totalXP === undefined) return null;
      return calculateUserLevel(totalXP);
    },
  });
}

export function useGamificationStats() {
  const { data: habits } = useHabits();
  const { data: logs } = useAllHabitLogs(365);
  const { data: userLevel } = useUserLevel();

  return useQuery({
    queryKey: ['gamification-stats', habits?.length, logs?.length, userLevel?.level],
    enabled: !!habits && !!logs && !!userLevel,
    queryFn: async () => {
      if (!habits || !logs || !userLevel) return null;

      const completedLogs = logs.filter(log => log.status === 'completed');
      const totalCompletions = completedLogs.length;

      // Calculate streak - consecutive days with at least 1 completion
      const completedDates = new Set(completedLogs.map(log => log.date));
      let currentStreak = 0;
      
      // Start from today and count backward
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (completedDates.has(dateStr)) {
          currentStreak++;
        } else {
          // Streak broken - stop counting
          break;
        }
      }

      // Count daily completions for today
      const todayStr = today.toISOString().split('T')[0];
      const todayCompletions = completedLogs.filter(log => log.date === todayStr).length;

      // Check unlocked achievements
      const unlockedAchievements = GAMIFICATION_ACHIEVEMENTS.filter(achievement => {
        switch (achievement.condition) {
          case 'total_completions >= 1':
            return totalCompletions >= 1;
          case 'streak >= 7':
            return currentStreak >= 7;
          case 'streak >= 30':
            return currentStreak >= 30;
          case 'streak >= 100':
            return currentStreak >= 100;
          case 'daily_completions >= 7':
            return todayCompletions >= 7;
          case 'total_completions >= 50':
            return totalCompletions >= 50;
          default:
            return false;
        }
      });

      return {
        level: userLevel.level,
        totalXP: userLevel.totalXP,
        xpToNextLevel: userLevel.xpToNextLevel,
        xpInCurrentLevel: userLevel.xpInCurrentLevel,
        currentStreak,
        totalCompletions,
        todayCompletions,
        unlockedAchievements,
        nextAchievements: GAMIFICATION_ACHIEVEMENTS.filter(
          ach => !unlockedAchievements.find(u => u.id === ach.id)
        ),
      };
    },
  });
}

export function useXPProgress() {
  const { data: totalXP } = useUserXP();
  const { data: userLevel } = useUserLevel();

  return useQuery({
    queryKey: ['xp-progress', totalXP, userLevel?.level],
    enabled: totalXP !== undefined && userLevel !== undefined,
    queryFn: () => {
      if (!userLevel) return null;

      const currentLevelThreshold = userLevel.level === 1 ? 0 : 
        Object.values(LEVEL_THRESHOLDS).filter(t => t <= userLevel.totalXP).pop() || 0;
      
      const nextLevelThreshold = Object.values(LEVEL_THRESHOLDS)
        .filter(t => t > userLevel.totalXP)[0] || currentLevelThreshold + 1000;

      const xpInLevel = userLevel.totalXP - currentLevelThreshold;
      const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
      const progressPercent = (xpInLevel / xpNeededForLevel) * 100;

      return {
        currentLevel: userLevel.level,
        currentLevelTitle: userLevel.title,
        currentLevelEmoji: userLevel.emoji,
        xpInLevel,
        xpNeededForLevel,
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        totalXP: userLevel.totalXP,
        xpToNextLevel: userLevel.xpToNextLevel,
      };
    },
  });
}

// Import LEVEL_THRESHOLDS for useXPProgress
export function useUserRank() {
  const { data: userLevel } = useUserLevel();

  return useQuery({
    queryKey: ['user-rank', userLevel?.level],
    enabled: !!userLevel,
    queryFn: () => {
      if (!userLevel) return null;
      const rank = getRankByLevel(userLevel.level);
      const nextRank = getNextRank(userLevel.level);
      return {
        currentRank: rank,
        nextRank: nextRank,
        ranksWithStatus: getRanksWithStatus(userLevel.level),
      };
    },
  });
}
