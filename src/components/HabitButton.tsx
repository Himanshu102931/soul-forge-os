import { motion } from 'framer-motion';
import { Check, Circle, Pause, Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HabitStatus, getNextHabitStatus, calculateLevelThreshold } from '@/lib/rpg-utils';
import { useUpdateHabitLog, HabitWithLog } from '@/hooks/useHabits';
import { useProfile } from '@/hooks/useProfile';
import { showXPFloater } from './XPFloater';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { memo } from 'react';

interface HabitButtonProps {
  habit: HabitWithLog;
}

// Calculate XP value for a given status
function getXPForStatus(status: HabitStatus, xpReward: number, isBadHabit: boolean): number {
  if (isBadHabit && status === 'completed') {
    return xpReward;
  }
  
  switch (status) {
    case 'completed':
      return xpReward;
    case 'partial':
      return Math.floor(xpReward / 2);
    default:
      return 0;
  }
}

export function HabitButton({ habit }: HabitButtonProps) {
  const updateLog = useUpdateHabitLog();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const currentStatus = habit.todayLog?.status || null;
  const xpReward = habit.xp_reward || 10;

  const handleClick = async (e: React.MouseEvent) => {
    if (!profile || !user) return;
    
    const nextStatus = getNextHabitStatus(currentStatus, habit.is_bad_habit);
    
    // Calculate XP difference: new state XP minus old state XP
    const prevXP = getXPForStatus(currentStatus, xpReward, habit.is_bad_habit);
    const newXP = getXPForStatus(nextStatus, xpReward, habit.is_bad_habit);
    const xpDiff = newXP - prevXP;
    
    // Calculate new XP and handle level changes
    let calculatedXP = profile.xp + xpDiff;
    let calculatedLevel = profile.level;
    let calculatedHP = profile.hp;
    
    // Handle level up (when gaining XP)
    if (xpDiff > 0) {
      while (calculatedXP >= calculateLevelThreshold(calculatedLevel)) {
        calculatedXP -= calculateLevelThreshold(calculatedLevel);
        calculatedLevel++;
        calculatedHP = profile.max_hp; // Restore HP on level up
      }
    }
    
    // Handle level down (when losing XP and XP goes negative)
    if (calculatedXP < 0 && calculatedLevel > 1) {
      calculatedLevel--;
      calculatedXP = calculateLevelThreshold(calculatedLevel) + calculatedXP; // Rollover
      if (calculatedXP < 0) calculatedXP = 0;
    }
    
    // Ensure XP never goes below 0
    calculatedXP = Math.max(0, calculatedXP);
    
    // Optimistic UI: Update profile immediately
    queryClient.setQueryData(['profile', user.id], (old: typeof profile) => {
      if (!old) return old;
      return { 
        ...old, 
        xp: calculatedXP, 
        level: calculatedLevel,
        hp: calculatedHP 
      };
    });
    
    // Show floater for positive XP gains only
    if (xpDiff > 0) {
      showXPFloater(e.clientX, e.clientY, xpDiff);
    }
    
    try {
      // Update habit log
      await updateLog.mutateAsync({ habitId: habit.id, status: nextStatus });
      
      // Persist XP/level change to database (skip addXP hook to avoid double counting)
      if (xpDiff !== 0) {
        await supabase
          .from('profiles')
          .update({
            xp: calculatedXP,
            level: calculatedLevel,
            hp: calculatedHP,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  };

  if (habit.is_bad_habit) {
    // Resistance habit - 2 states
    const isResisted = currentStatus === 'completed';
    
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 p-3.5 md:p-3 rounded-lg border transition-all w-full text-left min-h-[44px]',
          isResisted 
            ? 'bg-resistance/10 border-resistance' 
            : 'bg-secondary/50 border-border hover:border-muted-foreground'
        )}
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          isResisted ? 'bg-resistance text-white' : 'bg-muted text-muted-foreground'
        )}>
          {isResisted ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium break-words whitespace-normal hyphens-auto block">{habit.title}</span>
          <span className="text-xs text-muted-foreground">
            {isResisted ? 'Resisted' : 'Vulnerable'}
          </span>
        </div>
      </motion.button>
    );
  }

  // Good habit - 4 states
  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'partial':
        return <Circle className="w-4 h-4" />;
      case 'skipped':
        return <Pause className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusStyles = () => {
    switch (currentStatus) {
      case 'completed':
        return 'bg-primary text-primary-foreground border-primary';
      case 'partial':
        return 'bg-warning/20 text-warning border-warning';
      case 'skipped':
        return 'bg-resistance/20 text-resistance border-resistance';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3.5 md:p-3 rounded-lg border transition-all w-full text-left min-h-[44px]',
        currentStatus === 'completed' && 'bg-primary/5 border-primary/50',
        currentStatus === 'partial' && 'bg-warning/5 border-warning/50',
        currentStatus === 'skipped' && 'bg-resistance/5 border-resistance/50',
        !currentStatus && 'bg-secondary/50 border-border hover:border-muted-foreground'
      )}
    >
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
        getStatusStyles()
      )}>
        {getStatusIcon()}
      </div>
      <span className="text-sm font-medium flex-1 break-words whitespace-normal hyphens-auto">{habit.title}</span>
    </motion.button>
  );
}

export default memo(HabitButton);
