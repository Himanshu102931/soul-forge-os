import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GAMIFICATION_ACHIEVEMENTS, calculateUserLevel } from '@/lib/gamification-utils';
import { calculateMasteryInfo } from '@/lib/mastery-utils';

export type DateRangeOption = '7days' | '30days' | '3months' | 'all' | 'custom';

export interface ExportOptions {
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  format: 'json' | 'csv';
}

// Enhanced interfaces for comprehensive export
interface ProfileData {
  id: string;
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  day_start_hour: number;
  created_at: string;
  updated_at: string;
}

interface HabitWithStats {
  id: string;
  title: string;
  description: string | null;
  is_bad_habit: boolean;
  frequency_days: number[];
  xp_reward: number | null;
  sort_order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  // Computed stats
  type: string;
  mastery_level: number;
  mastery_xp: number;
  mastery_xp_to_next: number;
  total_completions: number;
  total_partials: number;
  total_skipped: number;
  total_missed: number;
  completion_rate: number;
  current_streak: number;
}

interface EnrichedHabitLog {
  id: string;
  date: string;
  habit_id: string;
  habit_title: string;
  habit_type: string;
  status: string;
  xp_earned: number;
  created_at: string;
}

interface TaskComplete {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  completed: boolean;
  is_for_today: boolean;
  due_date: string | null;
  completed_at: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

interface DailySummaryComplete {
  id: string;
  date: string;
  mood_score: number | null;
  mood_label: string;
  notes: string | null;
  xp_earned: number;
  hp_lost: number;
  ai_response: string | null;
  habits_completed: number;
  habits_total: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
}

interface MetricComplete {
  id: string;
  date: string;
  metric_id: string;
  metric_name: string;
  value: number;
  created_at: string;
}

interface UserStatistics {
  totalHabits: number;
  activeHabits: number;
  archivedHabits: number;
  protocolHabits: number;
  resistanceHabits: number;
  totalCompletions: number;
  totalPartials: number;
  totalSkipped: number;
  totalMissed: number;
  currentStreak: number;
  longestStreak: number;
  perfectDaysCount: number;
  consistencyScore: number;
  totalXPEarned: number;
  totalHPLost: number;
  averageMoodScore: number | null;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  accountCreatedAt: string;
  daysActive: number;
  averageSleep: number | null;
  averageSteps: number | null;
}

interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  xp_reward: number;
  emoji: string;
  unlocked: boolean;
  progress: string;
}

interface AnalyticsSummary {
  xpByWeek: { week: string; xp: number }[];
  moodTrend: { date: string; mood: number | null; label: string }[];
  habitCompletionRates: { habit_title: string; rate: number }[];
  topPerformingHabits: string[];
  needsImprovementHabits: string[];
}

interface ExportData {
  profile: ProfileData;
  statistics: UserStatistics;
  habits: HabitWithStats[];
  habitLogs: EnrichedHabitLog[];
  tasks: TaskComplete[];
  dailySummaries: DailySummaryComplete[];
  metrics: MetricComplete[];
  achievements: AchievementProgress[];
  analytics: AnalyticsSummary;
  exportedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  appVersion: string;
}

// Helper functions
function getMoodLabel(score: number | null): string {
  if (score === null) return 'Not recorded';
  switch (score) {
    case 1: return 'Terrible';
    case 2: return 'Bad';
    case 3: return 'Okay';
    case 4: return 'Good';
    case 5: return 'Great';
    default: return 'Unknown';
  }
}

function getMetricName(metricId: string): string {
  switch (metricId) {
    case 'sleep_hours': return 'Sleep (hours)';
    case 'steps': return 'Steps';
    default: return metricId;
  }
}

function calculateCurrentStreak(logs: { date: string; status: string }[]): number {
  if (logs.length === 0) return 0;
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const log of sortedLogs) {
    if (log.status === 'completed' || log.status === 'partial') {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(logs: { date: string; status: string }[]): number {
  if (logs.length === 0) return 0;
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const log of sortedLogs) {
    if (log.status === 'completed' || log.status === 'partial') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}

function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

export function useDataExport() {
  const { user } = useAuth();
  const { toast } = useToast();

  const getDateRange = (option: DateRangeOption, customStart?: string, customEnd?: string) => {
    const today = new Date();
    let startDate: Date;
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (option) {
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'custom':
        startDate = new Date(customStart || today);
        if (customEnd) {
          const custom = new Date(customEnd);
          custom.setHours(23, 59, 59, 999);
          return {
            from: startDate.toISOString().split('T')[0],
            to: custom.toISOString().split('T')[0],
          };
        }
        break;
      case 'all':
      default:
        startDate = new Date('2000-01-01');
    }

    return {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0],
    };
  };

  const fetchAllData = async (options: ExportOptions): Promise<ExportData> => {
    if (!user) throw new Error('Not authenticated');

    const dateRange = getDateRange(
      options.dateRange,
      options.customStartDate,
      options.customEndDate
    );

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Fetch all habits
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order');

    if (habitsError) throw habitsError;

    // Fetch ALL habit logs (for statistics)
    const { data: allHabitLogs, error: allLogsError } = await supabase
      .from('habit_logs')
      .select('*')
      .in('habit_id', habits?.map(h => h.id) || [])
      .order('date', { ascending: false });

    if (allLogsError) throw allLogsError;

    // Filter habit logs for date range
    const habitLogs = (allHabitLogs || []).filter(log => 
      log.date >= dateRange.from && log.date <= dateRange.to
    );

    // Fetch all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    // Fetch ALL daily summaries (for statistics)
    const { data: allDailySummaries, error: allSummariesError } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (allSummariesError) throw allSummariesError;

    // Filter daily summaries for date range
    const dailySummaries = (allDailySummaries || []).filter(s => 
      s.date >= dateRange.from && s.date <= dateRange.to
    );

    // Fetch ALL metrics (for statistics)
    const { data: allMetrics, error: allMetricsError } = await supabase
      .from('metric_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (allMetricsError) throw allMetricsError;

    // Filter metrics for date range
    const metrics = (allMetrics || []).filter(m => 
      m.date >= dateRange.from && m.date <= dateRange.to
    );

    // Create habit lookup map
    const habitMap = new Map((habits || []).map(h => [h.id, h]));

    // Calculate habit stats
    const habitsWithStats: HabitWithStats[] = (habits || []).map(habit => {
      const habitLogs = (allHabitLogs || []).filter(l => l.habit_id === habit.id);
      const completions = habitLogs.filter(l => l.status === 'completed').length;
      const partials = habitLogs.filter(l => l.status === 'partial').length;
      const skipped = habitLogs.filter(l => l.status === 'skipped').length;
      const missed = habitLogs.filter(l => l.status === 'missed').length;
      const total = habitLogs.length;
      
      const frequencyCount = habit.frequency_days?.length || 7;
      const mastery = calculateMasteryInfo(completions, partials, frequencyCount);
      
      return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        is_bad_habit: habit.is_bad_habit,
        frequency_days: habit.frequency_days,
        xp_reward: habit.xp_reward,
        sort_order: habit.sort_order,
        archived: habit.archived,
        created_at: habit.created_at,
        updated_at: habit.updated_at,
        type: habit.is_bad_habit ? 'Resistance' : 'Protocol',
        mastery_level: mastery.level,
        mastery_xp: mastery.currentXP,
        mastery_xp_to_next: mastery.maxXP - mastery.currentXP,
        total_completions: completions,
        total_partials: partials,
        total_skipped: skipped,
        total_missed: missed,
        completion_rate: total > 0 ? Math.round((completions / total) * 100) : 0,
        current_streak: calculateCurrentStreak(habitLogs),
      };
    });

    // Enrich habit logs
    const enrichedHabitLogs: EnrichedHabitLog[] = habitLogs.map(log => {
      const habit = habitMap.get(log.habit_id);
      const xpEarned = log.status === 'completed' ? (habit?.xp_reward || 10) : 
                       log.status === 'partial' ? Math.floor((habit?.xp_reward || 10) / 2) : 0;
      
      return {
        id: log.id,
        date: log.date,
        habit_id: log.habit_id,
        habit_title: habit?.title || 'Unknown',
        habit_type: habit?.is_bad_habit ? 'Resistance' : 'Protocol',
        status: log.status,
        xp_earned: xpEarned,
        created_at: log.created_at,
      };
    });

    // Complete tasks
    const tasksComplete: TaskComplete[] = (tasks || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      completed: task.completed,
      is_for_today: task.is_for_today,
      due_date: task.due_date,
      completed_at: task.completed_at,
      archived: task.archived,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    // Enrich daily summaries with habit completion data
    const dailySummariesComplete: DailySummaryComplete[] = dailySummaries.map(summary => {
      const dayLogs = habitLogs.filter(l => l.date === summary.date);
      const completed = dayLogs.filter(l => l.status === 'completed').length;
      const total = dayLogs.length;
      
      return {
        id: summary.id,
        date: summary.date,
        mood_score: summary.mood_score,
        mood_label: getMoodLabel(summary.mood_score),
        notes: summary.notes,
        xp_earned: summary.xp_earned,
        hp_lost: summary.hp_lost,
        ai_response: summary.ai_response,
        habits_completed: completed,
        habits_total: total,
        completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        created_at: summary.created_at,
        updated_at: summary.updated_at,
      };
    });

    // Enrich metrics
    const metricsComplete: MetricComplete[] = metrics.map(metric => ({
      id: metric.id,
      date: metric.date,
      metric_id: metric.metric_id,
      metric_name: getMetricName(metric.metric_id),
      value: Number(metric.value),
      created_at: metric.created_at,
    }));

    // Calculate statistics
    const allLogs = allHabitLogs || [];
    const totalCompletions = allLogs.filter(l => l.status === 'completed').length;
    const totalPartials = allLogs.filter(l => l.status === 'partial').length;
    const totalSkipped = allLogs.filter(l => l.status === 'skipped').length;
    const totalMissed = allLogs.filter(l => l.status === 'missed').length;
    
    const allSummaries = allDailySummaries || [];
    const totalXPEarned = allSummaries.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
    const totalHPLost = allSummaries.reduce((sum, s) => sum + (s.hp_lost || 0), 0);
    
    const moodScores = allSummaries.filter(s => s.mood_score !== null).map(s => s.mood_score as number);
    const averageMoodScore = moodScores.length > 0 
      ? Math.round((moodScores.reduce((a, b) => a + b, 0) / moodScores.length) * 10) / 10 
      : null;

    // Calculate perfect days
    const logsByDate = new Map<string, { completed: number; total: number }>();
    allLogs.forEach(log => {
      const current = logsByDate.get(log.date) || { completed: 0, total: 0 };
      current.total++;
      if (log.status === 'completed') current.completed++;
      logsByDate.set(log.date, current);
    });
    const perfectDaysCount = Array.from(logsByDate.values()).filter(d => d.completed === d.total && d.total > 0).length;

    // Calculate consistency score (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = allLogs.filter(l => new Date(l.date) >= thirtyDaysAgo);
    const recentCompletions = recentLogs.filter(l => l.status === 'completed').length;
    const consistencyScore = recentLogs.length > 0 
      ? Math.round((recentCompletions / recentLogs.length) * 100) 
      : 0;

    // Calculate sleep and steps averages
    const allMetricsData = allMetrics || [];
    const sleepLogs = allMetricsData.filter(m => m.metric_id === 'sleep_hours');
    const stepsLogs = allMetricsData.filter(m => m.metric_id === 'steps');
    const averageSleep = sleepLogs.length > 0 
      ? Math.round((sleepLogs.reduce((sum, m) => sum + Number(m.value), 0) / sleepLogs.length) * 10) / 10 
      : null;
    const averageSteps = stepsLogs.length > 0 
      ? Math.round(stepsLogs.reduce((sum, m) => sum + Number(m.value), 0) / stepsLogs.length) 
      : null;

    const accountCreatedAt = profile.created_at;
    const daysActive = Math.floor((new Date().getTime() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24));

    const statistics: UserStatistics = {
      totalHabits: (habits || []).length,
      activeHabits: (habits || []).filter(h => !h.archived).length,
      archivedHabits: (habits || []).filter(h => h.archived).length,
      protocolHabits: (habits || []).filter(h => !h.is_bad_habit).length,
      resistanceHabits: (habits || []).filter(h => h.is_bad_habit).length,
      totalCompletions,
      totalPartials,
      totalSkipped,
      totalMissed,
      currentStreak: calculateCurrentStreak(allLogs),
      longestStreak: calculateLongestStreak(allLogs),
      perfectDaysCount,
      consistencyScore,
      totalXPEarned,
      totalHPLost,
      averageMoodScore,
      totalTasks: (tasks || []).length,
      completedTasks: (tasks || []).filter(t => t.completed).length,
      pendingTasks: (tasks || []).filter(t => !t.completed && !t.archived).length,
      accountCreatedAt,
      daysActive,
      averageSleep,
      averageSteps,
    };

    // Calculate achievement progress
    const userLevel = calculateUserLevel(profile.xp);
    const achievements: AchievementProgress[] = GAMIFICATION_ACHIEVEMENTS.map(achievement => {
      let unlocked = false;
      let progress = '';

      // Check conditions based on achievement type
      if (achievement.condition.includes('total_completions')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        unlocked = totalCompletions >= required;
        progress = `${totalCompletions}/${required} completions`;
      } else if (achievement.condition.includes('streak')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        unlocked = statistics.longestStreak >= required;
        progress = `${statistics.longestStreak}/${required} days`;
      } else if (achievement.condition.includes('xp')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        unlocked = profile.xp >= required;
        progress = `${profile.xp}/${required} XP`;
      } else if (achievement.condition.includes('level')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        unlocked = userLevel.level >= required;
        progress = `Level ${userLevel.level}/${required}`;
      } else if (achievement.condition.includes('perfect_days')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        unlocked = perfectDaysCount >= required;
        progress = `${perfectDaysCount}/${required} perfect days`;
      } else if (achievement.condition.includes('habits_per_day')) {
        const required = parseInt(achievement.condition.match(/\d+/)?.[0] || '0');
        const maxInDay = Math.max(...Array.from(logsByDate.values()).map(d => d.completed), 0);
        unlocked = maxInDay >= required;
        progress = `${maxInDay}/${required} habits in a day`;
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        rarity: achievement.rarity,
        xp_reward: achievement.xpReward,
        emoji: achievement.emoji,
        unlocked,
        progress,
      };
    });

    // Calculate analytics summary
    const xpByWeek: { week: string; xp: number }[] = [];
    const weekXpMap = new Map<string, number>();
    allSummaries.forEach(s => {
      const week = getWeekNumber(new Date(s.date));
      weekXpMap.set(week, (weekXpMap.get(week) || 0) + (s.xp_earned || 0));
    });
    weekXpMap.forEach((xp, week) => xpByWeek.push({ week, xp }));
    xpByWeek.sort((a, b) => a.week.localeCompare(b.week));

    const moodTrend = dailySummaries.map(s => ({
      date: s.date,
      mood: s.mood_score,
      label: getMoodLabel(s.mood_score),
    })).sort((a, b) => a.date.localeCompare(b.date));

    const habitCompletionRates = habitsWithStats
      .filter(h => !h.archived)
      .map(h => ({ habit_title: h.title, rate: h.completion_rate }))
      .sort((a, b) => b.rate - a.rate);

    const topPerformingHabits = habitCompletionRates.slice(0, 5).map(h => h.habit_title);
    const needsImprovementHabits = habitCompletionRates.slice(-5).reverse().map(h => h.habit_title);

    const analytics: AnalyticsSummary = {
      xpByWeek: xpByWeek.slice(-12), // Last 12 weeks
      moodTrend,
      habitCompletionRates,
      topPerformingHabits,
      needsImprovementHabits,
    };

    return {
      profile: profile as ProfileData,
      statistics,
      habits: habitsWithStats,
      habitLogs: enrichedHabitLogs,
      tasks: tasksComplete,
      dailySummaries: dailySummariesComplete,
      metrics: metricsComplete,
      achievements,
      analytics,
      exportedAt: new Date().toISOString(),
      dateRange,
      appVersion: '1.0.0',
    };
  };

  const convertToCSV = (data: ExportData): string => {
    const sections: string[] = [];
    const escapeCSV = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // EXPORT SUMMARY
    sections.push('=== EXPORT SUMMARY ===');
    sections.push(`Export Date,${escapeCSV(data.exportedAt)}`);
    sections.push(`Date Range,${escapeCSV(data.dateRange.from)} to ${escapeCSV(data.dateRange.to)}`);
    sections.push(`App Version,${escapeCSV(data.appVersion)}`);

    // USER PROFILE
    sections.push('\n=== USER PROFILE ===');
    sections.push('Level,XP,HP,Max HP,Day Start Hour,Account Created,Days Active');
    sections.push([
      data.profile.level,
      data.profile.xp,
      data.profile.hp,
      data.profile.max_hp,
      data.profile.day_start_hour,
      escapeCSV(data.profile.created_at.split('T')[0]),
      data.statistics.daysActive,
    ].join(','));

    // USER STATISTICS
    sections.push('\n=== USER STATISTICS ===');
    sections.push('Total Habits,Active Habits,Archived Habits,Protocol Habits,Resistance Habits,Total Completions,Total Partials,Total Skipped,Total Missed,Current Streak,Longest Streak,Perfect Days,Consistency Score (%),Total XP Earned,Total HP Lost,Average Mood,Total Tasks,Completed Tasks,Pending Tasks,Average Sleep (hrs),Average Steps');
    sections.push([
      data.statistics.totalHabits,
      data.statistics.activeHabits,
      data.statistics.archivedHabits,
      data.statistics.protocolHabits,
      data.statistics.resistanceHabits,
      data.statistics.totalCompletions,
      data.statistics.totalPartials,
      data.statistics.totalSkipped,
      data.statistics.totalMissed,
      data.statistics.currentStreak,
      data.statistics.longestStreak,
      data.statistics.perfectDaysCount,
      data.statistics.consistencyScore,
      data.statistics.totalXPEarned,
      data.statistics.totalHPLost,
      data.statistics.averageMoodScore ?? 'N/A',
      data.statistics.totalTasks,
      data.statistics.completedTasks,
      data.statistics.pendingTasks,
      data.statistics.averageSleep ?? 'N/A',
      data.statistics.averageSteps ?? 'N/A',
    ].join(','));

    // HABITS (with stats)
    sections.push('\n=== HABITS ===');
    sections.push('Title,Type,Frequency,XP Reward,Mastery Level,Total Completions,Completion Rate (%),Current Streak,Archived');
    data.habits.forEach(habit => {
      const freqStr = habit.frequency_days.length === 7 ? 'Daily' : habit.frequency_days.join('|');
      sections.push([
        escapeCSV(habit.title),
        habit.type,
        freqStr,
        habit.xp_reward || 10,
        habit.mastery_level,
        habit.total_completions,
        habit.completion_rate,
        habit.current_streak,
        habit.archived ? 'Yes' : 'No',
      ].join(','));
    });

    // HABIT LOGS (enriched)
    sections.push('\n=== HABIT LOGS ===');
    sections.push('Date,Habit Title,Type,Status,XP Earned');
    data.habitLogs.forEach(log => {
      sections.push([
        log.date,
        escapeCSV(log.habit_title),
        log.habit_type,
        log.status,
        log.xp_earned,
      ].join(','));
    });

    // TASKS
    sections.push('\n=== TASKS ===');
    sections.push('Title,Description,Priority,Status,Due Date,Completed At,Archived,Created At');
    data.tasks.forEach(task => {
      sections.push([
        escapeCSV(task.title),
        escapeCSV(task.description || ''),
        task.priority,
        task.completed ? 'Completed' : 'Pending',
        task.due_date || '',
        task.completed_at?.split('T')[0] || '',
        task.archived ? 'Yes' : 'No',
        task.created_at.split('T')[0],
      ].join(','));
    });

    // DAILY SUMMARIES
    sections.push('\n=== DAILY SUMMARIES ===');
    sections.push('Date,Mood,Mood Score,XP Earned,HP Lost,Habits Completed,Habits Total,Completion Rate (%),Drill Sergeant Says,Notes');
    data.dailySummaries.forEach(summary => {
      sections.push([
        summary.date,
        summary.mood_label,
        summary.mood_score ?? '',
        summary.xp_earned,
        summary.hp_lost,
        summary.habits_completed,
        summary.habits_total,
        summary.completion_rate,
        escapeCSV(summary.ai_response || ''),
        escapeCSV(summary.notes || ''),
      ].join(','));
    });

    // METRICS
    sections.push('\n=== METRICS ===');
    sections.push('Date,Metric,Value');
    data.metrics.forEach(metric => {
      sections.push([
        metric.date,
        metric.metric_name,
        metric.value,
      ].join(','));
    });

    // ACHIEVEMENTS
    sections.push('\n=== ACHIEVEMENTS ===');
    sections.push('Name,Category,Rarity,XP Reward,Status,Progress');
    data.achievements.forEach(achievement => {
      sections.push([
        escapeCSV(achievement.name),
        achievement.category,
        achievement.rarity,
        achievement.xp_reward,
        achievement.unlocked ? 'Unlocked' : 'Locked',
        escapeCSV(achievement.progress),
      ].join(','));
    });

    // WEEKLY XP TREND
    sections.push('\n=== WEEKLY XP TREND ===');
    sections.push('Week,XP Earned');
    data.analytics.xpByWeek.forEach(week => {
      sections.push(`${week.week},${week.xp}`);
    });

    // TOP PERFORMERS
    sections.push('\n=== TOP PERFORMING HABITS ===');
    data.analytics.topPerformingHabits.forEach((habit, i) => {
      sections.push(`${i + 1},${escapeCSV(habit)}`);
    });

    // NEEDS IMPROVEMENT
    sections.push('\n=== NEEDS IMPROVEMENT ===');
    data.analytics.needsImprovementHabits.forEach((habit, i) => {
      sections.push(`${i + 1},${escapeCSV(habit)}`);
    });

    return sections.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      const data = await fetchAllData(options);

      const timestamp = new Date()
        .toISOString()
        .split('T')[0];
      const dateRangeSuffix =
        options.dateRange === 'custom'
          ? `${options.customStartDate}_${options.customEndDate}`
          : options.dateRange;

      if (options.format === 'json') {
        const filename = `life-os-export-${dateRangeSuffix}-${timestamp}.json`;
        const jsonString = JSON.stringify(data, null, 2);
        downloadFile(jsonString, filename, 'application/json');
      } else {
        const filename = `life-os-export-${dateRangeSuffix}-${timestamp}.csv`;
        const csvString = convertToCSV(data);
        downloadFile(csvString, filename, 'text/csv');
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Export Successful',
        description: 'Your comprehensive data has been downloaded',
      });
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    },
  });
}
