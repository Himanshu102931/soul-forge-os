export const XP_PER_COMPLETE = 10;
export const XP_PER_PARTIAL = 5;
export const XP_PER_RESISTANCE = 10;

export const HP_PER_MISSED_HABIT = 10;
export const HP_PER_INCOMPLETE_TASK = 5;

export function calculateLevelThreshold(level: number): number {
  // 1.1x curve: Level 1 = 100 XP, Level 2 = 110 XP, etc.
  return Math.floor(100 * Math.pow(1.1, level - 1));
}

export function calculateLevelProgress(xp: number, level: number): number {
  const threshold = calculateLevelThreshold(level);
  return Math.min((xp / threshold) * 100, 100);
}

export function shouldLevelUp(xp: number, level: number): boolean {
  return xp >= calculateLevelThreshold(level);
}

export function calculateHPDamage(missedHabits: number, incompleteTasks: number): number {
  return (missedHabits * HP_PER_MISSED_HABIT) + (incompleteTasks * HP_PER_INCOMPLETE_TASK);
}

export function calculateNewLevel(currentLevel: number, currentHP: number, damage: number): {
  level: number;
  hp: number;
  maxHp: number;
} {
  const newHP = currentHP - damage;
  
  if (newHP <= 0 && currentLevel > 1) {
    return {
      level: currentLevel - 1,
      hp: 100,
      maxHp: 100,
    };
  }
  
  return {
    level: currentLevel,
    hp: Math.max(newHP, 1),
    maxHp: 100,
  };
}

export type HabitStatus = 'completed' | 'partial' | 'skipped' | 'missed' | null;

export function getNextHabitStatus(current: HabitStatus, isBadHabit: boolean): HabitStatus {
  if (isBadHabit) {
    // Bad habits: null -> completed (resisted)
    return current === null ? 'completed' : null;
  }
  
  // Good habits: null -> completed -> partial -> skipped -> null
  switch (current) {
    case null:
      return 'completed';
    case 'completed':
      return 'partial';
    case 'partial':
      return 'skipped';
    case 'skipped':
      return null;
    default:
      return null;
  }
}

export function getXPForStatus(status: HabitStatus, isBadHabit: boolean): number {
  if (isBadHabit && status === 'completed') {
    return XP_PER_RESISTANCE;
  }
  
  switch (status) {
    case 'completed':
      return XP_PER_COMPLETE;
    case 'partial':
      return XP_PER_PARTIAL;
    default:
      return 0;
  }
}
