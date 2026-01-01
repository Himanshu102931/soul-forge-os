/**
 * Centralized Zod validation schemas for all form inputs
 * Ensures data quality before hitting database
 * 
 * Usage:
 *   const result = HabitFormSchema.safeParse(formData);
 *   if (result.success) { ... } else { ... result.error.issues ... }
 */

import { z } from 'zod';

// ============================================================================
// HABIT SCHEMAS
// ============================================================================

export const HabitFormSchema = z.object({
  name: z.string()
    .min(1, 'Habit name is required')
    .min(3, 'Habit name must be at least 3 characters')
    .max(100, 'Habit name must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default(''),
  
  xp: z.number()
    .min(1, 'XP must be at least 1')
    .max(1000, 'XP must be at most 1000')
    .int('XP must be a whole number')
    .default(10),
  
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Frequency must be daily, weekly, or monthly' })
  }).default('daily'),
  
  is_bad_habit: z.boolean().default(false),
  
  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .default(''),
  
  icon: z.string()
    .max(50, 'Icon must be less than 50 characters')
    .optional(),
});

export type HabitFormInput = z.infer<typeof HabitFormSchema>;

// For updates (all fields optional)
export const HabitUpdateSchema = HabitFormSchema.partial();

// For habit completion
export const HabitCompletionSchema = z.object({
  habit_id: z.string().uuid('Invalid habit ID'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  effort_level: z.enum(['easy', 'medium', 'hard']).optional(),
  date: z.date().default(() => new Date()),
});

export type HabitCompletionInput = z.infer<typeof HabitCompletionSchema>;

// ============================================================================
// TASK SCHEMAS
// ============================================================================

export const TaskFormSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .min(3, 'Task title must be at least 3 characters')
    .max(200, 'Task title must be less than 200 characters'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .default(''),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  
  dueDate: z.date().optional(),
  
  completed: z.boolean().default(false),
  
  linked_habit_id: z.string().uuid('Invalid habit ID').optional(),
});

export type TaskFormInput = z.infer<typeof TaskFormSchema>;

export const TaskUpdateSchema = TaskFormSchema.partial();

// ============================================================================
// METRIC SCHEMAS
// ============================================================================

export const MetricInputSchema = z.object({
  steps: z.number()
    .min(0, 'Steps must be at least 0')
    .int('Steps must be a whole number')
    .optional(),
  
  water: z.number()
    .min(0, 'Water must be at least 0')
    .max(99, 'Water must be less than 100')
    .optional(),
  
  mood: z.enum(['terrible', 'bad', 'okay', 'good', 'excellent']).optional(),
  
  sleep_hours: z.number()
    .min(0, 'Sleep must be at least 0 hours')
    .max(24, 'Sleep must be at most 24 hours')
    .optional(),
  
  sleep_quality: z.enum(['terrible', 'poor', 'fair', 'good', 'excellent']).optional(),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  
  date: z.date().default(() => new Date()),
});

export type MetricInput = z.infer<typeof MetricInputSchema>;

// ============================================================================
// AI & INTEGRATION SCHEMAS
// ============================================================================

export const AIConfigSchema = z.object({
  provider: z.enum(['gemini', 'openai', 'claude']).default('gemini'),
  
  apiKey: z.string()
    .min(10, 'API key must be at least 10 characters')
    .max(500, 'API key must be less than 500 characters'),
  
  enabled: z.boolean().default(true),
  
  model: z.string()
    .max(100, 'Model name must be less than 100 characters')
    .optional(),
});

export type AIConfigInput = z.infer<typeof AIConfigSchema>;

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const ProfileUpdateSchema = z.object({
  display_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  profile_image_url: z.string().url('Must be a valid URL').optional(),
  
  timezone: z.string()
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format')
    .optional(),
  
  theme: z.enum(['light', 'dark', 'auto']).optional(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// ============================================================================
// NIGHTLY REVIEW SCHEMAS
// ============================================================================

export const NightlyReviewSchema = z.object({
  date: z.date(),
  
  completed_habits: z.array(z.string().uuid()).default([]),
  
  skipped_habits: z.array(z.string().uuid()).default([]),
  
  mood: z.enum(['terrible', 'bad', 'okay', 'good', 'excellent']).optional(),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  
  xp_earned: z.number()
    .min(0, 'XP must be at least 0')
    .int('XP must be a whole number')
    .default(0),
});

export type NightlyReviewInput = z.infer<typeof NightlyReviewSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate habit form data and return errors if invalid
 */
export function validateHabitForm(data: unknown) {
  const result = HabitFormSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: !result.success ? result.error.flatten().fieldErrors : {},
  };
}

/**
 * Validate task form data and return errors if invalid
 */
export function validateTaskForm(data: unknown) {
  const result = TaskFormSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: !result.success ? result.error.flatten().fieldErrors : {},
  };
}

/**
 * Validate metric input and return errors if invalid
 */
export function validateMetricInput(data: unknown) {
  const result = MetricInputSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: !result.success ? result.error.flatten().fieldErrors : {},
  };
}

/**
 * Validate AI config and return errors if invalid
 */
export function validateAIConfig(data: unknown) {
  const result = AIConfigSchema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : null,
    errors: !result.success ? result.error.flatten().fieldErrors : {},
  };
}

/**
 * Get user-friendly error message from validation error
 */
export function getErrorMessage(fieldErrors: Record<string, unknown>): string {
  const firstError = Object.values(fieldErrors)[0];
  if (Array.isArray(firstError) && firstError.length > 0) {
    return String(firstError[0]);
  }
  return 'Invalid input. Please check your data.';
}
