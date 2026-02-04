import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HABIT_TEMPLATES, TemplatePack } from '@/lib/habit-templates';
import { useCreateHabit } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HabitTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitTemplateDialog({ open, onOpenChange }: HabitTemplateDialogProps) {
  const createHabit = useCreateHabit();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const handleLoadTemplate = async (pack: TemplatePack) => {
    setLoading(true);
    setSelectedPack(pack.id);

    try {
      let successCount = 0;
      
      // Create each habit in the template
      for (const habitTemplate of pack.habits) {
        await createHabit.mutateAsync({
          ...habitTemplate,
          sort_order: 999, // Will be reordered by user if needed
          archived: false,
        });
        successCount++;
      }

      toast({
        title: 'Success!',
        description: `Loaded ${successCount} habits from "${pack.name}"`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setSelectedPack(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Habit Template</DialogTitle>
          <DialogDescription>
            Choose a pre-made habit pack to get started quickly
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {HABIT_TEMPLATES.map((pack) => (
              <div
                key={pack.id}
                className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pack.icon}</span>
                    <div>
                      <h3 className="font-semibold">{pack.name}</h3>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleLoadTemplate(pack)}
                    disabled={loading}
                  >
                    {loading && selectedPack === pack.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Load
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Includes {pack.habits.length} habits:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pack.habits.map((habit, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                      >
                        {habit.is_bad_habit ? '🛡️' : '✅'} {habit.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
