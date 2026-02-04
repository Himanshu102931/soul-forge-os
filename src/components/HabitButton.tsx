import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Check, Circle, Pause, Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HabitStatus, getNextHabitStatus, calculateLevelThreshold } from '@/lib/rpg-utils';
import { useUpdateHabitLog, HabitWithLog } from '@/hooks/useHabits';
=======
import { Check, Circle, Shield, ShieldCheck, Pause, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HabitStatus, getNextHabitStatus, calculateLevelThreshold, getHPDamageForHabitStatus } from '@/lib/rpg-utils';
import { useUpdateHabitLog, HabitWithLog, useHabitMastery, useHabitStreak } from '@/hooks/useHabits';
>>>>>>> cf46c6e (Initial commit: project files)
import { useProfile } from '@/hooks/useProfile';
import { showXPFloater } from './XPFloater';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
<<<<<<< HEAD
import { memo } from 'react';
=======
import { useToast } from '@/hooks/use-toast';
import { calculateMasteryInfo } from '@/lib/mastery-utils';
import { Badge } from '@/components/ui/badge';
>>>>>>> cf46c6e (Initial commit: project files)

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
<<<<<<< HEAD
  const queryClient = useQueryClient();
  const { user } = useAuth();
=======
  const { data: masteryData } = useHabitMastery(habit.id);
  const { data: currentStreak } = useHabitStreak(habit.id);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
>>>>>>> cf46c6e (Initial commit: project files)
  
  const currentStatus = habit.todayLog?.status || null;
  const xpReward = habit.xp_reward || 10;

<<<<<<< HEAD
  const handleClick = async (e: React.MouseEvent) => {
    if (!profile || !user) return;
    
=======
  // Calculate mastery level
  const frequencyCount = habit.frequency_days?.length || 7;
  const masteryInfo = masteryData 
    ? calculateMasteryInfo(
        masteryData.totalCompletions,
        masteryData.partialCompletions,
        frequencyCount
      )
    : null;

  const handleClick = async (e: React.MouseEvent) => {
    if (!profile || !user) return;
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

>>>>>>> cf46c6e (Initial commit: project files)
    const nextStatus = getNextHabitStatus(currentStatus, habit.is_bad_habit);
    
    // Calculate XP difference: new state XP minus old state XP
    const prevXP = getXPForStatus(currentStatus, xpReward, habit.is_bad_habit);
    const newXP = getXPForStatus(nextStatus, xpReward, habit.is_bad_habit);
    const xpDiff = newXP - prevXP;
    
<<<<<<< HEAD
    // Calculate new XP and handle level changes
    let calculatedXP = profile.xp + xpDiff;
    let calculatedLevel = profile.level;
    let calculatedHP = profile.hp;
=======
    // Calculate HP damage for skipped/missed habits
    const prevHPDamage = getHPDamageForHabitStatus(currentStatus);
    const newHPDamage = getHPDamageForHabitStatus(nextStatus);
    const hpDamageDiff = newHPDamage - prevHPDamage;
    
    // Calculate new XP and handle level changes
    let calculatedXP = profile.xp + xpDiff;
    let calculatedLevel = profile.level;
    let calculatedHP = profile.hp - hpDamageDiff;
>>>>>>> cf46c6e (Initial commit: project files)
    
    // Handle level up (when gaining XP)
    if (xpDiff > 0) {
      while (calculatedXP >= calculateLevelThreshold(calculatedLevel)) {
        calculatedXP -= calculateLevelThreshold(calculatedLevel);
        calculatedLevel++;
        calculatedHP = profile.max_hp; // Restore HP on level up
      }
    }
    
<<<<<<< HEAD
    // Handle level down (when losing XP and XP goes negative)
    if (calculatedXP < 0 && calculatedLevel > 1) {
      calculatedLevel--;
      calculatedXP = calculateLevelThreshold(calculatedLevel) + calculatedXP; // Rollover
      if (calculatedXP < 0) calculatedXP = 0;
=======
    // Handle level down (HP <= 0)
    if (calculatedHP <= 0 && calculatedLevel > 1) {
      calculatedLevel--;
      calculatedHP = 100; // Reset HP to 100 on level down
    } else {
      calculatedHP = Math.max(calculatedHP, 1); // Keep HP at minimum 1
>>>>>>> cf46c6e (Initial commit: project files)
    }
    
    // Ensure XP never goes below 0
    calculatedXP = Math.max(0, calculatedXP);
    
<<<<<<< HEAD
=======
    const leveledUp = calculatedLevel > profile.level;
    const leveledDown = calculatedLevel < profile.level;
    
>>>>>>> cf46c6e (Initial commit: project files)
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
      
<<<<<<< HEAD
      // Persist XP/level change to database (skip addXP hook to avoid double counting)
      if (xpDiff !== 0) {
=======
      // Persist XP/HP/level change to database
      if (xpDiff !== 0 || hpDamageDiff !== 0) {
>>>>>>> cf46c6e (Initial commit: project files)
        await supabase
          .from('profiles')
          .update({
            xp: calculatedXP,
            level: calculatedLevel,
            hp: calculatedHP,
          })
          .eq('id', user.id);
      }
<<<<<<< HEAD
=======
      
      // Show level change toasts
      if (leveledUp) {
        toast({
          title: '🎉 Level Up!',
          description: `You reached Level ${calculatedLevel}! HP restored.`,
        });
      } else if (leveledDown) {
        toast({
          title: '💀 Level Down',
          description: `You dropped to Level ${calculatedLevel}. HP reset to 100.`,
          variant: 'destructive',
        });
      }
>>>>>>> cf46c6e (Initial commit: project files)
    } catch (error) {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  };

  if (habit.is_bad_habit) {
<<<<<<< HEAD
    // Resistance habit - 2 states
=======
    // Resistance habit - 2 states (null, completed)
>>>>>>> cf46c6e (Initial commit: project files)
    const isResisted = currentStatus === 'completed';
    
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
<<<<<<< HEAD
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
=======
        whileHover={{ scale: 1.02 }}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left min-h-[56px]',
          isResisted && 'bg-resistance/10 border-resistance',
          !isResisted && 'bg-secondary/50 border-border hover:border-muted-foreground'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0',
          isResisted && 'bg-resistance text-white',
          !isResisted && 'bg-muted text-muted-foreground'
        )}>
          {isResisted ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <div>
            <span className="text-sm md:text-base font-medium break-words whitespace-normal hyphens-auto block">{habit.title}</span>
            <span className="text-xs text-muted-foreground">
              {isResisted ? 'Resisted' : 'Vulnerable'}
            </span>
          </div>
>>>>>>> cf46c6e (Initial commit: project files)
        </div>
      </motion.button>
    );
  }

<<<<<<< HEAD
  // Good habit - 4 states
=======
  // Good habit - 4 states (completed, partial, skipped, null)
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3.5 md:p-3 rounded-lg border transition-all w-full text-left min-h-[44px]',
=======
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left min-h-[56px]',
>>>>>>> cf46c6e (Initial commit: project files)
        currentStatus === 'completed' && 'bg-primary/5 border-primary/50',
        currentStatus === 'partial' && 'bg-warning/5 border-warning/50',
        currentStatus === 'skipped' && 'bg-resistance/5 border-resistance/50',
        !currentStatus && 'bg-secondary/50 border-border hover:border-muted-foreground'
      )}
    >
      <div className={cn(
<<<<<<< HEAD
        'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
=======
        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors shrink-0',
>>>>>>> cf46c6e (Initial commit: project files)
        getStatusStyles()
      )}>
        {getStatusIcon()}
      </div>
<<<<<<< HEAD
      <span className="text-sm font-medium flex-1 break-words whitespace-normal hyphens-auto">{habit.title}</span>
    </motion.button>
  );
}

export default memo(HabitButton);
=======
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm md:text-base font-medium break-words whitespace-normal hyphens-auto flex-1">{habit.title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {masteryInfo && masteryInfo.level > 0 && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              Lvl {masteryInfo.level}
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  );
}
>>>>>>> cf46c6e (Initial commit: project files)
