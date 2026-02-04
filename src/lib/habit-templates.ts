/**
 * Habit Templates
 * Pre-defined habit plans for quick setup
 */

import { HabitCategory } from '@/hooks/useHabits';

export interface HabitTemplate {
  title: string;
  description: string | null;
  frequency_days: number[];
  xp_reward: number;
  is_bad_habit: boolean;
  category: HabitCategory;
}

export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  habits: HabitTemplate[];
}

export const HABIT_TEMPLATES: TemplatePack[] = [
  {
    id: 'productivity',
    name: 'Productivity Pack',
    description: 'Daily routines for maximum productivity',
    icon: '💙',
    habits: [
      {
        title: 'Morning Planning',
        description: 'Review goals and plan the day',
        frequency_days: [1, 2, 3, 4, 5], // Weekdays
        xp_reward: 10,
        is_bad_habit: false,
        category: 'productivity',
      },
      {
        title: 'Deep Work Session',
        description: '2 hours of focused work',
        frequency_days: [1, 2, 3, 4, 5],
        xp_reward: 15,
        is_bad_habit: false,
        category: 'productivity',
      },
      {
        title: 'Evening Review',
        description: 'Reflect on accomplishments',
        frequency_days: [1, 2, 3, 4, 5],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'productivity',
      },
      {
        title: 'Procrastination',
        description: 'Avoid procrastinating on important tasks',
        frequency_days: [],
        xp_reward: 10,
        is_bad_habit: true,
        category: 'productivity',
      },
    ],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Build a healthy lifestyle',
    icon: '💚',
    habits: [
      {
        title: 'Morning Workout',
        description: '30 minutes of exercise',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 15,
        is_bad_habit: false,
        category: 'health',
      },
      {
        title: 'Healthy Meals',
        description: 'Eat nutritious meals',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'health',
      },
      {
        title: 'Hydration',
        description: 'Drink 8 glasses of water',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 5,
        is_bad_habit: false,
        category: 'health',
      },
      {
        title: 'Junk Food',
        description: 'Avoid unhealthy snacks',
        frequency_days: [],
        xp_reward: 10,
        is_bad_habit: true,
        category: 'health',
      },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Mental health and awareness practices',
    icon: '🩵',
    habits: [
      {
        title: 'Morning Meditation',
        description: '10 minutes of mindfulness',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'wellness',
      },
      {
        title: 'Gratitude Journal',
        description: 'Write 3 things you\'re grateful for',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'wellness',
      },
      {
        title: 'Evening Reflection',
        description: 'Journal about your day',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'wellness',
      },
    ],
  },
  {
    id: 'learning',
    name: 'Learning',
    description: 'Continuous education and skill development',
    icon: '💛',
    habits: [
      {
        title: 'Reading',
        description: 'Read for 30 minutes',
        frequency_days: [0, 1, 2, 3, 4, 5, 6],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'learning',
      },
      {
        title: 'Online Course',
        description: 'Complete one lesson',
        frequency_days: [1, 2, 3, 4, 5],
        xp_reward: 15,
        is_bad_habit: false,
        category: 'learning',
      },
      {
        title: 'Practice Skills',
        description: 'Practice what you learned',
        frequency_days: [1, 2, 3, 4, 5],
        xp_reward: 10,
        is_bad_habit: false,
        category: 'learning',
      },
    ],
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Build and maintain relationships',
    icon: '💜',
    habits: [
      {
        title: 'Call Family',
        description: 'Check in with family members',
        frequency_days: [0, 3], // Sun, Wed
        xp_reward: 10,
        is_bad_habit: false,
        category: 'social',
      },
      {
        title: 'Meet Friends',
        description: 'Spend time with friends',
        frequency_days: [5, 6], // Fri, Sat
        xp_reward: 15,
        is_bad_habit: false,
        category: 'social',
      },
      {
        title: 'Networking',
        description: 'Connect with professionals',
        frequency_days: [1, 4], // Mon, Thu
        xp_reward: 10,
        is_bad_habit: false,
        category: 'social',
      },
      {
        title: 'Social Media Scroll',
        description: 'Avoid mindless scrolling',
        frequency_days: [],
        xp_reward: 5,
        is_bad_habit: true,
        category: 'social',
      },
    ],
  },
];
