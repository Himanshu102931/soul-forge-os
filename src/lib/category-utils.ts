/**
 * Category Utilities
 * Provides color coding and display helpers for habit categories
 */

import { HabitCategory } from '@/hooks/useHabits';

export const CATEGORY_COLORS = {
  health: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-600',
    icon: '💚',
    label: 'Health',
  },
  productivity: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-600',
    icon: '💙',
    label: 'Productivity',
  },
  social: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-600',
    icon: '💜',
    label: 'Social',
  },
  learning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-600',
    icon: '💛',
    label: 'Learning',
  },
  wellness: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-600',
    icon: '🩵',
    label: 'Wellness',
  },
  other: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-600',
    icon: '⚪',
    label: 'Other',
  },
} as const;

export function getCategoryColor(category: HabitCategory) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
}

export function getCategoryBadge(category: HabitCategory) {
  const color = getCategoryColor(category);
  return {
    className: `${color.bg} ${color.border} ${color.text}`,
    icon: color.icon,
    label: color.label,
  };
}
