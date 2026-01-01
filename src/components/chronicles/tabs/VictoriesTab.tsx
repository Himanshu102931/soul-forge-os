import { useDayCompletedTasks } from '@/hooks/useChronicles';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface VictoriesTabProps {
  date: string;
}

export function VictoriesTab({ date }: VictoriesTabProps) {
  const { data: tasks, isLoading } = useDayCompletedTasks(date);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          No tasks completed on this day
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-sm">{task.title}</span>
        </div>
      ))}
    </div>
  );
}
