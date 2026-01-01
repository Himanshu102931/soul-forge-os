-- Create app_role enum for habit status
CREATE TYPE public.habit_status AS ENUM ('completed', 'partial', 'skipped', 'missed');
CREATE TYPE public.task_priority AS ENUM ('high', 'medium', 'low');

-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  hp INTEGER NOT NULL DEFAULT 100,
  max_hp INTEGER NOT NULL DEFAULT 100,
  day_start_hour INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  is_bad_habit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Habit logs table
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status public.habit_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs" ON public.habit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.habits h WHERE h.id = habit_logs.habit_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own habit logs" ON public.habit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.habits h WHERE h.id = habit_logs.habit_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own habit logs" ON public.habit_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.habits h WHERE h.id = habit_logs.habit_id AND h.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own habit logs" ON public.habit_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.habits h WHERE h.id = habit_logs.habit_id AND h.user_id = auth.uid()
    )
  );

-- 4. Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  is_for_today BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Daily summaries table
CREATE TABLE public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  notes TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  hp_lost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily summaries" ON public.daily_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily summaries" ON public.daily_summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries" ON public.daily_summaries
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Metric logs table
CREATE TABLE public.metric_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  metric_id TEXT NOT NULL CHECK (metric_id IN ('sleep', 'steps')),
  date DATE NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_id, date)
);

ALTER TABLE public.metric_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metric logs" ON public.metric_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metric logs" ON public.metric_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metric logs" ON public.metric_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed user plan function
CREATE OR REPLACE FUNCTION public.seed_user_plan()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  habit_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO habit_count FROM public.habits WHERE user_id = auth.uid();
  
  IF habit_count = 0 THEN
    -- Daily habits (all days: 0-6)
    INSERT INTO public.habits (user_id, title, frequency_days, sort_order) VALUES
      (auth.uid(), 'Wake Up On Time', '{0,1,2,3,4,5,6}', 1),
      (auth.uid(), 'Morning Skin Routine', '{0,1,2,3,4,5,6}', 2),
      (auth.uid(), 'Morning Protein', '{0,1,2,3,4,5,6}', 3),
      (auth.uid(), 'Morning Reading', '{0,1,2,3,4,5,6}', 4),
      (auth.uid(), 'Physique: Gym Session', '{0,1,2,3,4,5,6}', 5),
      (auth.uid(), 'Physique: Track Lifts', '{0,1,2,3,4,5,6}', 6),
      (auth.uid(), 'Evening Protein', '{0,1,2,3,4,5,6}', 7),
      (auth.uid(), 'Evening Skin Routine', '{0,1,2,3,4,5,6}', 8),
      (auth.uid(), 'Evening Reading', '{0,1,2,3,4,5,6}', 9),
      (auth.uid(), 'Hydration (3L)', '{0,1,2,3,4,5,6}', 10);
    
    -- Weekly habits
    INSERT INTO public.habits (user_id, title, frequency_days, sort_order) VALUES
      (auth.uid(), 'Hair Oil', '{2,5}', 11),
      (auth.uid(), 'De-Tan Pack', '{2,5}', 12),
      (auth.uid(), 'Hair Wash', '{3,6}', 13),
      (auth.uid(), 'Video Editing', '{0}', 14),
      (auth.uid(), 'Clay Mask', '{0}', 15);
    
    -- Bad habits (Resistance)
    INSERT INTO public.habits (user_id, title, is_bad_habit, sort_order) VALUES
      (auth.uid(), 'No Sugar', true, 16),
      (auth.uid(), 'Instagram Doom Scrolling', true, 17),
      (auth.uid(), 'Mindless Consumption', true, 18);
  END IF;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON public.daily_summaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();