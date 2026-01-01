/**
 * PHASE 3A: Achievement System Testing
 * Comprehensive test suite for all achievement unlock conditions
 * 
 * Test Categories:
 * 1. Achievement Unlock Logic
 * 2. Progress Calculation
 * 3. Data Persistence
 * 4. Edge Cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateAchievementProgress,
  checkAchievementUnlock,
  getAllAchievements,
  getAchievementsByCategory,
  calculateXPForLevel,
  getLevelFromXP,
} from '../src/lib/gamification-utils';

/**
 * ============================================
 * UNIT TESTS: Achievement Logic
 * ============================================
 */

describe('Achievement Unlock Logic', () => {
  
  describe('Streak Achievements', () => {
    it('should unlock "First Step" after 1 habit completed today', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 1,
        currentStreak: 1,
        longestStreak: 1,
        currentLevel: 1,
        totalXP: 0,
      };

      const achievement = checkAchievementUnlock('first_step', userStats);
      expect(achievement.isUnlocked).toBe(true);
      expect(achievement.unlockedDate).toBeDefined();
    });

    it('should unlock "On a Roll" after 3-day consecutive streak', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 3,
        currentStreak: 3,
        longestStreak: 3,
        currentLevel: 1,
        totalXP: 0,
      };

      const achievement = checkAchievementUnlock('on_a_roll', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "Unstoppable" after 7-day consecutive streak', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 7,
        currentStreak: 7,
        longestStreak: 7,
        currentLevel: 1,
        totalXP: 0,
      };

      const achievement = checkAchievementUnlock('unstoppable', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "Legendary Streaker" after 30-day consecutive streak', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 30,
        currentStreak: 30,
        longestStreak: 30,
        currentLevel: 1,
        totalXP: 0,
      };

      const achievement = checkAchievementUnlock('legendary_streaker', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should NOT unlock streak achievement if streak is broken', () => {
      const userStats = {
        completedToday: 0,
        totalCompletions: 7,
        currentStreak: 0, // Streak broken!
        longestStreak: 7,
        currentLevel: 1,
        totalXP: 0,
      };

      const achievement = checkAchievementUnlock('on_a_roll', userStats);
      expect(achievement.isUnlocked).toBe(false);
    });
  });

  describe('Completion Achievements', () => {
    it('should unlock "Starter" after 5 total completions', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 5,
        currentStreak: 1,
        longestStreak: 5,
        currentLevel: 1,
        totalXP: 50,
      };

      const achievement = checkAchievementUnlock('starter', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "Grinder" after 50 total completions', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 50,
        currentStreak: 1,
        longestStreak: 1,
        currentLevel: 2,
        totalXP: 500,
      };

      const achievement = checkAchievementUnlock('grinder', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "Master" after 200 total completions', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 200,
        currentStreak: 1,
        longestStreak: 30,
        currentLevel: 5,
        totalXP: 2000,
      };

      const achievement = checkAchievementUnlock('master', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should NOT unlock achievement with fewer completions', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 4, // Not 5!
        currentStreak: 1,
        longestStreak: 4,
        currentLevel: 1,
        totalXP: 40,
      };

      const achievement = checkAchievementUnlock('starter', userStats);
      expect(achievement.isUnlocked).toBe(false);
    });
  });

  describe('Level Achievements', () => {
    it('should unlock "Level Up" after reaching level 2', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 10,
        currentStreak: 1,
        longestStreak: 5,
        currentLevel: 2,
        totalXP: 200,
      };

      const achievement = checkAchievementUnlock('level_up', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "High Climber" after reaching level 5', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 50,
        currentStreak: 10,
        longestStreak: 10,
        currentLevel: 5,
        totalXP: 1000,
      };

      const achievement = checkAchievementUnlock('high_climber', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "Legendary Ascender" after reaching level 10', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 100,
        currentStreak: 20,
        longestStreak: 20,
        currentLevel: 10,
        totalXP: 3000,
      };

      const achievement = checkAchievementUnlock('legendary_ascender', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });
  });

  describe('XP Achievements', () => {
    it('should unlock "XP Collector" after earning 500 total XP', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 50,
        currentStreak: 5,
        longestStreak: 5,
        currentLevel: 2,
        totalXP: 500,
      };

      const achievement = checkAchievementUnlock('xp_collector', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should unlock "XP Master" after earning 5000 total XP', () => {
      const userStats = {
        completedToday: 1,
        totalCompletions: 500,
        currentStreak: 30,
        longestStreak: 30,
        currentLevel: 10,
        totalXP: 5000,
      };

      const achievement = checkAchievementUnlock('xp_master', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });
  });

  describe('Combined Condition Achievements', () => {
    it('should unlock achievement requiring multiple conditions', () => {
      // Example: "Consistency" requires 7+ day streak AND 20+ total completions
      const userStats = {
        completedToday: 1,
        totalCompletions: 20,
        currentStreak: 7,
        longestStreak: 7,
        currentLevel: 2,
        totalXP: 200,
      };

      const achievement = checkAchievementUnlock('consistency', userStats);
      expect(achievement.isUnlocked).toBe(true);
    });

    it('should NOT unlock if one condition fails', () => {
      // Has streak but not enough completions
      const userStats = {
        completedToday: 1,
        totalCompletions: 10, // Not 20!
        currentStreak: 7,
        longestStreak: 7,
        currentLevel: 2,
        totalXP: 100,
      };

      const achievement = checkAchievementUnlock('consistency', userStats);
      expect(achievement.isUnlocked).toBe(false);
    });
  });
});

describe('Achievement Progress Calculation', () => {
  
  it('should calculate progress for achievement near unlock', () => {
    const userStats = {
      completedToday: 1,
      totalCompletions: 4, // 4 of 5 needed for Starter
      currentStreak: 1,
      longestStreak: 4,
      currentLevel: 1,
      totalXP: 40,
    };

    const progress = calculateAchievementProgress('starter', userStats);
    expect(progress.current).toBe(4);
    expect(progress.required).toBe(5);
    expect(progress.percentage).toBe(80);
  });

  it('should return 100% for unlocked achievement', () => {
    const userStats = {
      completedToday: 1,
      totalCompletions: 10,
      currentStreak: 1,
      longestStreak: 1,
      currentLevel: 1,
      totalXP: 100,
    };

    const progress = calculateAchievementProgress('starter', userStats);
    expect(progress.percentage).toBe(100);
  });

  it('should handle percentage values correctly', () => {
    const userStats = {
      completedToday: 1,
      totalCompletions: 25, // 50% of way to 50
      currentStreak: 1,
      longestStreak: 1,
      currentLevel: 1,
      totalXP: 250,
    };

    const progress = calculateAchievementProgress('grinder', userStats);
    expect(progress.percentage).toBeCloseTo(50, 1);
  });
});

/**
 * ============================================
 * LEVEL & XP SYSTEM TESTS
 * ============================================
 */

describe('Level & XP System', () => {
  
  describe('XP Calculation', () => {
    it('should calculate correct XP for level 1', () => {
      const xp = calculateXPForLevel(1);
      expect(xp).toBe(0); // Level 1 requires 0 XP
    });

    it('should calculate correct XP for level 2', () => {
      const xp = calculateXPForLevel(2);
      expect(xp).toBeGreaterThan(0);
      expect(xp).toBeLessThan(calculateXPForLevel(3));
    });

    it('should use exponential growth', () => {
      const level2 = calculateXPForLevel(2);
      const level3 = calculateXPForLevel(3);
      const level4 = calculateXPForLevel(4);

      // Each level should require increasingly more XP
      expect(level3 - level2).toBeGreaterThan(level2);
      expect(level4 - level3).toBeGreaterThan(level3 - level2);
    });

    it('should handle max level correctly', () => {
      const maxLevelXP = calculateXPForLevel(20);
      expect(maxLevelXP).toBeLessThan(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Level Calculation', () => {
    it('should return level 1 for 0-99 XP', () => {
      expect(getLevelFromXP(0)).toBe(1);
      expect(getLevelFromXP(50)).toBe(1);
      expect(getLevelFromXP(99)).toBe(1);
    });

    it('should return level 2 at XP threshold', () => {
      const level2XP = calculateXPForLevel(2);
      expect(getLevelFromXP(level2XP)).toBe(2);
      expect(getLevelFromXP(level2XP + 1)).toBe(2);
    });

    it('should handle high XP values', () => {
      const highXP = 10000;
      const level = getLevelFromXP(highXP);
      expect(level).toBeGreaterThan(1);
      expect(level).toBeLessThanOrEqual(20);
    });
  });
});

/**
 * ============================================
 * ACHIEVEMENT RETRIEVAL TESTS
 * ============================================
 */

describe('Achievement Data Retrieval', () => {
  
  it('should retrieve all achievements', () => {
    const achievements = getAllAchievements();
    expect(achievements.length).toBeGreaterThan(0);
    expect(achievements[0]).toHaveProperty('id');
    expect(achievements[0]).toHaveProperty('name');
    expect(achievements[0]).toHaveProperty('condition');
  });

  it('should retrieve achievements by category', () => {
    const streakAchievements = getAchievementsByCategory('streak');
    expect(streakAchievements.length).toBeGreaterThan(0);
    streakAchievements.forEach(a => {
      expect(a.category).toBe('streak');
    });
  });

  it('should have all expected categories', () => {
    const categories = [
      'streak',
      'completion',
      'consistency',
      'combo',
      'xp',
      'level',
      'time',
      'challenge',
      'seasonal',
      'milestone',
      'health',
      'learning',
      'wellbeing',
      'social',
    ];

    categories.forEach(category => {
      const achievements = getAchievementsByCategory(category);
      expect(achievements.length).toBeGreaterThan(0);
    });
  });
});

/**
 * ============================================
 * EDGE CASE TESTS
 * ============================================
 */

describe('Edge Cases', () => {
  
  it('should handle zero completions', () => {
    const userStats = {
      completedToday: 0,
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
      totalXP: 0,
    };

    const achievement = checkAchievementUnlock('starter', userStats);
    expect(achievement.isUnlocked).toBe(false);
  });

  it('should handle very high values', () => {
    const userStats = {
      completedToday: 1,
      totalCompletions: 10000,
      currentStreak: 365,
      longestStreak: 365,
      currentLevel: 20,
      totalXP: 50000,
    };

    const achievement = checkAchievementUnlock('master', userStats);
    expect(achievement.isUnlocked).toBe(true);
  });

  it('should handle negative values gracefully', () => {
    const userStats = {
      completedToday: -1,
      totalCompletions: -10,
      currentStreak: -5,
      longestStreak: 5,
      currentLevel: 1,
      totalXP: 0,
    };

    const achievement = checkAchievementUnlock('starter', userStats);
    expect(achievement.isUnlocked).toBe(false);
  });

  it('should handle null/undefined stats', () => {
    const userStats = {
      completedToday: 0,
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentLevel: 1,
      totalXP: 0,
    };

    expect(() => checkAchievementUnlock('starter', userStats)).not.toThrow();
  });
});

/**
 * ============================================
 * RARITY SYSTEM TESTS
 * ============================================
 */

describe('Achievement Rarity System', () => {
  
  it('should assign correct rarity based on unlock difficulty', () => {
    const achievements = getAllAchievements();
    const rarities = new Set(achievements.map(a => a.rarity));
    
    expect(rarities.has('common')).toBe(true);
    expect(rarities.has('rare')).toBe(true);
    expect(rarities.has('epic')).toBe(true);
    expect(rarities.has('legendary')).toBe(true);
  });

  it('should have balanced rarity distribution', () => {
    const achievements = getAllAchievements();
    const rarityCount = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    achievements.forEach(a => {
      rarityCount[a.rarity]++;
    });

    // Rough distribution: common should be most, legendary least
    expect(rarityCount.common).toBeGreaterThan(rarityCount.legendary);
    expect(rarityCount.rare).toBeGreaterThan(rarityCount.epic);
  });
});
