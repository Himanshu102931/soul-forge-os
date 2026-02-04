import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevelThreshold, shouldLevelUp } from '@/lib/rpg-utils';
<<<<<<< HEAD
import { queryKeys, staleTimes } from '@/lib/query-config';
=======
import { queryKeys, STALE_TIMES } from '@/lib/query-config';
>>>>>>> cf46c6e (Initial commit: project files)

export interface Profile {
  id: string;
  level: number;
  xp: number;
  hp: number;
  max_hp: number;
  day_start_hour: number;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
<<<<<<< HEAD
    queryKey: queryKeys.profile(user?.id || ''),
=======
    queryKey: user ? queryKeys.profile(user.id) : ['profile'],
    staleTime: STALE_TIMES.profile,
>>>>>>> cf46c6e (Initial commit: project files)
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
<<<<<<< HEAD
    staleTime: staleTimes.semiStatic, // 5 min - profile changes infrequently
=======
>>>>>>> cf46c6e (Initial commit: project files)
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['profile'] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
    },
  });
}

export function useAddXP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (xpAmount: number) => {
      if (!user || !profile) throw new Error('Not authenticated');
      
      // Support both positive and negative XP changes
      let newXP = Math.max(0, profile.xp + xpAmount);
      let newLevel = profile.level;
      let newHP = profile.hp;
<<<<<<< HEAD
      const newMaxHP = profile.max_hp;
=======
      let newMaxHP = profile.max_hp;
>>>>>>> cf46c6e (Initial commit: project files)
      
      // Check for level up (only on positive XP gains)
      if (xpAmount > 0) {
        while (shouldLevelUp(newXP, newLevel)) {
          newXP -= calculateLevelThreshold(newLevel);
          newLevel++;
          newHP = newMaxHP; // Restore HP on level up
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          xp: newXP,
          level: newLevel,
          hp: newHP,
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: data as Profile, xpGained: xpAmount, leveledUp: newLevel > profile.level };
    },
    onSuccess: () => {
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['profile'] });
=======
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      }
    },
  });
}

export function useReduceHP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (hpDamage: number) => {
      if (!user || !profile) throw new Error('Not authenticated');
      
      let newHP = profile.hp - hpDamage;
      let newLevel = profile.level;
      
      // Check for level down if HP <= 0
      if (newHP <= 0 && newLevel > 1) {
        newLevel--;
        newHP = 100; // Reset HP to 100 on level down
      } else {
        newHP = Math.max(newHP, 1); // Keep HP at minimum 1
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          hp: newHP,
          level: newLevel,
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: data as Profile, hpLost: hpDamage, leveledDown: newLevel < profile.level };
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.profile(user.id) });
      }
>>>>>>> cf46c6e (Initial commit: project files)
    },
  });
}

export function useSeedPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('seed_user_plan');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
