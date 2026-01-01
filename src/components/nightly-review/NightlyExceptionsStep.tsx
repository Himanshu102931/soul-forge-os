/**
 * Nightly Review - Exceptions Step
 * Review unchecked bad habits (exceptions/resistance tracking)
 */

import { Button } from '@/components/ui/button';
import { Shield, Check, X } from 'lucide-react';

interface BadHabit {
  id: string;
  title: string;
}

interface ExceptionsStepProps {
  uncheckedBadHabits: BadHabit[];
  exceptions: Record<string, boolean>;
  isUpdating: boolean;
  onExceptionChange: (habitId: string, status: 'resisted' | 'failed') => Promise<void>;
}

export function NightlyExceptionsStep({
  uncheckedBadHabits,
  exceptions,
  isUpdating,
  onExceptionChange,
}: ExceptionsStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Review unchecked bad habits - Mark as completed or failed
      </p>
      
      {uncheckedBadHabits.length === 0 ? (
        <div className="text-center py-6">
          <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
          <p className="text-sm">All bad habits checked!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uncheckedBadHabits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
            >
              <div className="flex-1">
                <span className="text-sm font-medium">{habit.title}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {exceptions[habit.id] === true ? '✓ Resisted' : exceptions[habit.id] === false ? '✗ Failed' : 'Pending...'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={exceptions[habit.id] === true ? 'default' : 'outline'}
                  onClick={() => onExceptionChange(habit.id, 'resisted')}
                  disabled={isUpdating}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Resisted
                </Button>
                <Button
                  size="sm"
                  variant={exceptions[habit.id] === false ? 'destructive' : 'outline'}
                  onClick={() => onExceptionChange(habit.id, 'failed')}
                  disabled={isUpdating}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Failed
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
