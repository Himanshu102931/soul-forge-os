// Fair Habit Mastery Scaling System
// Goal: 100 Mastery XP = 1 Level
// Daily habits (freq=7) and Weekly habits (freq=1) level at same rate

export interface MasteryInfo {
  level: number;
  currentXP: number;
  maxXP: number;
  progressPercent: number;
}

// XP per completion based on frequency
// Weekly habit (1 day): 100 XP per completion
// Daily habit (7 days): ~15 XP per completion
// This normalizes so both reach level 1 after ~1 week of perfect completion
export function getMasteryXPPerCompletion(frequencyDaysCount: number): number {
  if (frequencyDaysCount <= 0) return 0;
  // Base: 100 XP for weekly (1 day), scales down for more frequent habits
  return Math.round(100 / frequencyDaysCount);
}

// Calculate mastery info from total completions and frequency
export function calculateMasteryInfo(
  totalCompletions: number,
  partialCompletions: number,
  frequencyDaysCount: number
): MasteryInfo {
  const xpPerComplete = getMasteryXPPerCompletion(frequencyDaysCount);
  const xpPerPartial = Math.round(xpPerComplete * 0.5); // 50% for partial
  
  const totalXP = (totalCompletions * xpPerComplete) + (partialCompletions * xpPerPartial);
  const XP_PER_LEVEL = 100;
  
  const level = Math.floor(totalXP / XP_PER_LEVEL);
  const currentXP = totalXP % XP_PER_LEVEL;
  const progressPercent = (currentXP / XP_PER_LEVEL) * 100;
  
  return {
    level,
    currentXP,
    maxXP: XP_PER_LEVEL,
    progressPercent
  };
}

// Legacy level calculation for backwards compatibility
export function calculateFairMasteryLevel(
  totalCompletions: number,
  frequencyDaysCount: number
): number {
  const info = calculateMasteryInfo(totalCompletions, 0, frequencyDaysCount);
  return info.level;
}
