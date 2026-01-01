import { useState, useEffect } from 'react';
import { useDaySummary, useUpdateDayNotes, useUpdateDayMood } from '@/hooks/useChronicles';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Smile } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JournalTabProps {
  date: string;
}

export function JournalTab({ date }: JournalTabProps) {
  const { data: summary } = useDaySummary(date);
  const updateNotes = useUpdateDayNotes();
  const updateMood = useUpdateDayMood();
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNotes(summary?.notes || '');
    setMood(summary?.mood_score?.toString() || '');
    setHasChanges(false);
  }, [summary?.notes, summary?.mood_score, date]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== (summary?.notes || '') || mood !== (summary?.mood_score?.toString() || ''));
  };

  const handleMoodChange = (value: string) => {
    setMood(value);
    setHasChanges(value !== (summary?.mood_score?.toString() || '') || notes !== (summary?.notes || ''));
  };

  const handleSave = async () => {
    try {
      // Save notes if changed
      if (notes !== (summary?.notes || '')) {
        await updateNotes.mutateAsync({ date, notes });
      }
      // Save mood if changed
      if (mood && mood !== (summary?.mood_score?.toString() || '')) {
        await updateMood.mutateAsync({ date, moodScore: parseInt(mood) });
      }
      setHasChanges(false);
      toast({ title: "Journal saved" });
    } catch (error) {
      toast({ 
        title: "Failed to save", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Smile className="w-4 h-4" />
          How are you feeling today?
        </label>
        <Select value={mood} onValueChange={handleMoodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select mood..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">😢 Terrible (1)</SelectItem>
            <SelectItem value="2">😕 Bad (2)</SelectItem>
            <SelectItem value="3">😐 Neutral (3)</SelectItem>
            <SelectItem value="4">🙂 Good (4)</SelectItem>
            <SelectItem value="5">😄 Excellent (5)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Write your thoughts for this day..."
        className="min-h-[200px] resize-none"
      />
      
      <Button
        onClick={handleSave}
        disabled={!hasChanges || updateNotes.isPending || updateMood.isPending}
        className="w-full"
      >
        {updateNotes.isPending || updateMood.isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Journal
      </Button>
    </div>
  );
}
