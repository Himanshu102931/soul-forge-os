-- Add 'paused' status to habit_status enum
ALTER TYPE public.habit_status ADD VALUE IF NOT EXISTS 'paused';
