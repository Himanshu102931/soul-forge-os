import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { queryKeys, staleTimes } from '@/lib/query-config';

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  notes: string | null;
  xp_earned: number;
  hp_lost: number;
  ai_response: string | null;
  created_at: string;
  updated_at: string;
}

export function useTodaySummary() {
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useQuery({
    queryKey: queryKeys.dailySummaries(user?.id || '', logicalDate, logicalDate),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', logicalDate)
        .maybeSingle();
      
      if (error) throw error;
      return data as DailySummary | null;
    },
    enabled: !!user,
    staleTime: staleTimes.realtime, // 30s - today's summary changes frequently
  });
}

export function useDailySummaries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.dailySummaries(user?.id || ''),
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as DailySummary[];
    },
    enabled: !!user,
    staleTime: staleTimes.historical, // 1 hour - past summaries don't change
  });
}

// Get last N days of summaries for AI context
export function useRecentSummaries(days: number = 7) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-summaries', user?.id, days], // Keep custom key for specific use case
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as DailySummary[];
    },
    enabled: !!user,
  });
}

export function useCreateDailySummary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logicalDate } = useLogicalDate();

  return useMutation({
    mutationFn: async (summary: Omit<DailySummary, 'id' | 'user_id' | 'date' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      // First, check if a summary already exists for today
      const { data: existing, error: fetchError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', logicalDate)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      // If it exists, we need to reverse the previous HP loss before applying new one
      // This prevents double HP subtraction
      if (existing) {
        // Get current profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;

        // Restore the HP that was previously lost
        const restoredHP = profile.hp + (existing.hp_lost || 0);
        
        // Now subtract the new HP loss
        const newHP = Math.max(1, restoredHP - summary.hp_lost);
        
        // Update profile with restored and new HP
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            hp: newHP,
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }

      // Now upsert the summary (last one wins)
      const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
          ...summary,
          user_id: user.id,
          date: logicalDate,
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as DailySummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
