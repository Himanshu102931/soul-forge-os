/**
 * Settings - My System Section
 * Manage habits and load default plan
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Archive, RotateCcw, Trash2, Sparkles, Loader2, Clock } from 'lucide-react';
import { Habit } from '@/hooks/useHabits';
import { Task } from '@/hooks/useTasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MySystemSectionProps {
  activeHabits: Habit[];
  archivedHabits: Habit[];
  archivedTasks: Task[];
  isSeeding: boolean;
  dayStartHour?: number;
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onArchiveHabit: (id: string, archived: boolean) => void;
  onDeleteHabit: (id: string) => void;
  onRestoreTask: (id: string) => void;
  onSeedPlan: () => void;
  onDayStartHourChange?: (hour: number) => void;
}

export function MySystemSection({
  activeHabits,
  archivedHabits,
  archivedTasks,
  isSeeding,
  dayStartHour = 4,
  onAddHabit,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit,
  onRestoreTask,
  onSeedPlan,
  onDayStartHourChange,
}: MySystemSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Day Start Hour Setting */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <h4 className="font-medium">Day Start Hour</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Choose what hour your day starts. If it's before this hour, it counts as the previous day.
          For example, if set to 4 AM, then 2 AM counts as yesterday.
        </p>
        <Select 
          value={dayStartHour.toString()} 
          onValueChange={(value) => onDayStartHourChange?.(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select hour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">12 AM (Midnight)</SelectItem>
            <SelectItem value="1">1 AM</SelectItem>
            <SelectItem value="2">2 AM</SelectItem>
            <SelectItem value="3">3 AM</SelectItem>
            <SelectItem value="4">4 AM (Default)</SelectItem>
            <SelectItem value="5">5 AM</SelectItem>
            <SelectItem value="6">6 AM</SelectItem>
            <SelectItem value="7">7 AM</SelectItem>
            <SelectItem value="8">8 AM</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Manage Habits */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Manage Habits</h4>
          <Button size="sm" onClick={onAddHabit}>
            <Plus className="w-4 h-4 mr-1" />
            Add Habit
          </Button>
        </div>
        
        {activeHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active habits. Add one or load the default plan.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeHabits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{habit.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {habit.xp_reward || 10} XP
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditHabit(habit)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onArchiveHabit(habit.id, true)}>
                    <Archive className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load Plan */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h4 className="font-medium">Load My Plan</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Load the default habit plan with daily good habits and bad habits.
        </p>
        <Button size="sm" onClick={onSeedPlan} disabled={isSeeding}>
          {isSeeding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Load Plan
        </Button>
      </div>

      {/* Archived Habits */}
      {archivedHabits.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="font-medium mb-3">Archived Habits</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {archivedHabits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                <span className="text-sm truncate flex-1 text-muted-foreground">{habit.title}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onArchiveHabit(habit.id, false)}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDeleteHabit(habit.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archived Tasks */}
      {archivedTasks && archivedTasks.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-4">
          <h4 className="font-medium mb-3">Archived Tasks</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {archivedTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                <span className="text-sm truncate flex-1 text-muted-foreground">{task.title}</span>
                <Button variant="ghost" size="sm" onClick={() => onRestoreTask(task.id)}>
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
