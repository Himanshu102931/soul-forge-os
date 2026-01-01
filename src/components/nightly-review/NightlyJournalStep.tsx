/**
 * Nightly Review - Journal Step
 * Mood selection and daily reflection notes
 */

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const MOOD_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'Great' },
];

interface JournalStepProps {
  mood: number | null;
  notes: string;
  onMoodChange: (mood: number) => void;
  onNotesChange: (notes: string) => void;
}

export function NightlyJournalStep({
  mood,
  notes,
  onMoodChange,
  onNotesChange,
}: JournalStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm mb-4">How was your day?</p>
        <div className="flex justify-center gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onMoodChange(option.value)}
              className={cn(
                "flex flex-col items-center p-3 rounded-xl transition-all border-2",
                mood === option.value
                  ? "border-primary bg-primary/10 scale-110"
                  : "border-border bg-secondary/30 hover:bg-secondary/50"
              )}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs text-muted-foreground mt-1">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        placeholder="Daily reflection... What did you learn? What could be improved?"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="min-h-[120px] bg-secondary resize-none"
      />
    </div>
  );
}
