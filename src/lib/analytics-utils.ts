// Analytics utility functions for streaks, statistics, and calculations
import { HabitLog } from '@/hooks/useHabits';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakDates: string[];
  lastCompletedDate: string | null;
}

export interface HabitStats {
  habitId: string;
  habitTitle: string;
  totalCompletions: number;
  totalAttempts: number;
  completionRate: number;
  streak: StreakData;
  lastWeekRate: number;
  lastMonthRate: number;
  bestDay: string; // Day of week
  worstDay: string;
}

// Calculate streak for a habit
export function calculateStreak(logs: HabitLog[], sortedDates: string[]): StreakData {
  if (logs.length === 0 || sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakDates: [],
      lastCompletedDate: null,
    };
  }

  // Create a set of completed dates for quick lookup
  const completedDates = new Set(
    logs
      .filter(log => log.status === 'completed')
      .map(log => log.date)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate: string | null = null;
  const streakDates: string[] = [];

  // Sort dates in descending order (newest first)
  const sortedDesc = [...sortedDates].sort((a, b) => b.localeCompare(a));
  
  // Calculate current streak (from today backwards)
  for (const date of sortedDesc) {
    if (completedDates.has(date)) {
      currentStreak++;
      if (currentStreak === 1) {
        lastCompletedDate = date;
      }
      streakDates.push(date);
    } else {
      break; // Streak broken
    }
  }

  // Calculate longest streak
  tempStreak = 0;
  for (const date of sortedDates.sort()) {
    if (completedDates.has(date)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    streakDates: streakDates.reverse(), // Oldest to newest
    lastCompletedDate,
  };
}

// Calculate comprehensive habit statistics
export function calculateHabitStats(
  habitId: string,
  habitTitle: string,
  logs: HabitLog[],
  allDates: string[]
): HabitStats {
  const completedLogs = logs.filter(log => log.status === 'completed');
  const totalCompletions = completedLogs.length;
  const totalAttempts = logs.length;
  const completionRate = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0;

  // Calculate streak
  const streak = calculateStreak(logs, allDates);

  // Last week/month rates
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  const lastWeekLogs = logs.filter(log => new Date(log.date) >= lastWeek);
  const lastMonthLogs = logs.filter(log => new Date(log.date) >= lastMonth);

  const lastWeekCompletions = lastWeekLogs.filter(log => log.status === 'completed').length;
  const lastMonthCompletions = lastMonthLogs.filter(log => log.status === 'completed').length;

  const lastWeekRate = lastWeekLogs.length > 0 ? (lastWeekCompletions / lastWeekLogs.length) * 100 : 0;
  const lastMonthRate = lastMonthLogs.length > 0 ? (lastMonthCompletions / lastMonthLogs.length) * 100 : 0;

  // Best/worst day of week
  const dayStats: { [key: number]: { completed: number; total: number } } = {};
  
  completedLogs.forEach(log => {
    const dayOfWeek = new Date(log.date).getDay();
    if (!dayStats[dayOfWeek]) {
      dayStats[dayOfWeek] = { completed: 0, total: 0 };
    }
    dayStats[dayOfWeek].completed++;
  });

  logs.forEach(log => {
    const dayOfWeek = new Date(log.date).getDay();
    if (!dayStats[dayOfWeek]) {
      dayStats[dayOfWeek] = { completed: 0, total: 0 };
    }
    dayStats[dayOfWeek].total++;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = 'N/A';
  let worstDay = 'N/A';
  let bestRate = -1;
  let worstRate = 101;

  Object.entries(dayStats).forEach(([day, stats]) => {
    const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    if (rate > bestRate) {
      bestRate = rate;
      bestDay = dayNames[parseInt(day)];
    }
    if (rate < worstRate && stats.total > 0) {
      worstRate = rate;
      worstDay = dayNames[parseInt(day)];
    }
  });

  return {
    habitId,
    habitTitle,
    totalCompletions,
    totalAttempts,
    completionRate,
    streak,
    lastWeekRate,
    lastMonthRate,
    bestDay,
    worstDay,
  };
}

// Generate date range for analytics
export function generateDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Calculate completion heatmap data
export interface HeatmapDay {
  date: string;
  count: number;
  percentage: number;
}

export function generateHeatmapData(
  logs: HabitLog[],
  dateRange: string[],
  totalHabits: number
): HeatmapDay[] {
  const completionMap = new Map<string, number>();
  
  logs.forEach(log => {
    if (log.status === 'completed') {
      const count = completionMap.get(log.date) || 0;
      completionMap.set(log.date, count + 1);
    }
  });

  return dateRange.map(date => {
    const count = completionMap.get(date) || 0;
    const percentage = totalHabits > 0 ? (count / totalHabits) * 100 : 0;
    return { date, count, percentage };
  });
}

// Milestone definitions
export interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: string;
  color: string;
}

export const STREAK_MILESTONES: Milestone[] = [
  { id: 'week', title: 'Week Warrior', description: '7-day streak', threshold: 7, icon: '🔥', color: 'orange' },
  { id: 'month', title: 'Month Master', description: '30-day streak', threshold: 30, icon: '💪', color: 'blue' },
  { id: 'hundred', title: 'Century Club', description: '100-day streak', threshold: 100, icon: '💯', color: 'purple' },
  { id: 'year', title: 'Year Champion', description: '365-day streak', threshold: 365, icon: '👑', color: 'gold' },
];

export const COMPLETION_MILESTONES: Milestone[] = [
  { id: 'first', title: 'First Step', description: '1 habit completed', threshold: 1, icon: '✨', color: 'green' },
  { id: 'ten', title: 'Getting Started', description: '10 habits completed', threshold: 10, icon: '⭐', color: 'green' },
  { id: 'fifty', title: 'Habit Builder', description: '50 habits completed', threshold: 50, icon: '🌟', color: 'blue' },
  { id: 'hundred', title: 'Consistency King', description: '100 habits completed', threshold: 100, icon: '💎', color: 'purple' },
  { id: 'fivehundred', title: 'Elite Performer', description: '500 habits completed', threshold: 500, icon: '🏆', color: 'gold' },
  { id: 'thousand', title: 'Legendary', description: '1000 habits completed', threshold: 1000, icon: '🎖️', color: 'gold' },
];

// Check which milestones are unlocked
export function getUnlockedMilestones(
  currentStreak: number,
  totalCompletions: number
): { streak: Milestone[]; completion: Milestone[] } {
  const streakMilestones = STREAK_MILESTONES.filter(m => currentStreak >= m.threshold);
  const completionMilestones = COMPLETION_MILESTONES.filter(m => totalCompletions >= m.threshold);
  
  return {
    streak: streakMilestones,
    completion: completionMilestones,
  };
}

// Get next milestone to unlock
export function getNextMilestone(
  current: number,
  milestones: Milestone[]
): Milestone | null {
  const next = milestones.find(m => current < m.threshold);
  return next || null;
}
