import { motion } from 'framer-motion';
import { useHorizonTasks, useCompleteTask, Task } from '@/hooks/useTasks';
import { useAddXP } from '@/hooks/useProfile';
import { isOverdue, isDueToday, formatDateShort } from '@/lib/time-utils';
import { LoadingList } from '@/components/ui/loading-skeleton';
import { Sunrise, CheckCircle2, Target, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { showXPFloater } from './XPFloater';
import { XP_PER_COMPLETE } from '@/lib/rpg-utils';

export function HorizonWidget() {
  const { data: tasks, isLoading } = useHorizonTasks();
  const completeTask = useCompleteTask();
  const addXP = useAddXP();

  const handleComplete = async (task: Task, e: React.MouseEvent) => {
    await completeTask.mutateAsync({ id: task.id, completed: true });
    
    // Award XP - same logic as main task list
    await addXP.mutateAsync(XP_PER_COMPLETE);
    showXPFloater(e.clientX, e.clientY, XP_PER_COMPLETE);
    
    toast({
      title: "Task completed",
      description: task.title,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => completeTask.mutate({ id: task.id, completed: false })}
        >
          Undo
        </Button>
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4">
        <LoadingList count={2} showCheckbox={false} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-3 sm:p-4"
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <Sunrise className="w-4 h-4 text-warning" />
        <h3 className="font-semibold text-xs sm:text-sm">Horizon</h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto">Next 3 days</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Horizon Clear. Enjoy the calm.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.slice(0, 4).map((task, index) => {
            const overdue = isOverdue(task.due_date!);
            const dueToday = isDueToday(task.due_date!);
            const isUrgent = overdue || dueToday;
            const isFromToday = task.is_for_today;
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 border-l-4 border',
                  isUrgent && 'border-l-destructive border-destructive/50 animate-pulse shadow-sm shadow-destructive/20',
                  !isUrgent && 'border-l-warning border-warning/30'
                )}
              >
                <Checkbox
                  className="border-muted-foreground"
                  onClick={(e) => handleComplete(task, e)}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm block break-words whitespace-normal">{task.title}</span>
                  {/* Source Badge */}
                  <div className="flex items-center gap-1 mt-1">
                    {isFromToday ? (
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs',
                        isUrgent ? 'text-destructive' : 'text-primary'
                      )}>
                        <Target className="w-3 h-3" />
                        Focus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Inbox className="w-3 h-3" />
                        Task Vault
                      </span>
                    )}
                  </div>
                </div>
                <span className={cn(
                  'text-xs font-medium shrink-0',
                  isUrgent && 'text-destructive',
                  !isUrgent && 'text-warning'
                )}>
                  {overdue ? 'Overdue' : dueToday ? 'Today' : formatDateShort(task.due_date!)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
