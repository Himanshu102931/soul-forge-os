import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Task, useCompleteTask, useMoveTask, useArchiveTask, useRestoreTask } from '@/hooks/useTasks';
import { useAddXP } from '@/hooks/useProfile';
import { showXPFloater } from './XPFloater';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Pencil, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateShort, isOverdue, isDueToday } from '@/lib/time-utils';
import { useToast } from '@/hooks/use-toast';
import { XP_PER_COMPLETE } from '@/lib/rpg-utils';
import { TaskEditDialog } from './TaskEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskCardProps {
  task: Task;
  showMoveRight?: boolean;
  showMoveLeft?: boolean;
}

export function TaskCard({ task, showMoveRight, showMoveLeft }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  
  const completeTask = useCompleteTask();
  const moveTask = useMoveTask();
  const archiveTask = useArchiveTask();
  const addXP = useAddXP();
  const { toast } = useToast();

  const overdue = task.due_date ? isOverdue(task.due_date) : false;
  const dueToday = task.due_date ? isDueToday(task.due_date) : false;
  
  // Task is locked to Today if due today or overdue
  const isLockedToToday = dueToday || overdue;

  // Check if description is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      setIsTruncated(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
    }
  }, [task.description]);

  const handleComplete = async (checked: boolean, e: React.MouseEvent) => {
    await completeTask.mutateAsync({ id: task.id, completed: checked });
    
    if (checked) {
      await addXP.mutateAsync(XP_PER_COMPLETE);
      showXPFloater(e.clientX, e.clientY, XP_PER_COMPLETE);
      
      toast({
        title: 'Task Completed',
        description: task.title,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => completeTask.mutate({ id: task.id, completed: false })}
            aria-label="Undo task completion"
          >
            Undo
          </Button>
        ),
      });
    }
  };

  const handleMove = (isForToday: boolean) => {
    moveTask.mutate({ id: task.id, is_for_today: isForToday });
  };

  const handleArchive = () => {
    archiveTask.mutate(task.id, {
      onSuccess: () => {
        toast({
          title: 'Task Archived',
          description: task.title,
        });
      },
    });
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-muted-foreground';
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          'group flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border border-l-4',
          getPriorityColor()
        )}
      >
        {showMoveLeft && !isLockedToToday && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 mt-0.5"
            onClick={() => handleMove(false)}
            aria-label="Move task to backlog"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}

        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => handleComplete(!!checked, {} as React.MouseEvent)}
          onClick={(e) => handleComplete(!task.completed, e)}
          className="shrink-0 mt-1"
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />

        <div className="flex-1 min-w-0">
          <span className={cn(
            'text-sm block break-words whitespace-normal',
            task.completed && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </span>
          {task.description && (
            <div 
              className="cursor-pointer"
              onClick={() => isTruncated && setIsExpanded(!isExpanded)}
            >
              <p 
                ref={descriptionRef}
                className={cn(
                  'text-xs text-muted-foreground mt-1 break-words whitespace-normal transition-all',
                  !isExpanded && 'line-clamp-2'
                )}
              >
                {task.description}
              </p>
              {isTruncated && (
                <span className="text-xs text-primary/70 hover:text-primary mt-0.5 inline-block">
                  {isExpanded ? 'Show less' : 'Show more'}
                </span>
              )}
            </div>
          )}
          {task.due_date && (
            <span className={cn(
              'text-xs mt-1 block',
              overdue && 'text-destructive font-medium',
              dueToday && !overdue && 'text-destructive font-medium',
              !overdue && !dueToday && 'text-muted-foreground'
            )}>
              {overdue ? 'Overdue' : dueToday ? 'Due today' : formatDateShort(task.due_date)}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 md:opacity-0 max-md:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          onClick={() => setArchiveDialogOpen(true)}
          aria-label={`Archive task: ${task.title}`}
        >
          <Archive className="w-4 h-4" aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setEditOpen(true)}
          aria-label={`Edit task: ${task.title}`}
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </Button>

        {showMoveRight && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleMove(true)}
            aria-label="Move task to today"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </motion.div>

      <TaskEditDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This task will be moved to your archives. You can restore it later from Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default memo(TaskCard);
