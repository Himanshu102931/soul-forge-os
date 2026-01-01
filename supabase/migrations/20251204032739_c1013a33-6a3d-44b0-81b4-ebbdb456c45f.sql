-- Update seed_user_plan to include xp_reward values
CREATE OR REPLACE FUNCTION public.seed_user_plan()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  habit_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO habit_count FROM public.habits WHERE user_id = auth.uid();
  
  IF habit_count = 0 THEN
    -- Daily habits (all days: 0-6) - Medium difficulty (10 XP)
    INSERT INTO public.habits (user_id, title, frequency_days, sort_order, xp_reward) VALUES
      (auth.uid(), 'Wake Up On Time', '{0,1,2,3,4,5,6}', 1, 10),
      (auth.uid(), 'Morning Skin Routine', '{0,1,2,3,4,5,6}', 2, 5),
      (auth.uid(), 'Morning Protein', '{0,1,2,3,4,5,6}', 3, 5),
      (auth.uid(), 'Morning Reading', '{0,1,2,3,4,5,6}', 4, 10),
      (auth.uid(), 'Physique: Gym Session', '{0,1,2,3,4,5,6}', 5, 15),
      (auth.uid(), 'Physique: Track Lifts', '{0,1,2,3,4,5,6}', 6, 5),
      (auth.uid(), 'Evening Protein', '{0,1,2,3,4,5,6}', 7, 5),
      (auth.uid(), 'Evening Skin Routine', '{0,1,2,3,4,5,6}', 8, 5),
      (auth.uid(), 'Evening Reading', '{0,1,2,3,4,5,6}', 9, 10),
      (auth.uid(), 'Hydration (3L)', '{0,1,2,3,4,5,6}', 10, 10);
    
    -- Weekly habits with varying difficulty
    INSERT INTO public.habits (user_id, title, frequency_days, sort_order, xp_reward) VALUES
      (auth.uid(), 'Hair Oil', '{2,5}', 11, 5),
      (auth.uid(), 'De-Tan Pack', '{2,5}', 12, 5),
      (auth.uid(), 'Hair Wash', '{3,6}', 13, 5),
      (auth.uid(), 'Video Editing', '{0}', 14, 15),
      (auth.uid(), 'Clay Mask', '{0}', 15, 5);
    
    -- Bad habits (Resistance) - 10 XP for resisting
    INSERT INTO public.habits (user_id, title, is_bad_habit, sort_order, xp_reward) VALUES
      (auth.uid(), 'No Sugar', true, 16, 10),
      (auth.uid(), 'Instagram Doom Scrolling', true, 17, 10),
      (auth.uid(), 'Mindless Consumption', true, 18, 10);
  END IF;
END;
$function$;