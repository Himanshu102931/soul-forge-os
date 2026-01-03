import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTodayHabits, useUpdateHabitLog } from '@/hooks/useHabits';
import { useTodayTasks } from '@/hooks/useTasks';
import { useTodaySummary, useCreateDailySummary, useRecentSummaries } from '@/hooks/useDailySummary';
import { useMetrics, useUpdateMetric } from '@/hooks/useMetrics';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useRateLimit } from '@/hooks/useRateLimit';
import { calculateHPDamage, calculateNewLevel } from '@/lib/rpg-utils';
import { generateLocalRoast, DailyStats } from '@/lib/local-roast';
import { generateAIDrillSergeantRoast } from '@/lib/ai-service';
import { loadAIConfig } from '@/lib/encryption';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { NightlyMetricsStep } from '@/components/nightly-review/NightlyMetricsStep';
import { NightlyExceptionsStep } from '@/components/nightly-review/NightlyExceptionsStep';
import { NightlyJournalStep } from '@/components/nightly-review/NightlyJournalStep';
import { NightlySummaryStep } from '@/components/nightly-review/NightlySummaryStep';
import { NightlyDebriefStep } from '@/components/nightly-review/NightlyDebriefStep';

interface NightlyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NightlyReviewModal({ open, onOpenChange }: NightlyReviewModalProps) {
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});
  const [roast, setRoast] = useState<string>('');
  const [isAIRoast, setIsAIRoast] = useState(false);
  const [aiTokensUsed, setAiTokensUsed] = useState(0);
  const [aiCost, setAiCost] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUpdatingHabits, setIsUpdatingHabits] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string>('');

  const { badHabits, todayHabits } = useTodayHabits();
  const { data: todayTasks } = useTodayTasks();
  const { data: existingSummary } = useTodaySummary();
  const { data: recentSummaries } = useRecentSummaries(7);
  const { data: profile } = useProfile();
  const { data: metrics } = useMetrics();
  const updateMetric = useUpdateMetric();
  const updateProfile = useUpdateProfile();
  const updateHabitLog = useUpdateHabitLog();
  const createSummary = useCreateDailySummary();
  const { toast } = useToast();
  
  // Rate limiting for AI features
  const [aiConfig, setAIConfig] = useState<{ provider: string; enabled: boolean }>({ provider: 'gemini', enabled: false });
  const rateLimiter = useRateLimit(aiConfig.provider || 'gemini', 5);

  // Load AI config on mount
  useEffect(() => {
    loadAIConfig().then(config => setAIConfig({ provider: config.provider, enabled: config.enabled }));
  }, []);

  // Calculate unchecked bad habits
  const uncheckedBadHabits = badHabits.filter(h => h.todayLog?.status !== 'completed');
  
  // Calculate missed daily habits
  const missedHabits = todayHabits.filter(h => 
    !h.todayLog || h.todayLog.status === 'missed' || !h.todayLog.status
  );

  // Calculate skipped habits (paused)
  const skippedHabits = todayHabits.filter(h => h.todayLog?.status === 'skipped');
  
  // Calculate incomplete today tasks
  const incompleteTasks = todayTasks?.filter(t => !t.completed) || [];

  // Calculate XP earned today
  const xpEarned = todayHabits.reduce((acc, h) => {
    if (h.todayLog?.status === 'completed') return acc + (h.xp_reward || 10);
    if (h.todayLog?.status === 'partial') return acc + Math.floor((h.xp_reward || 10) / 2);
    return acc;
  }, 0) + badHabits.reduce((acc, h) => {
    if (h.todayLog?.status === 'completed') return acc + (h.xp_reward || 10);
    return acc;
  }, 0);

  // Calculate HP loss
  const missedCount = missedHabits.length;
  const incompleteCount = incompleteTasks.length;
  const hpLost = calculateHPDamage(missedCount, incompleteCount);

  // Generate roast based on current stats
  const generateRoast = async (useAI: boolean = true) => {
    const sleepValue = sleep ? parseFloat(sleep) : (metrics?.sleep || 0);
    const stepsValue = steps ? parseInt(steps) : (metrics?.steps || 0);
    
    const dailyStats: DailyStats = {
      sleepHours: sleepValue,
      missedHabits: missedCount,
      completedHabits: todayHabits.filter(h => h.todayLog?.status === 'completed').length,
      totalHabits: todayHabits.length,
      steps: stepsValue,
      skippedHabits: skippedHabits.length,
      partialHabits: todayHabits.filter(h => h.todayLog?.status === 'partial').length,
      resistanceCompleted: badHabits.filter(h => h.todayLog?.status === 'completed').length,
      resistanceTotal: badHabits.length,
    };

    // Check if AI is enabled
    const shouldUseAI = useAI && aiConfig.enabled && aiConfig.apiKey && aiConfig.provider !== 'local';
    
    if (shouldUseAI) {
      // Check rate limit before attempting AI request
      if (!rateLimiter.canMakeRequest) {
        const timeWait = rateLimiter.timeUntilReset || 1;
        const errorMsg = `AI rate limit reached (5 per hour). Try again in ${timeWait} minute${timeWait === 1 ? '' : 's'}.`;
        setRateLimitError(errorMsg);
        toast({
          title: 'Rate Limit Reached',
          description: errorMsg,
          variant: 'destructive',
        });
        // Fall back to local roast
        setIsAIRoast(false);
        return generateLocalRoast(dailyStats);
      }
      
      setIsGeneratingAI(true);
      setRateLimitError('');
      try {
        // Convert recent summaries to DailyStats format for context
        const last7Days: DailyStats[] = recentSummaries?.slice(0, 7).map(summary => ({
          sleepHours: 0, // We don't store this in summaries, only XP/HP
          missedHabits: 0,
          completedHabits: 0,
          totalHabits: 0,
          steps: 0,
          skippedHabits: 0,
          partialHabits: 0,
          resistanceCompleted: 0,
          resistanceTotal: 0,
        })) || [];
        
        // Use rate limiter to make the request
        const aiResult = await rateLimiter.makeRequest(async () => {
          return generateAIDrillSergeantRoast(dailyStats, last7Days);
        });
        
        if (aiResult.success && aiResult.roast) {
          setIsAIRoast(true);
          setAiTokensUsed(aiResult.tokensUsed || 0);
          setAiCost(aiResult.cost || 0);
          setIsGeneratingAI(false);
          return aiResult.roast;
        }
      } catch (error) {
        console.error('AI roast failed:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        
        // Check if it's a rate limit error
        if (message.includes('Rate limit')) {
          setRateLimitError(message);
          toast({
            title: 'Rate Limit Exceeded',
            description: message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'AI Unavailable',
            description: 'Using local drill sergeant instead.',
            variant: 'default',
          });
        }
      }
      setIsGeneratingAI(false);
    }
    
    // Fallback to local roast
    setIsAIRoast(false);
    return generateLocalRoast(dailyStats);
  };

  const handleNext = async () => {
    if (step === 3) {
      // Moving to Debrief step - generate roast
      const generatedRoast = await generateRoast();
      setRoast(generatedRoast);
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Validate inputs
      const stepsValue = steps ? parseInt(steps) : null;
      const sleepValue = sleep ? parseFloat(sleep) : null;

      // Validate numbers aren't negative
      if ((stepsValue !== null && stepsValue < 0) || (sleepValue !== null && sleepValue < 0)) {
        toast({
          title: 'Invalid Input',
          description: 'Steps and sleep cannot be negative',
          variant: 'destructive',
        });
        return;
      }

      // Validate profile exists
      if (!profile) {
        throw new Error('User profile not loaded. Please try again.');
      }

      // Step 1: Save metrics (non-blocking, do both in parallel)
      const metricPromises: Promise<any>[] = [];
      if (stepsValue !== null && stepsValue >= 0) {
        metricPromises.push(
          updateMetric.mutateAsync({ metricId: 'steps', value: stepsValue })
        );
      }
      if (sleepValue !== null && sleepValue >= 0) {
        metricPromises.push(
          updateMetric.mutateAsync({ metricId: 'sleep', value: sleepValue })
        );
      }
      
      if (metricPromises.length > 0) {
        await Promise.all(metricPromises).catch(err => {
          console.error('Failed to save metrics:', err);
          // Don't fail the whole review for metrics
        });
      }

      // Step 2: Update profile with XP gains and HP loss
      // Calculate new XP and level
      let newXP = profile.xp + xpEarned;
      let newLevel = profile.level;
      let newHP = Math.max(1, profile.hp - hpLost);

      // Check for level DOWN when HP reaches 0 (HP Penalty System)
      if (newHP <= 0 && newLevel > 1) {
        newLevel -= 1;
        newHP = profile.max_hp; // Reset HP to 100 on level down
      }

      // Check for level ups
      while (newXP >= 100 + newLevel * 50) {
        newXP -= 100 + newLevel * 50;
        newLevel++;
        newHP = profile.max_hp; // Restore HP on level up
      }

      await updateProfile.mutateAsync({
        xp: newXP,
        level: newLevel,
        hp: newHP,
      }).catch(err => {
        console.error('Failed to update profile with XP/HP:', err);
        throw new Error('Failed to save XP and HP to profile');
      });

      // Step 3: Save daily summary (CRITICAL - must succeed)
      const moodScore = mood || null;  // Use mood value directly (1-5)

      await createSummary.mutateAsync({
        mood_score: moodScore,
        notes: notes || null,
        xp_earned: xpEarned,
        hp_lost: hpLost,
        ai_response: roast || null,
      }).catch(err => {
        console.error('Failed to create summary:', err);
        throw new Error('Failed to save nightly review');
      });

      // Success!
      toast({
        title: 'Nightly Review Complete',
        description: `+${xpEarned} XP earned, -${hpLost} HP lost`,
      });

      // Reset and close
      onOpenChange(false);
      setStep(0);
      setNotes('');
      setSteps('');
      setSleep('');
      setMood(null);
      setRoast('');
      setExceptions({});
    } catch (error) {
      console.error('Nightly review error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save review. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const steps_content = [
    // Step 0: Metrics
    <NightlyMetricsStep
      key="metrics"
      steps={steps}
      sleep={sleep}
      onStepsChange={setSteps}
      onSleepChange={setSleep}
      currentSteps={metrics?.steps}
      currentSleep={metrics?.sleep}
    />,

    // Step 1: Exceptions
    <NightlyExceptionsStep
      key="exceptions"
      uncheckedBadHabits={uncheckedBadHabits}
      exceptions={exceptions}
      isUpdating={isUpdatingHabits}
      onExceptionChange={async (habitId, status) => {
        setIsUpdatingHabits(true);
        try {
          const habitToUpdate = uncheckedBadHabits.find(h => h.id === habitId);
          const habitStatus = status === 'resisted' ? 'completed' : 'skipped';
          const habitTitle = habitToUpdate?.title || 'Habit';

          await updateHabitLog.mutateAsync({
            habitId,
            status: habitStatus,
          });
          setExceptions({ ...exceptions, [habitId]: status === 'resisted' });
          toast({
            title: status === 'resisted' ? 'Marked as Resisted' : 'Marked as Failed',
            description: habitTitle,
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to update habit',
            variant: 'destructive',
          });
        }
        setIsUpdatingHabits(false);
      }}
    />,

    // Step 2: Journal with Mood Picker
    <NightlyJournalStep
      key="journal"
      mood={mood}
      notes={notes}
      onMoodChange={setMood}
      onNotesChange={setNotes}
    />,

    // Step 3: Summary
    <NightlySummaryStep
      key="summary"
      xpEarned={xpEarned}
      hpLost={hpLost}
      missedCount={missedCount}
      incompleteCount={incompleteCount}
    />,

    // Step 4: Debrief (Drill Sergeant)
    <NightlyDebriefStep
      key="debrief"
      roast={roast}
      isRoasting={isGeneratingAI}
      onGetNewRoast={async () => {
        const newRoast = await generateRoast();
        setRoast(newRoast);
      }}
      canMakeAIRequest={rateLimiter.canMakeRequest}
      requestsRemaining={rateLimiter.requestsRemaining}
    />,
  ];

  const stepTitles = ['Metrics', 'Exceptions', 'Journal', 'Summary', 'Debrief'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Moon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Nightly Review - {stepTitles[step]}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[200px]"
          >
            {steps_content[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 pt-4">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={handleNext} className="flex-1">
              Next
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1">
              Finish
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
