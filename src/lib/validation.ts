/**
<<<<<<< HEAD
 * Centralized Zod validation schemas for all form inputs
 * Ensures data quality before hitting database
 * 
 * Usage:
 *   const result = HabitFormSchema.safeParse(formData);
 *   if (result.success) { ... } else { ... result.error.issues ... }
=======
 * Validation Schemas
 * 
 * Centralized Zod validation schemas for all forms in the application.
 * Uses manual safeParse() for simple forms and integrates with React Hook Form for complex forms.
 * 
 * @see Session 7 - Input Validation feature implementation
>>>>>>> cf46c6e (Initial commit: project files)
 */

import { z } from 'zod';

// ============================================================================
<<<<<<< HEAD
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
=======
// HELPER TRANSFORMERS
// ============================================================================

/**
 * Transforms empty strings to null for optional database fields
 */
const emptyStringToNull = z.string().transform(s => s.trim() || null);

/**
 * Transforms empty strings to null and enforces max length
 */
const optionalText = (maxLength: number) => 
  z.string()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(s => s.trim() || null)
    .nullable();

// ============================================================================
// HABIT SCHEMAS
// ============================================================================

/**
 * Schema for creating/editing habits
 * Used in: HabitFormDialog.tsx
 */
export const HabitFormSchema = z.object({
  title: z.string()
    .min(1, 'Habit title is required')
    .max(100, 'Habit title must be 100 characters or less')
    .refine(val => val.trim().length > 0, {
      message: 'Habit title cannot be just whitespace'
    }),
  
  description: optionalText(10000),
  
  frequency_days: z.array(z.number().int().min(0).max(6))
    .max(7, 'Cannot select more than 7 days')
    .default([]),
  
  xp_reward: z.number()
    .int()
    .min(1, 'XP must be at least 1')
    .max(100, 'XP cannot exceed 100')
    .default(10),
  
  is_bad_habit: z.boolean().default(false),
  
  category: z.enum(['health', 'productivity', 'social', 'learning', 'wellness', 'other'])
    .default('other'),
});

export type HabitFormData = z.infer<typeof HabitFormSchema>;
>>>>>>> cf46c6e (Initial commit: project files)

// ============================================================================
// TASK SCHEMAS
// ============================================================================

<<<<<<< HEAD
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
=======
/**
 * Schema for creating tasks
 * Used in: AddTaskForm.tsx
 */
export const TaskFormSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be 200 characters or less')
    .refine(val => val.trim().length > 0, {
      message: 'Task title cannot be just whitespace'
    }),
  
  description: optionalText(10000),
  
  priority: z.enum(['high', 'medium', 'low'], {
    required_error: 'Priority is required',
  }).default('medium'),
  
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')
    .nullable()
    .optional(),
  
  is_for_today: z.boolean().default(false),
});

export type TaskFormData = z.infer<typeof TaskFormSchema>;

/**
 * Schema for updating tasks (all fields optional except title)
 * Used in: TaskEditDialog.tsx
 */
export const TaskUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .max(200, 'Task title must be 200 characters or less')
    .refine(val => val.trim().length > 0, {
      message: 'Task title cannot be just whitespace'
    }),
  
  description: optionalText(10000),
  
  priority: z.enum(['high', 'medium', 'low']),
  
  due_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)')
    .nullable()
    .optional(),
});

export type TaskUpdateData = z.infer<typeof TaskUpdateSchema>;

// ============================================================================
// METRICS SCHEMAS
// ============================================================================

/**
 * Schema for steps input (Dashboard, Chronicles, Nightly Review)
 * Used in: QuickMetrics.tsx, OverviewTab.tsx, NightlyReviewModal.tsx
 */
export const StepsInputSchema = z.object({
  steps: z.number()
    .int('Steps must be a whole number')
    .min(0, 'Steps cannot be negative')
    .max(100000, 'Steps cannot exceed 100,000')
    .or(z.string().transform(val => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    }))
});

export type StepsInputData = z.infer<typeof StepsInputSchema>;

/**
 * Schema for sleep hours input
 * Used in: SleepCalculator.tsx, OverviewTab.tsx, NightlyReviewModal.tsx
 */
export const SleepInputSchema = z.object({
  sleep: z.number()
    .min(0, 'Sleep hours cannot be negative')
    .max(24, 'Sleep hours cannot exceed 24')
    .or(z.string().transform(val => {
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    }))
});

export type SleepInputData = z.infer<typeof SleepInputSchema>;

/**
 * Combined metrics schema for forms that have both
 * Used in: NightlyReviewModal.tsx, OverviewTab.tsx
 */
export const MetricsInputSchema = z.object({
  steps: z.string()
    .transform(val => {
      if (!val || val.trim() === '') return null;
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Steps must be a valid number');
      return num;
    })
    .nullable()
    .refine(val => val === null || (val >= 0 && val <= 100000), {
      message: 'Steps must be between 0 and 100,000'
    }),
  
  sleep: z.string()
    .transform(val => {
      if (!val || val.trim() === '') return null;
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Sleep must be a valid number');
      return num;
    })
    .nullable()
    .refine(val => val === null || (val >= 0 && val <= 24), {
      message: 'Sleep hours must be between 0 and 24'
    }),
});

export type MetricsInputData = z.infer<typeof MetricsInputSchema>;
>>>>>>> cf46c6e (Initial commit: project files)

// ============================================================================
// NIGHTLY REVIEW SCHEMAS
// ============================================================================

<<<<<<< HEAD
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
=======
/**
 * Schema for Nightly Review Step 0 - Metrics
 * Used in: NightlyReviewModal.tsx
 */
export const NightlyReviewMetricsSchema = z.object({
  steps: z.string()
    .transform(val => {
      if (!val || val.trim() === '') return null;
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Steps must be a valid number');
      return num;
    })
    .nullable()
    .refine(val => val === null || (val >= 0 && val <= 100000), {
      message: 'Steps must be between 0 and 100,000'
    }),
  
  sleep: z.string()
    .transform(val => {
      if (!val || val.trim() === '') return null;
      const num = parseFloat(val);
      if (isNaN(num)) throw new Error('Sleep must be a valid number');
      return num;
    })
    .nullable()
    .refine(val => val === null || (val >= 0 && val <= 24), {
      message: 'Sleep hours must be between 0 and 24'
    }),
});

export type NightlyReviewMetricsData = z.infer<typeof NightlyReviewMetricsSchema>;

/**
 * Schema for Nightly Review Step 2 - Journal
 * Used in: NightlyReviewModal.tsx
 */
export const NightlyReviewJournalSchema = z.object({
  mood: z.number()
    .int('Mood must be a whole number')
    .min(1, 'Please select your mood')
    .max(5, 'Invalid mood value'),
  
  notes: optionalText(10000),
});

export type NightlyReviewJournalData = z.infer<typeof NightlyReviewJournalSchema>;

/**
 * Complete Nightly Review schema for full form submission
 * Used in: NightlyReviewModal.tsx
 */
export const NightlyReviewCompleteSchema = z.object({
  steps: z.string().nullable().optional(),
  sleep: z.string().nullable().optional(),
  mood: z.number().int().min(1).max(5),
  notes: z.string().max(10000).transform(s => s.trim() || null).nullable(),
});

export type NightlyReviewCompleteData = z.infer<typeof NightlyReviewCompleteSchema>;

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

/**
 * Schema for XP input in Settings
 * Used in: Settings.tsx
 */
export const SettingsXPSchema = z.object({
  xp: z.number()
    .int('XP must be a whole number')
    .min(0, 'XP cannot be negative')
    .max(999999, 'XP cannot exceed 999,999')
    .or(z.string().transform(val => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    }))
});

export type SettingsXPData = z.infer<typeof SettingsXPSchema>;

/**
 * Schema for HP input in Settings
 * Used in: Settings.tsx (if needed)
 */
export const SettingsHPSchema = z.object({
  hp: z.number()
    .int('HP must be a whole number')
    .or(z.string().transform(val => {
      const num = parseInt(val);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    }))
});

export type SettingsHPData = z.infer<typeof SettingsHPSchema>;

/**
 * Schema for Level adjustment in Settings
 * Used in: Settings.tsx
 */
export const SettingsLevelSchema = z.object({
  level: z.number()
    .int('Level must be a whole number')
    .min(1, 'Level must be at least 1')
});

export type SettingsLevelData = z.infer<typeof SettingsLevelSchema>;

// ============================================================================
// AUTH SCHEMAS (for reference/consistency)
// ============================================================================

/**
 * Schema for authentication (already implemented in Auth.tsx)
 * Included here for completeness and potential reuse
 */
export const AuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AuthData = z.infer<typeof AuthSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper to validate and return either data or error message
 * Usage: const { data, error } = validateSchema(HabitFormSchema, formData);
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): { data: z.infer<T> | null; error: string | null } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { data: result.data, error: null };
  } else {
    // Return first error message
    const firstError = result.error.errors[0];
    return { data: null, error: firstError.message };
  }
}

/**
 * Helper to get all error messages as an array
 */
export function getValidationErrors<T extends z.ZodType>(
  schema: T,
  data: unknown
): string[] {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return [];
  } else {
    return result.error.errors.map(err => err.message);
  }
>>>>>>> cf46c6e (Initial commit: project files)
}
