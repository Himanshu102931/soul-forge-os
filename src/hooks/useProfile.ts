import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevelThreshold, shouldLevelUp } from '@/lib/rpg-utils';
import { queryKeys, staleTimes } from '@/lib/query-config';

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
    queryKey: queryKeys.profile(user?.id || ''),
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
    staleTime: staleTimes.semiStatic, // 5 min - profile changes infrequently
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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
      const newMaxHP = profile.max_hp;
      
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
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
