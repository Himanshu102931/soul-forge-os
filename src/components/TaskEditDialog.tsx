import { useState, useEffect } from 'react';
import { Task, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
<<<<<<< HEAD
=======
import { TaskUpdateSchema } from '@/lib/validation';
>>>>>>> cf46c6e (Initial commit: project files)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    if (!task || !title.trim()) return;

    await updateTask.mutateAsync({
      id: task.id,
=======
    if (!task) return;
    
    // Validate form data
    const formData = {
>>>>>>> cf46c6e (Initial commit: project files)
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
<<<<<<< HEAD
=======
    };
    
    const validation = TaskUpdateSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    await updateTask.mutateAsync({
      id: task.id,
      ...validation.data,
>>>>>>> cf46c6e (Initial commit: project files)
    });

    toast({
      title: 'Task updated',
<<<<<<< HEAD
      description: title.trim(),
=======
      description: validation.data.title,
>>>>>>> cf46c6e (Initial commit: project files)
    });

    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    
    const taskTitle = task.title;
    await deleteTask.mutateAsync(task.id);
    onOpenChange(false);
    
    toast({
      title: 'Task deleted',
      description: taskTitle,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Note: For simplicity, we don't implement true undo here
            // A full implementation would need soft delete or task recreation
            toast({
              title: 'Undo not available',
              description: 'Task has been permanently deleted',
            });
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  const clearDueDate = () => {
    setDueDate(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle className="text-lg">Edit Task</DialogTitle>
=======
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
>>>>>>> cf46c6e (Initial commit: project files)
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v: 'high' | 'medium' | 'low') => setPriority(v)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <div className="flex gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start gap-2',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {dueDate ? format(dueDate, 'MMM d') : 'None'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearDueDate}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
