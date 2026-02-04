import { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
import { useDaySummary, useUpdateDayNotes } from '@/hooks/useChronicles';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
>>>>>>> cf46c6e (Initial commit: project files)

interface JournalTabProps {
  date: string;
}

export function JournalTab({ date }: JournalTabProps) {
  const { data: summary } = useDaySummary(date);
  const updateNotes = useUpdateDayNotes();
<<<<<<< HEAD
  const updateMood = useUpdateDayMood();
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string>('');
=======
  const [notes, setNotes] = useState('');
>>>>>>> cf46c6e (Initial commit: project files)
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setNotes(summary?.notes || '');
<<<<<<< HEAD
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
=======
    setHasChanges(false);
  }, [summary?.notes, date]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(value !== (summary?.notes || ''));
>>>>>>> cf46c6e (Initial commit: project files)
  };

  const handleSave = async () => {
    try {
<<<<<<< HEAD
      // Save notes if changed
      if (notes !== (summary?.notes || '')) {
        await updateNotes.mutateAsync({ date, notes });
      }
      // Save mood if changed
      if (mood && mood !== (summary?.mood_score?.toString() || '')) {
        await updateMood.mutateAsync({ date, moodScore: parseInt(mood) });
      }
=======
      await updateNotes.mutateAsync({ date, notes });
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
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

=======
>>>>>>> cf46c6e (Initial commit: project files)
      <Textarea
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        placeholder="Write your thoughts for this day..."
        className="min-h-[200px] resize-none"
      />
      
      <Button
        onClick={handleSave}
<<<<<<< HEAD
        disabled={!hasChanges || updateNotes.isPending || updateMood.isPending}
        className="w-full"
      >
        {updateNotes.isPending || updateMood.isPending ? (
=======
        disabled={!hasChanges || updateNotes.isPending}
        className="w-full"
      >
        {updateNotes.isPending ? (
>>>>>>> cf46c6e (Initial commit: project files)
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Journal
      </Button>
    </div>
  );
}
