// Gamification system: levels, XP, rewards
import { HabitLog } from '@/hooks/useHabits';

export interface UserLevel {
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  title: string;
  emoji: string;
}

export interface XPReward {
  habitId: string;
  amount: number;
  reason: string;
  bonus?: number;
}

// XP thresholds - increases exponentially
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
  11: 3250,
  12: 3850,
  13: 4500,
  14: 5200,
  15: 5950,
  16: 6750,
  17: 7600,
  18: 8500,
  19: 9450,
  20: 10500,
};

// Level titles based on progression
export const LEVEL_TITLES: Record<number, { title: string; emoji: string }> = {
  1: { title: 'Starter', emoji: '🌱' },
  2: { title: 'Novice', emoji: '📚' },
  3: { title: 'Apprentice', emoji: '🎯' },
  4: { title: 'Practitioner', emoji: '⚡' },
  5: { title: 'Adept', emoji: '🌟' },
  6: { title: 'Proficient', emoji: '💪' },
  7: { title: 'Expert', emoji: '🔥' },
  8: { title: 'Master', emoji: '👑' },
  9: { title: 'Sage', emoji: '🧙' },
  10: { title: 'Legend', emoji: '⭐' },
};

// Get title for any level
function getLevelTitle(level: number): { title: string; emoji: string } {
  // If level > 10, cycle through or use a scale
  if (level <= 10) {
    return LEVEL_TITLES[level] || { title: 'Master', emoji: '👑' };
  }
  
  const baseLevelEmojis = ['🌙', '☀️', '💎', '🏆', '🎖️'];
  const index = (level - 11) % baseLevelEmojis.length;
  return {
    title: `Legendary Level ${level}`,
    emoji: baseLevelEmojis[index]
  };
}

// Calculate current user level from total XP
export function calculateUserLevel(totalXP: number): UserLevel {
  let currentLevel = 1;
  
  // Find which level this XP amount qualifies for
  for (let level = 20; level >= 1; level--) {
    if (totalXP >= LEVEL_THRESHOLDS[level]) {
      currentLevel = level;
      break;
    }
  }

  // Calculate XP within current level
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[20] + 1000;
  
  const xpInCurrentLevel = totalXP - currentLevelThreshold;
  const xpToNextLevel = nextLevelThreshold - totalXP;

  const levelInfo = getLevelTitle(currentLevel);

  return {
    level: currentLevel,
    totalXP,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    xpInCurrentLevel,
    title: levelInfo.title,
    emoji: levelInfo.emoji
  };
}

// Calculate XP from habit completion
export function calculateCompletionXP(habitId: string, streak: number, isBonus: boolean = false): XPReward {
  // Base XP: 10 per completion
  let xp = 10;

  // Streak bonus: +2 per day streak (max 50 bonus)
  const streakBonus = Math.min(streak * 2, 50);
  xp += streakBonus;

  // Consistency bonus: Extra 15 XP
  const consistencyBonus = 15;
  xp += consistencyBonus;

  // First completion of the day: +5 bonus
  let totalBonus = 0;
  if (isBonus) {
    totalBonus += 5;
  }

  return {
    habitId,
    amount: xp,
    reason: 'Habit completed',
    bonus: totalBonus
  };
}

// Calculate total XP from habit logs
export function calculateTotalXP(habitLogs: HabitLog[]): number {
  const completedLogs = habitLogs.filter(log => log.status === 'completed');
  
  // Basic calculation: 10 XP per completion + bonuses
  const baseXP = completedLogs.length * 25; // 10 base + 15 consistency
  
  // Group by date to count daily completions
  const byDate: Record<string, number> = {};
  completedLogs.forEach(log => {
    byDate[log.date] = (byDate[log.date] || 0) + 1;
  });

  // Bonus XP for multiple daily completions
  let bonusXP = 0;
  Object.values(byDate).forEach(count => {
    if (count >= 3) bonusXP += 10; // 3+ habits = 10 bonus
    if (count >= 5) bonusXP += 15; // 5+ habits = 15 bonus
  });

  return baseXP + bonusXP;
}

// Check if user advanced levels
export function checkLevelUp(previousXP: number, newXP: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
  const previousLevel = calculateUserLevel(previousXP).level;
  const newLevel = calculateUserLevel(newXP).level;

  return {
    leveledUp: newLevel > previousLevel,
    newLevel,
    previousLevel
  };
}

// Generate achievement rewards
export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  emoji: string;
  condition: string;
  category: 'streak' | 'completion' | 'consistency' | 'combo' | 'xp' | 'level' | 'time' | 'challenge' | 'seasonal' | 'milestone' | 'health' | 'learning' | 'wellbeing' | 'social' | 'productivity' | 'growth' | 'creative' | 'rare';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  autoUnlock?: boolean;
}

export const GAMIFICATION_ACHIEVEMENTS: Achievement[] = [
  // MILESTONE (Auto-unlock)
  {
    id: 'first-habit',
    name: 'Getting Started',
    description: 'Complete your first habit',
    xpReward: 50,
    emoji: '🚀',
    condition: 'total_completions >= 1',
    category: 'milestone',
    rarity: 'common',
    autoUnlock: true
  },
  {
    id: 'first-completion',
    name: 'First Step',
    description: 'Completed your first habit',
    xpReward: 75,
    emoji: '👣',
    condition: 'total_completions >= 1',
    category: 'milestone',
    rarity: 'common',
    autoUnlock: true
  },

  // STREAK ACHIEVEMENTS (7-30 days)
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Completed a 7-day streak',
    xpReward: 100,
    emoji: '🔥',
    condition: 'streak >= 7',
    category: 'streak',
    rarity: 'common'
  },
  {
    id: 'getting-hot',
    name: 'Getting Hot',
    description: 'Completed a 14-day streak',
    xpReward: 150,
    emoji: '🌡️',
    condition: 'streak >= 14',
    category: 'streak',
    rarity: 'common'
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Completed a 21-day streak',
    xpReward: 200,
    emoji: '🔥🔥🔥',
    condition: 'streak >= 21',
    category: 'streak',
    rarity: 'rare'
  },
  {
    id: 'habit-master',
    name: 'Habit Master',
    description: 'Completed a 30-day streak',
    xpReward: 250,
    emoji: '👑',
    condition: 'streak >= 30',
    category: 'streak',
    rarity: 'rare'
  },

  // STREAK ACHIEVEMENTS (30-365 days)
  {
    id: 'two-months-strong',
    name: 'Two Months Strong',
    description: 'Completed a 60-day streak',
    xpReward: 350,
    emoji: '💪',
    condition: 'streak >= 60',
    category: 'streak',
    rarity: 'epic'
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Completed a 100-day streak',
    xpReward: 500,
    emoji: '💯',
    condition: 'streak >= 100',
    category: 'streak',
    rarity: 'epic'
  },
  {
    id: 'six-month-grind',
    name: 'Six Month Grind',
    description: 'Completed a 180-day streak',
    xpReward: 750,
    emoji: '⏳',
    condition: 'streak >= 180',
    category: 'streak',
    rarity: 'legendary'
  },
  {
    id: 'resolution-champion',
    name: 'Resolution Champion',
    description: 'Completed a 365-day streak',
    xpReward: 1000,
    emoji: '🎆',
    condition: 'streak >= 365',
    category: 'streak',
    rarity: 'legendary'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Completed a 500-day streak',
    xpReward: 1500,
    emoji: '⚡',
    condition: 'streak >= 500',
    category: 'streak',
    rarity: 'legendary'
  },
  {
    id: 'legendary-status',
    name: 'Legendary',
    description: 'Completed a 1000-day streak',
    xpReward: 2000,
    emoji: '🏆',
    condition: 'streak >= 1000',
    category: 'streak',
    rarity: 'legendary'
  },

  // COMPLETION MILESTONES
  {
    id: 'momentum-building',
    name: 'Momentum Building',
    description: 'Completed 50 total habits',
    xpReward: 125,
    emoji: '📈',
    condition: 'total_completions >= 50',
    category: 'completion',
    rarity: 'common'
  },
  {
    id: 'century-achiever',
    name: 'Century Achiever',
    description: 'Completed 100 total habits',
    xpReward: 200,
    emoji: '🎯',
    condition: 'total_completions >= 100',
    category: 'completion',
    rarity: 'rare'
  },
  {
    id: 'quarter-pounder',
    name: 'Quarter Pounder',
    description: 'Completed 250 total habits',
    xpReward: 350,
    emoji: '🥇',
    condition: 'total_completions >= 250',
    category: 'completion',
    rarity: 'epic'
  },
  {
    id: 'half-miler',
    name: 'Half-Miler',
    description: 'Completed 500 total habits',
    xpReward: 500,
    emoji: '🏅',
    condition: 'total_completions >= 500',
    category: 'completion',
    rarity: 'epic'
  },
  {
    id: 'thousand-times-better',
    name: 'Thousand Times Better',
    description: 'Completed 1000 total habits',
    xpReward: 800,
    emoji: '🌟',
    condition: 'total_completions >= 1000',
    category: 'completion',
    rarity: 'legendary'
  },
  {
    id: 'five-thousand',
    name: 'Five Thousand',
    description: 'Completed 5000 total habits',
    xpReward: 1500,
    emoji: '✨',
    condition: 'total_completions >= 5000',
    category: 'completion',
    rarity: 'legendary'
  },
  {
    id: 'dedication-incarnate',
    name: 'Dedication Incarnate',
    description: 'Completed 10000 total habits',
    xpReward: 2500,
    emoji: '👼',
    condition: 'total_completions >= 10000',
    category: 'completion',
    rarity: 'legendary'
  },

  // CONSISTENCY & PERFECT DAYS
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Completed all habits in one day',
    xpReward: 75,
    emoji: '✅',
    category: 'consistency',
    rarity: 'common',
    condition: 'daily_completion_rate >= 100'
  },
  {
    id: 'flawless-week',
    name: 'Flawless Week',
    description: 'Completed all habits for 7 days',
    xpReward: 200,
    emoji: '🎖️',
    category: 'consistency',
    rarity: 'rare',
    condition: 'consecutive_perfect_days >= 7'
  },
  {
    id: 'perfect-month',
    name: 'Perfect Month',
    description: 'Completed all habits for 30 days',
    xpReward: 450,
    emoji: '🏆',
    category: 'consistency',
    rarity: 'epic',
    condition: 'consecutive_perfect_days >= 30'
  },
  {
    id: 'zero-mistakes',
    name: 'Zero Mistakes',
    description: 'Completed 10 perfect days',
    xpReward: 150,
    emoji: '💎',
    category: 'consistency',
    rarity: 'rare',
    condition: 'total_perfect_days >= 10'
  },
  {
    id: 'precision-master',
    name: 'Precision Master',
    description: 'Completed 50 perfect days',
    xpReward: 350,
    emoji: '🎪',
    category: 'consistency',
    rarity: 'epic',
    condition: 'total_perfect_days >= 50'
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Completed 100 perfect days',
    xpReward: 600,
    emoji: '👑',
    category: 'consistency',
    rarity: 'legendary',
    condition: 'total_perfect_days >= 100'
  },

  // COMBO ACHIEVEMENTS
  {
    id: 'double-duty',
    name: 'Double Duty',
    description: 'Completed 2 habits in one day',
    xpReward: 50,
    emoji: '2️⃣',
    category: 'combo',
    rarity: 'common',
    condition: 'habits_per_day >= 2'
  },
  {
    id: 'triple-threat',
    name: 'Triple Threat',
    description: 'Completed 3 habits in one day',
    xpReward: 75,
    emoji: '3️⃣',
    category: 'combo',
    rarity: 'common',
    condition: 'habits_per_day >= 3'
  },
  {
    id: 'quad-squad',
    name: 'Quad Squad',
    description: 'Completed 4 habits in one day',
    xpReward: 100,
    emoji: '4️⃣',
    category: 'combo',
    rarity: 'rare',
    condition: 'habits_per_day >= 4'
  },
  {
    id: 'fantastic-five',
    name: 'Fantastic Five',
    description: 'Completed 5 habits in one day',
    xpReward: 150,
    emoji: '5️⃣',
    category: 'combo',
    rarity: 'rare',
    condition: 'habits_per_day >= 5'
  },
  {
    id: 'habit-hero',
    name: 'Habit Hero',
    description: 'Completed 6+ habits in one day',
    xpReward: 250,
    emoji: '🦸',
    category: 'combo',
    rarity: 'epic',
    condition: 'habits_per_day >= 6'
  },

  // XP MILESTONES
  {
    id: 'novice',
    name: 'Novice',
    description: 'Earned 100 XP',
    xpReward: 0,
    emoji: '🌱',
    category: 'xp',
    rarity: 'common',
    condition: 'total_xp >= 100'
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Earned 500 XP',
    xpReward: 0,
    emoji: '📚',
    category: 'xp',
    rarity: 'common',
    condition: 'total_xp >= 500'
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    description: 'Earned 1000 XP',
    xpReward: 0,
    emoji: '🧠',
    category: 'xp',
    rarity: 'rare',
    condition: 'total_xp >= 1000'
  },
  {
    id: 'expert-rank',
    name: 'Expert',
    description: 'Earned 5000 XP',
    xpReward: 0,
    emoji: '🎓',
    category: 'xp',
    rarity: 'rare',
    condition: 'total_xp >= 5000'
  },
  {
    id: 'master-rank',
    name: 'Master',
    description: 'Earned 10000 XP',
    xpReward: 0,
    emoji: '🥇',
    category: 'xp',
    rarity: 'epic',
    condition: 'total_xp >= 10000'
  },
  {
    id: 'legendary-scholar',
    name: 'Legendary Scholar',
    description: 'Earned 50000 XP',
    xpReward: 0,
    emoji: '📖✨',
    category: 'xp',
    rarity: 'legendary',
    condition: 'total_xp >= 50000'
  },

  // LEVEL MILESTONES
  {
    id: 'level-up',
    name: 'Level Up',
    description: 'Reached Level 5',
    xpReward: 0,
    emoji: '⬆️',
    category: 'level',
    rarity: 'common',
    condition: 'level >= 5'
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reached Level 10',
    xpReward: 0,
    emoji: '⭐',
    category: 'level',
    rarity: 'common',
    condition: 'level >= 10'
  },
  {
    id: 'climber',
    name: 'Climber',
    description: 'Reached Level 25',
    xpReward: 0,
    emoji: '🏔️',
    category: 'level',
    rarity: 'rare',
    condition: 'level >= 25'
  },
  {
    id: 'summit-seeker',
    name: 'Summit Seeker',
    description: 'Reached Level 50',
    xpReward: 0,
    emoji: '🏔️🏔️',
    category: 'level',
    rarity: 'epic',
    condition: 'level >= 50'
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle',
    description: 'Reached Level 100',
    xpReward: 0,
    emoji: '🚀',
    category: 'level',
    rarity: 'legendary',
    condition: 'level >= 100'
  },

  // TIME-BASED ACHIEVEMENTS
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Completed a habit before 8 AM',
    xpReward: 50,
    emoji: '🌅',
    category: 'time',
    rarity: 'common',
    condition: 'completion_before_8am >= 1'
  },
  {
    id: 'morning-glory',
    name: 'Morning Glory',
    description: 'Completed 10 habits before 8 AM',
    xpReward: 150,
    emoji: '🌄',
    category: 'time',
    rarity: 'rare',
    condition: 'completion_before_8am >= 10'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Completed a habit after 8 PM',
    xpReward: 50,
    emoji: '🌙',
    category: 'time',
    rarity: 'common',
    condition: 'completion_after_8pm >= 1'
  },
  {
    id: 'midnight-warrior',
    name: 'Midnight Warrior',
    description: 'Completed 10 habits after 8 PM',
    xpReward: 150,
    emoji: '🌌',
    category: 'time',
    rarity: 'rare',
    condition: 'completion_after_8pm >= 10'
  },
  {
    id: 'all-day-athlete',
    name: 'All-Day Athlete',
    description: 'Completed habits at different times',
    xpReward: 200,
    emoji: '⏰',
    category: 'time',
    rarity: 'rare',
    condition: 'time_variety >= 3'
  },

  // SPECIAL CHALLENGES
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Completed all habits on weekend',
    xpReward: 100,
    emoji: '🛡️',
    category: 'challenge',
    rarity: 'common',
    condition: 'weekend_completions >= 1'
  },
  {
    id: 'weekend-warrior-pro',
    name: 'Weekend Warrior Pro',
    description: 'Completed all habits on 10 weekends',
    xpReward: 350,
    emoji: '🛡️⚔️',
    category: 'challenge',
    rarity: 'epic',
    condition: 'weekend_completions >= 10'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Completed all habits within 2 hours',
    xpReward: 150,
    emoji: '⚡',
    category: 'challenge',
    rarity: 'rare',
    condition: 'speed_runs >= 1'
  },
  {
    id: 'quick-striker',
    name: 'Quick Striker',
    description: 'Completed all habits within 2 hours (5 times)',
    xpReward: 400,
    emoji: '🏃',
    category: 'challenge',
    rarity: 'epic',
    condition: 'speed_runs >= 5'
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Resumed a habit after breaking streak',
    xpReward: 100,
    emoji: '🔄',
    category: 'challenge',
    rarity: 'rare',
    condition: 'comebacks >= 1'
  },
  {
    id: 'phoenix-rising',
    name: 'Phoenix Rising',
    description: 'Resumed 5 habits after breaking streaks',
    xpReward: 350,
    emoji: '🔥🐦',
    category: 'challenge',
    rarity: 'epic',
    condition: 'comebacks >= 5'
  },
  {
    id: 'persistence',
    name: 'Persistence',
    description: 'Restarted and completed a streak 3 times',
    xpReward: 300,
    emoji: '💪',
    category: 'challenge',
    rarity: 'epic',
    condition: 'persistence_restarts >= 3'
  },

  // SEASONAL ACHIEVEMENTS
  {
    id: 'new-year-new-me',
    name: 'New Year, New Me',
    description: 'Started a habit on January 1st',
    xpReward: 200,
    emoji: '🎆',
    category: 'seasonal',
    rarity: 'rare',
    condition: 'started_on_jan_1 >= 1'
  },
  {
    id: 'spring-forward',
    name: 'Spring Forward',
    description: 'Completed 30-day streak in Spring',
    xpReward: 250,
    emoji: '🌸',
    category: 'seasonal',
    rarity: 'rare',
    condition: 'spring_30_day_streak >= 1'
  },
  {
    id: 'summer-sizzle',
    name: 'Summer Sizzle',
    description: 'Completed 30-day streak in Summer',
    xpReward: 250,
    emoji: '☀️',
    category: 'seasonal',
    rarity: 'rare',
    condition: 'summer_30_day_streak >= 1'
  },
  {
    id: 'fall-focus',
    name: 'Fall Focus',
    description: 'Completed 30-day streak in Fall',
    xpReward: 250,
    emoji: '🍂',
    category: 'seasonal',
    rarity: 'rare',
    condition: 'fall_30_day_streak >= 1'
  },
  {
    id: 'winter-warrior-season',
    name: 'Winter Warrior',
    description: 'Completed 30-day streak in Winter',
    xpReward: 250,
    emoji: '❄️',
    category: 'seasonal',
    rarity: 'rare',
    condition: 'winter_30_day_streak >= 1'
  },
  {
    id: 'four-seasons',
    name: 'Four Seasons',
    description: 'Completed 30-day streak in each season',
    xpReward: 1000,
    emoji: '🌍',
    category: 'seasonal',
    rarity: 'legendary',
    condition: 'all_seasons_completed >= 1'
  },

  // HEALTH ACHIEVEMENTS
  {
    id: 'sweat-equity',
    name: 'Sweat Equity',
    description: 'Completed 5 workout habits',
    xpReward: 125,
    emoji: '💦',
    category: 'health',
    rarity: 'common',
    condition: 'workout_completions >= 5'
  },
  {
    id: 'fitness-fiend',
    name: 'Fitness Fiend',
    description: 'Completed 50 workout habits',
    xpReward: 400,
    emoji: '🏃',
    category: 'health',
    rarity: 'epic',
    condition: 'workout_completions >= 50'
  },
  {
    id: 'nutrition-knowhow',
    name: 'Nutrition Know-How',
    description: 'Completed 10 nutrition habits',
    xpReward: 200,
    emoji: '🥗',
    category: 'health',
    rarity: 'rare',
    condition: 'nutrition_completions >= 10'
  },
  {
    id: 'sleep-champion',
    name: 'Sleep Champion',
    description: 'Completed 20 sleep habits',
    xpReward: 250,
    emoji: '😴',
    category: 'health',
    rarity: 'rare',
    condition: 'sleep_completions >= 20'
  },
  {
    id: 'wellness-warrior',
    name: 'Wellness Warrior',
    description: 'Completed 100 health habits',
    xpReward: 600,
    emoji: '🏥',
    category: 'health',
    rarity: 'epic',
    condition: 'health_completions >= 100'
  },

  // LEARNING & DEVELOPMENT
  {
    id: 'student-of-life',
    name: 'Student of Life',
    description: 'Completed 10 learning habits',
    xpReward: 150,
    emoji: '📖',
    category: 'learning',
    rarity: 'common',
    condition: 'learning_completions >= 10'
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Completed 50 learning habits',
    xpReward: 400,
    emoji: '🧠',
    category: 'learning',
    rarity: 'epic',
    condition: 'learning_completions >= 50'
  },
  {
    id: 'language-lover',
    name: 'Language Lover',
    description: 'Completed 30 language habits',
    xpReward: 350,
    emoji: '🗣️',
    category: 'learning',
    rarity: 'epic',
    condition: 'language_completions >= 30'
  },
  {
    id: 'skill-builder',
    name: 'Skill Builder',
    description: 'Completed 25 skill-development habits',
    xpReward: 300,
    emoji: '🛠️',
    category: 'learning',
    rarity: 'rare',
    condition: 'skill_completions >= 25'
  },

  // MINDFULNESS & WELLBEING
  {
    id: 'mindful-moment',
    name: 'Mindful Moment',
    description: 'Completed a meditation habit',
    xpReward: 50,
    emoji: '🧘',
    category: 'wellbeing',
    rarity: 'common',
    condition: 'meditation_completions >= 1'
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Completed 50 meditation habits',
    xpReward: 400,
    emoji: '🕉️',
    category: 'wellbeing',
    rarity: 'epic',
    condition: 'meditation_completions >= 50'
  },
  {
    id: 'gratitude-guru',
    name: 'Gratitude Guru',
    description: 'Completed 20 gratitude habits',
    xpReward: 250,
    emoji: '🙏',
    category: 'wellbeing',
    rarity: 'rare',
    condition: 'gratitude_completions >= 20'
  },
  {
    id: 'journal-junkie',
    name: 'Journal Junkie',
    description: 'Completed 30 journaling habits',
    xpReward: 300,
    emoji: '📔',
    category: 'wellbeing',
    rarity: 'rare',
    condition: 'journal_completions >= 30'
  },
  {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence',
    description: 'Completed 40 emotional wellness habits',
    xpReward: 450,
    emoji: '💖',
    category: 'wellbeing',
    rarity: 'epic',
    condition: 'emotional_completions >= 40'
  },

  // PRODUCTIVITY
  {
    id: 'focused',
    name: 'Focused',
    description: 'Completed habits without missing',
    xpReward: 100,
    emoji: '🎯',
    category: 'productivity',
    rarity: 'common',
    condition: 'zero_miss_days >= 5'
  },
  {
    id: 'time-management-expert',
    name: 'Time Management Expert',
    description: 'Completed 5+ habits on same day',
    xpReward: 150,
    emoji: '⏱️',
    category: 'productivity',
    rarity: 'rare',
    condition: 'max_habits_per_day >= 5'
  },
  {
    id: 'flow-state-master',
    name: 'Flow State Master',
    description: 'Completed 10 consecutive days perfectly',
    xpReward: 300,
    emoji: '🌊',
    category: 'productivity',
    rarity: 'epic',
    condition: 'perfect_streak >= 10'
  },

  // PERSONAL GROWTH
  {
    id: 'self-improver',
    name: 'Self-Improver',
    description: 'Started 3 self-improvement habits',
    xpReward: 150,
    emoji: '📈',
    category: 'growth',
    rarity: 'common',
    condition: 'growth_habits_created >= 3'
  },
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'Maintained 5 habits for 60 days each',
    xpReward: 750,
    emoji: '🦋',
    category: 'growth',
    rarity: 'legendary',
    condition: 'long_term_habits >= 5'
  },
  {
    id: 'better-every-day',
    name: 'Better Every Day',
    description: 'Achieved 80% completion rate',
    xpReward: 400,
    emoji: '➡️',
    category: 'growth',
    rarity: 'epic',
    condition: 'completion_rate >= 80'
  },
  {
    id: 'life-optimizer',
    name: 'Life Optimizer',
    description: 'Unlocked 50+ achievements',
    xpReward: 1000,
    emoji: '🚀',
    category: 'growth',
    rarity: 'legendary',
    condition: 'unlocked_achievements >= 50'
  },

  // CREATIVE ACHIEVEMENTS
  {
    id: 'creative-soul',
    name: 'Creative Soul',
    description: 'Completed 10 creative habits',
    xpReward: 150,
    emoji: '🎨',
    category: 'creative',
    rarity: 'common',
    condition: 'creative_completions >= 10'
  },
  {
    id: 'artist-path',
    name: 'Artist\'s Path',
    description: 'Completed 50 creative habits',
    xpReward: 400,
    emoji: '🖌️',
    category: 'creative',
    rarity: 'epic',
    condition: 'creative_completions >= 50'
  },
  {
    id: 'musical-mind',
    name: 'Musical Mind',
    description: 'Completed 30 music habits',
    xpReward: 350,
    emoji: '🎵',
    category: 'creative',
    rarity: 'epic',
    condition: 'music_completions >= 30'
  },
  {
    id: 'word-smith',
    name: 'Word Smith',
    description: 'Completed 25 writing habits',
    xpReward: 300,
    emoji: '✍️',
    category: 'creative',
    rarity: 'rare',
    condition: 'writing_completions >= 25'
  },

  // RARE ACHIEVEMENTS
  {
    id: 'habit-inception',
    name: 'Habit Inception',
    description: 'Completed 3 habits on first day',
    xpReward: 250,
    emoji: '🎬',
    category: 'rare',
    rarity: 'rare',
    condition: 'first_day_completions >= 3'
  },
  {
    id: 'perfect-start',
    name: 'Perfect Start',
    description: 'Completed all habits for first week',
    xpReward: 500,
    emoji: '🌟',
    category: 'rare',
    rarity: 'legendary',
    condition: 'perfect_first_week >= 1'
  },
  {
    id: 'no-looking-back',
    name: 'No Looking Back',
    description: 'Never broken a single streak',
    xpReward: 800,
    emoji: '🔒',
    category: 'rare',
    rarity: 'legendary',
    condition: 'perfect_record >= 1'
  },
  {
    id: 'habit-immortal',
    name: 'Habit Immortal',
    description: 'Maintained single habit for 2+ years',
    xpReward: 1200,
    emoji: '♾️',
    category: 'rare',
    rarity: 'legendary',
    condition: 'oldest_streak >= 730'
  },
];

// Progress toward next milestone
export function getNextMilestone(currentXP: number): { currentXP: number; targetXP: number; progressPercent: number; levelName: string } {
  const userLevel = calculateUserLevel(currentXP);
  const nextLevelThreshold = LEVEL_THRESHOLDS[userLevel.level + 1] || LEVEL_THRESHOLDS[20] + 1000;
  
  const progressPercent = (userLevel.xpInCurrentLevel / (nextLevelThreshold - LEVEL_THRESHOLDS[userLevel.level])) * 100;

  return {
    currentXP: userLevel.xpInCurrentLevel,
    targetXP: nextLevelThreshold - LEVEL_THRESHOLDS[userLevel.level],
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    levelName: userLevel.title
  };
}
