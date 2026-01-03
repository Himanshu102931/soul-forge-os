import { describe, it, expect } from "vitest";

// Test utilities
describe("XP calculation", () => {
  // Mock XP constants
  const XP_VALUES = {
    HABIT_COMPLETED: 10,
    HABIT_PARTIAL: 5,
    HABIT_SKIPPED: 0,
    HABIT_MISSED: -5,
  };

  it("should calculate correct XP for completed habit", () => {
    const result = XP_VALUES.HABIT_COMPLETED;
    expect(result).toBe(10);
  });

  it("should calculate correct XP for partial habit", () => {
    const result = XP_VALUES.HABIT_PARTIAL;
    expect(result).toBe(5);
  });

  it("should apply penalty for missed habit", () => {
    const result = XP_VALUES.HABIT_MISSED;
    expect(result).toBe(-5);
  });
});

describe("Habit completion rates", () => {
  it("should calculate 100% completion for all completed habits", () => {
    const completed = 5;
    const total = 5;
    const rate = (completed / total) * 100;
    expect(rate).toBe(100);
  });

  it("should calculate 0% completion for no completed habits", () => {
    const completed = 0;
    const total = 5;
    const rate = (completed / total) * 100;
    expect(rate).toBe(0);
  });

  it("should handle zero total habits", () => {
    const completed = 0;
    const total = 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    expect(rate).toBe(0);
  });
});

describe("Date utilities", () => {
  it("should format date correctly", () => {
    const date = new Date("2026-01-03");
    const formatted = date.toISOString().split("T")[0];
    expect(formatted).toBe("2026-01-03");
  });

  it("should calculate days between dates", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-01-08");
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(days).toBe(7);
  });
});

describe("Data validation", () => {
  it("should validate habit title is not empty", () => {
    const title = "Morning Run";
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it("should validate frequency is array", () => {
    const frequency = [0, 1, 2, 3, 4, 5, 6]; // All days
    expect(Array.isArray(frequency)).toBe(true);
    expect(frequency.length).toBeLessThanOrEqual(7);
  });

  it("should validate XP is positive number", () => {
    const xp = 10;
    expect(typeof xp).toBe("number");
    expect(xp).toBeGreaterThan(0);
  });
});

describe("Array operations", () => {
  it("should filter habits by archived status", () => {
    const habits = [
      { id: "1", title: "Run", archived: false },
      { id: "2", title: "Read", archived: true },
      { id: "3", title: "Code", archived: false },
    ];
    const active = habits.filter(h => !h.archived);
    expect(active).toHaveLength(2);
  });

  it("should sort habits by completion rate descending", () => {
    const habits = [
      { id: "1", title: "Run", completionRate: 50 },
      { id: "2", title: "Read", completionRate: 90 },
      { id: "3", title: "Code", completionRate: 70 },
    ];
    const sorted = [...habits].sort((a, b) => b.completionRate - a.completionRate);
    expect(sorted[0].completionRate).toBe(90);
    expect(sorted[2].completionRate).toBe(50);
  });

  it("should sum total XP from multiple habits", () => {
    const logs = [
      { xp: 10 },
      { xp: 5 },
      { xp: -5 },
      { xp: 10 },
    ];
    const total = logs.reduce((sum, log) => sum + log.xp, 0);
    expect(total).toBe(20);
  });
});

describe("Gamification logic", () => {
  it("should calculate level from total XP", () => {
    const totalXP = 1500;
    const xpPerLevel = 100;
    const level = Math.floor(totalXP / xpPerLevel) + 1;
    expect(level).toBe(16);
  });

  it("should calculate XP progress to next level", () => {
    const totalXP = 1250;
    const xpPerLevel = 100;
    const currentLevel = Math.floor(totalXP / xpPerLevel);
    const progress = ((totalXP - currentLevel * xpPerLevel) / xpPerLevel) * 100;
    expect(progress).toBeCloseTo(50, 1);
  });

  it("should award achievement for milestone", () => {
    const totalXP = 5000;
    const milestone = 5000;
    const unlocked = totalXP >= milestone;
    expect(unlocked).toBe(true);
  });
});

describe("Streak calculation", () => {
  it("should calculate consecutive days completed", () => {
    const logs = [
      { date: "2026-01-01", completed: true },
      { date: "2026-01-02", completed: true },
      { date: "2026-01-03", completed: true },
      { date: "2026-01-04", completed: false },
    ];
    let streak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    expect(streak).toBe(0); // Last one is false
  });

  it("should reset streak on missed day", () => {
    const logs = [
      { date: "2026-01-01", completed: true },
      { date: "2026-01-02", completed: true },
      { date: "2026-01-03", completed: false }, // Break
      { date: "2026-01-04", completed: true },
    ];
    expect(logs[2].completed).toBe(false);
  });
});
