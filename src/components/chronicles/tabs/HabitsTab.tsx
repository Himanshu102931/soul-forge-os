import { useDayHabitLogs, useToggleHistoricalHabit } from '@/hooks/useChronicles';
import { useAllHabits, Habit } from '@/hooks/useHabits';
import { Shield, Check, Circle, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HabitStatus, getNextHabitStatus } from '@/lib/rpg-utils';

interface HabitsTabProps {
  date: string;
}

export function HabitsTab({ date }: HabitsTabProps) {
  const { data: habitLogs } = useDayHabitLogs(date);
  const { data: allHabits } = useAllHabits();
  const toggleHabit = useToggleHistoricalHabit();

  // Get day of week for the selected date (0-6, Sunday-Saturday)
  const selectedDayOfWeek = new Date(date).getDay();

  const getHabitStatus = (habitId: string): HabitStatus => {
    const log = habitLogs?.find(l => l.habit_id === habitId);
    return log?.status || null;
  };

  const handleToggle = (habit: Habit) => {
    const currentStatus = getHabitStatus(habit.id);
    toggleHabit.mutate({
      habitId: habit.id,
      date,
      currentStatus,
      isBadHabit: habit.is_bad_habit,
      xpReward: habit.xp_reward || 10,
    });
  };

  // GHOST HABIT FIX: Filter archived habits FIRST, then by frequency_days for the selected date
  const regularHabits = allHabits?.filter(h => 
    !h.archived && !h.is_bad_habit && h.frequency_days.includes(selectedDayOfWeek)
  ) || [];
  
  // Bad habits are always shown (resistance applies every day) - but exclude archived
  const badHabits = allHabits?.filter(h => !h.archived && h.is_bad_habit) || [];

  const getStatusIcon = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-3 h-3" />;
      case 'partial':
        return <Circle className="w-3 h-3 fill-current" />;
      case 'skipped':
        return <Pause className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'partial':
        return 'bg-yellow-500 text-white';
      case 'skipped':
        return 'bg-blue-500 text-white';
      default:
        return 'border border-muted-foreground';
    }
  };

  const getCardStyles = (status: HabitStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 border border-emerald-500/30';
      case 'partial':
        return 'bg-yellow-500/10 border border-yellow-500/30';
      case 'skipped':
        return 'bg-blue-500/10 border border-blue-500/30';
      default:
        return 'bg-secondary/50';
    }
  };

  const getXPLabel = (status: HabitStatus, xpReward: number) => {
    switch (status) {
      case 'completed':
        return `+${xpReward} XP`;
      case 'partial':
        return `+${Math.floor(xpReward / 2)} XP`;
      case 'skipped':
        return 'Skipped';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Regular Habits - Full toggle cycle */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Protocols <span className="text-xs opacity-70">({new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})</span>
        </h4>
        <div className="space-y-2">
          {regularHabits.map(habit => {
            const status = getHabitStatus(habit.id);
            const xpLabel = getXPLabel(status, habit.xp_reward || 10);
            
            return (
              <button
                key={habit.id}
                onClick={() => handleToggle(habit)}
                disabled={toggleHabit.isPending}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  "hover:bg-secondary",
                  getCardStyles(status)
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center",
                  getStatusStyles(status)
                )}>
                  {getStatusIcon(status)}
                </div>
                <span className={cn(
                  "flex-1",
                  status === 'completed' && "text-emerald-400",
                  status === 'partial' && "text-yellow-400",
                  status === 'skipped' && "text-blue-400"
                )}>
                  {habit.title}
                </span>
                {xpLabel && (
                  <span className={cn(
                    "text-xs",
                    status === 'completed' && "text-emerald-400",
                    status === 'partial' && "text-yellow-400",
                    status === 'skipped' && "text-blue-400"
                  )}>
                    {xpLabel}
                  </span>
                )}
              </button>
            );
          })}
          {regularHabits.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No habits scheduled for this day
            </p>
          )}
        </div>
      </div>

      {/* Bad Habits (Resistance) */}
      {badHabits.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Resistance</h4>
          <div className="space-y-2">
            {badHabits.map(habit => {
              const status = getHabitStatus(habit.id);
              const isResisted = status === 'completed';
              
              return (
                <button
                  key={habit.id}
                  onClick={() => handleToggle(habit)}
                  disabled={toggleHabit.isPending}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    "bg-secondary/50 hover:bg-secondary",
                    isResisted && "bg-blue-500/10 border border-blue-500/30"
                  )}
                >
                  <Shield className={cn(
                    "w-5 h-5",
                    isResisted ? "text-blue-400 fill-blue-400/30" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "flex-1",
                    isResisted && "text-blue-400"
                  )}>
                    {habit.title}
                  </span>
                  {isResisted && (
                    <span className="text-xs text-blue-400">Resisted</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
