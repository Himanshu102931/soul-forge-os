import { useState } from 'react';
import { useCreateTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
<<<<<<< HEAD
=======
import { TaskFormSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
>>>>>>> cf46c6e (Initial commit: project files)
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
import { Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
<<<<<<< HEAD
import { TaskFormSchema } from '@/lib/validation';
=======
>>>>>>> cf46c6e (Initial commit: project files)

interface AddTaskFormProps {
  isForToday?: boolean;
}

export function AddTaskForm({ isForToday = false }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createTask = useCreateTask();
=======
  
  const createTask = useCreateTask();
  const { toast } = useToast();
>>>>>>> cf46c6e (Initial commit: project files)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
<<<<<<< HEAD
    // Validate using Zod schema
    const validation = TaskFormSchema.safeParse({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await createTask.mutateAsync({
=======
    // Validate form data
    const formData = {
>>>>>>> cf46c6e (Initial commit: project files)
      title: title.trim(),
      description: description.trim() || null,
      priority,
      is_for_today: isForToday,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
<<<<<<< HEAD
    });
=======
    };
    
    const validation = TaskFormSchema.safeParse(formData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    await createTask.mutateAsync(validation.data);
>>>>>>> cf46c6e (Initial commit: project files)

    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
<<<<<<< HEAD
        className="w-full justify-start gap-2 text-muted-foreground"
=======
        className="w-full justify-start gap-2 text-muted-foreground min-h-[44px]"
>>>>>>> cf46c6e (Initial commit: project files)
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Add task
      </Button>
    );
  }

  return (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-secondary/50 rounded-lg border border-border">
      <div>
        <Input
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="bg-background"
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>
      <div>
        <Textarea
          placeholder="Description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-background min-h-[60px] resize-none text-sm"
          rows={2}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Select value={priority} onValueChange={(v: 'high' | 'medium' | 'low') => setPriority(v)}>
          <SelectTrigger className="w-32 bg-background">
=======
    <form onSubmit={handleSubmit} className="space-y-3 p-3 md:p-4 bg-secondary/50 rounded-lg border border-border">
      <Input
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="bg-background min-h-[44px]"
      />
      <Textarea
        placeholder="Description (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="bg-background min-h-[80px] resize-none text-sm"
        rows={3}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={priority} onValueChange={(v: 'high' | 'medium' | 'low') => setPriority(v)}>
          <SelectTrigger className="w-full sm:w-32 bg-background min-h-[44px]">
>>>>>>> cf46c6e (Initial commit: project files)
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">🔴 High</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
            <SelectItem value="low">⚪ Low</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
<<<<<<< HEAD
                'flex-1 justify-start gap-2',
                !dueDate && 'text-muted-foreground'
=======
                "flex-1 sm:flex-initial justify-start text-left font-normal min-h-[44px]",
                !dueDate && "text-muted-foreground"
>>>>>>> cf46c6e (Initial commit: project files)
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              {dueDate ? format(dueDate, 'MMM d') : 'Due date'}
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
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
<<<<<<< HEAD
          className="flex-1"
          onClick={() => {
            setIsOpen(false);
            setErrors({});
          }}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!title.trim() || Object.keys(errors).length > 0}>
=======
          className="flex-1 min-h-[44px]"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 min-h-[44px]" disabled={!title.trim()}>
>>>>>>> cf46c6e (Initial commit: project files)
          Add Task
        </Button>
      </div>
    </form>
  );
}
