import { useState } from 'react';
import { useDaySummary, useDayMetrics, useDayHabitLogs, useUpdateAIResponse, useUpdateMetric } from '@/hooks/useChronicles';
import { useAllHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Bed, Footprints, Zap, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateLocalRoast } from '@/lib/local-roast';
<<<<<<< HEAD
=======
import { MetricsInputSchema } from '@/lib/validation';
>>>>>>> cf46c6e (Initial commit: project files)

interface OverviewTabProps {
  date: string;
}

export function OverviewTab({ date }: OverviewTabProps) {
  const { data: summary } = useDaySummary(date);
  const { data: metrics } = useDayMetrics(date);
  const { data: habitLogs } = useDayHabitLogs(date);
  const { data: allHabits } = useAllHabits();
  const updateAIResponse = useUpdateAIResponse();
  const updateMetric = useUpdateMetric();
  const [isRoasting, setIsRoasting] = useState(false);
  
  // Local state for editable inputs
  const [sleepInput, setSleepInput] = useState<string>('');
  const [stepsInput, setStepsInput] = useState<string>('');

  const sleep = metrics?.sleep || 0;
  const steps = metrics?.steps || 0;
  const sleepTarget = 7;
  const stepsTarget = 10000;

  // Get day of week for the selected date
  const selectedDayOfWeek = new Date(date).getDay();

  // Filter habits scheduled for this specific day (exclude archived)
  const scheduledHabits = allHabits?.filter(h => 
    !h.archived && !h.is_bad_habit && h.frequency_days.includes(selectedDayOfWeek)
  ) || [];

  const completedHabits = habitLogs?.filter(l => l.status === 'completed').length || 0;
  const missedHabits = scheduledHabits.length - completedHabits;
  const totalHabits = scheduledHabits.length;

  const handleSleepBlur = async () => {
<<<<<<< HEAD
    const value = parseFloat(sleepInput);
    if (!isNaN(value) && value >= 0) {
      try {
        await updateMetric.mutateAsync({ date, metricId: 'sleep', value });
=======
    if (!sleepInput || sleepInput.trim() === '') {
      setSleepInput('');
      return;
    }
    
    const validation = MetricsInputSchema.safeParse({ 
      sleep: sleepInput,
      steps: '0' // dummy value for schema
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ 
        title: 'Invalid Sleep Value', 
        description: firstError.message, 
        variant: 'destructive' 
      });
      setSleepInput('');
      return;
    }
    
    if (validation.data.sleep !== null) {
      try {
        await updateMetric.mutateAsync({ date, metricId: 'sleep', value: validation.data.sleep });
>>>>>>> cf46c6e (Initial commit: project files)
        toast({ title: 'Sleep updated' });
      } catch (error) {
        toast({ title: 'Failed to update sleep', variant: 'destructive' });
      }
    }
    setSleepInput('');
  };

  const handleStepsBlur = async () => {
<<<<<<< HEAD
    const value = parseInt(stepsInput);
    if (!isNaN(value) && value >= 0) {
      try {
        await updateMetric.mutateAsync({ date, metricId: 'steps', value });
=======
    if (!stepsInput || stepsInput.trim() === '') {
      setStepsInput('');
      return;
    }
    
    const validation = MetricsInputSchema.safeParse({ 
      steps: stepsInput,
      sleep: '0' // dummy value for schema
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ 
        title: 'Invalid Steps Value', 
        description: firstError.message, 
        variant: 'destructive' 
      });
      setStepsInput('');
      return;
    }
    
    if (validation.data.steps !== null) {
      try {
        await updateMetric.mutateAsync({ date, metricId: 'steps', value: validation.data.steps });
>>>>>>> cf46c6e (Initial commit: project files)
        toast({ title: 'Steps updated' });
      } catch (error) {
        toast({ title: 'Failed to update steps', variant: 'destructive' });
      }
    }
    setStepsInput('');
  };

  const handleReRoast = async () => {
    setIsRoasting(true);
    try {
      // Generate roast using local neural engine (instant, no API)
      const roast = generateLocalRoast({
        sleepHours: sleep,
        missedHabits: missedHabits,
        completedHabits: completedHabits,
        totalHabits: totalHabits,
        steps: steps
      });

      await updateAIResponse.mutateAsync({ date, ai_response: roast });
      toast({ title: "Neural Core has spoken!" });
    } catch (error: any) {
      console.error('Re-roast error:', error);
      toast({ 
        title: "Failed to generate assessment", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsRoasting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Vitals - Now Editable */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Bed className="w-4 h-4" />
            <span className="text-sm font-medium">Sleep</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <Input
              type="number"
              step="0.1"
              value={sleepInput || ''}
              onChange={(e) => setSleepInput(e.target.value)}
              onBlur={handleSleepBlur}
              placeholder={sleep.toFixed(1)}
              className="w-20 h-8 text-lg font-bold bg-transparent border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0"
            />
            <span className="text-sm text-muted-foreground">/ {sleepTarget}h</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${Math.min((sleep / sleepTarget) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Footprints className="w-4 h-4" />
            <span className="text-sm font-medium">Steps</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <Input
              type="number"
              value={stepsInput || ''}
              onChange={(e) => setStepsInput(e.target.value)}
              onBlur={handleStepsBlur}
              placeholder={steps.toLocaleString()}
              className="w-24 h-8 text-lg font-bold bg-transparent border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 focus-visible:ring-0"
            />
            <span className="text-sm text-muted-foreground">/ {stepsTarget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((steps / stepsTarget) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Neural Core Assessment */}
      <div className="bg-secondary/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Neural Core Says</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReRoast}
            disabled={isRoasting}
            className="h-8"
          >
            {isRoasting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Analyze
              </>
            )}
          </Button>
        </div>
        
        {summary?.ai_response ? (
          <p className="text-sm text-muted-foreground italic">
            "{summary.ai_response}"
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No analysis yet. Click Analyze to get the Neural Core's assessment.
          </p>
        )}
      </div>
    </div>
  );
}
