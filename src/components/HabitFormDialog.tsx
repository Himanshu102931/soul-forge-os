import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Habit } from '@/hooks/useHabits';
import { HabitFormSchema } from '@/lib/validation';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (data: {
    title: string;
    description: string | null;
    frequency_days: number[];
    xp_reward: number;
    is_bad_habit: boolean;
  }) => void;
  isLoading?: boolean;
}

export function HabitFormDialog({ 
  open, 
  onOpenChange, 
  habit, 
  onSubmit, 
  isLoading 
}: HabitFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [xpReward, setXpReward] = useState<number>(10);
  const [isBadHabit, setIsBadHabit] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setFrequencyDays(habit.frequency_days);
      setXpReward(habit.xp_reward || 10);
      setIsBadHabit(habit.is_bad_habit);
    } else {
      setTitle('');
      setDescription('');
      setFrequencyDays([0, 1, 2, 3, 4, 5, 6]);
      setXpReward(10);
      setIsBadHabit(false);
    }
    setErrors({});
  }, [habit, open]);

  const toggleDay = (day: number) => {
    setFrequencyDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using Zod schema
    const validation = HabitFormSchema.safeParse({
      name: title,
      description: description || undefined,
      xp: xpReward,
      frequency: 'daily', // Simplified for this form
      is_bad_habit: isBadHabit,
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
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      frequency_days: isBadHabit ? [] : frequencyDays,
      xp_reward: xpReward,
      is_bad_habit: isBadHabit,
    });
  };

  const formatFrequency = (days: number[]): string => {
    if (days.length === 0) return 'Never';
    if (days.length === 7) return 'Daily';
    return days.map(d => DAY_NAMES[d]).join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle>{habit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter habit name"
              required
              aria-invalid={!!errors.name}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this habit"
              rows={2}
              aria-invalid={!!errors.description}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isBadHabit ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsBadHabit(false)}
              >
                Good Habit
              </Button>
              <Button
                type="button"
                variant={isBadHabit ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsBadHabit(true)}
              >
                Bad Habit
              </Button>
            </div>
          </div>

          {!isBadHabit && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex gap-1">
                {DAYS.map((day, index) => (
                  <Toggle
                    key={index}
                    pressed={frequencyDays.includes(index)}
                    onPressedChange={() => toggleDay(index)}
                    className="w-9 h-9 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    {day}
                  </Toggle>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatFrequency(frequencyDays)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>XP Reward</Label>
            <Select value={xpReward.toString()} onValueChange={(v) => setXpReward(parseInt(v))}>
              <SelectTrigger aria-invalid={!!errors.xp}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 XP (Easy)</SelectItem>
                <SelectItem value="10">10 XP (Medium)</SelectItem>
                <SelectItem value="15">15 XP (Hard)</SelectItem>
              </SelectContent>
            </Select>
            {errors.xp && (
              <p className="text-sm text-red-500">{errors.xp}</p>
            )}
            {habit && (
              <p className="text-xs text-muted-foreground">
                Note: XP changes apply to future completions only
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || Object.keys(errors).length > 0}>
              {habit ? 'Save Changes' : 'Add Habit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
