<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
>>>>>>> cf46c6e (Initial commit: project files)
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
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
=======
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useTodayHabits } from '@/hooks/useHabits';
import { useTodayTasks } from '@/hooks/useTasks';
import { useTodaySummary, useCreateDailySummary } from '@/hooks/useDailySummary';
import { useMetrics, useUpdateMetric } from '@/hooks/useMetrics';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { calculateHPDamage, calculateNewLevel } from '@/lib/rpg-utils';
import { generateLocalRoast, DailyStats } from '@/lib/local-roast';
import { Moon, Footprints, Check, X, Zap, Shield, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { NightlyReviewMetricsSchema, NightlyReviewJournalSchema } from '@/lib/validation';
>>>>>>> cf46c6e (Initial commit: project files)

interface NightlyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

<<<<<<< HEAD
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
=======
const MOOD_OPTIONS = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😔', label: 'Bad' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '🔥', label: 'Great' },
];

export function NightlyReviewModal({ open, onOpenChange }: NightlyReviewModalProps) {
  const [step, setStep] = useState(0);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});
  const [roast, setRoast] = useState<string>('');

  // React Hook Form for Step 0 (Metrics)
  const metricsForm = useForm({
    resolver: zodResolver(NightlyReviewMetricsSchema),
    defaultValues: {
      steps: '',
      sleep: '',
    },
  });

  // React Hook Form for Step 2 (Journal)
  const journalForm = useForm({
    resolver: zodResolver(NightlyReviewJournalSchema),
    defaultValues: {
      mood: 0,
      notes: '',
    },
  });
>>>>>>> cf46c6e (Initial commit: project files)

  const { badHabits, todayHabits } = useTodayHabits();
  const { data: todayTasks } = useTodayTasks();
  const { data: existingSummary } = useTodaySummary();
<<<<<<< HEAD
  const { data: recentSummaries } = useRecentSummaries(7);
=======
>>>>>>> cf46c6e (Initial commit: project files)
  const { data: profile } = useProfile();
  const { data: metrics } = useMetrics();
  const updateMetric = useUpdateMetric();
  const updateProfile = useUpdateProfile();
<<<<<<< HEAD
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
=======
  const createSummary = useCreateDailySummary();
  const { toast } = useToast();
>>>>>>> cf46c6e (Initial commit: project files)

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
<<<<<<< HEAD
  const generateRoast = async (useAI: boolean = true) => {
    const sleepValue = sleep ? parseFloat(sleep) : (metrics?.sleep || 0);
    const stepsValue = steps ? parseInt(steps) : (metrics?.steps || 0);
=======
  const generateRoast = () => {
    const sleepValue = metricsForm.getValues('sleep') 
      ? parseFloat(metricsForm.getValues('sleep')) 
      : (metrics?.sleep || 0);
    const stepsValue = metricsForm.getValues('steps')
      ? parseInt(metricsForm.getValues('steps'))
      : (metrics?.steps || 0);
>>>>>>> cf46c6e (Initial commit: project files)
    
    const dailyStats: DailyStats = {
      sleepHours: sleepValue,
      missedHabits: missedCount,
      completedHabits: todayHabits.filter(h => h.todayLog?.status === 'completed').length,
      totalHabits: todayHabits.length,
      steps: stepsValue,
      skippedHabits: skippedHabits.length,
<<<<<<< HEAD
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
=======
    };
    
>>>>>>> cf46c6e (Initial commit: project files)
    return generateLocalRoast(dailyStats);
  };

  const handleNext = async () => {
<<<<<<< HEAD
    if (step === 3) {
      // Moving to Debrief step - generate roast
      const generatedRoast = await generateRoast();
      setRoast(generatedRoast);
=======
    // Validate current step before proceeding
    if (step === 0) {
      const isValid = await metricsForm.trigger();
      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: 'Please correct the errors before proceeding',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (step === 2) {
      const isValid = await journalForm.trigger();
      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: 'Please select your mood before proceeding',
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (step === 3) {
      // Moving to Debrief step - generate roast
      setRoast(generateRoast());
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
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
=======
      const metricsData = metricsForm.getValues();
      const journalData = journalForm.getValues();
      
      // Save metrics
      if (metricsData.steps && metricsData.steps.trim()) {
        const stepsValue = parseInt(metricsData.steps);
        if (!isNaN(stepsValue)) {
          await updateMetric.mutateAsync({ metricId: 'steps', value: stepsValue });
        }
      }
      if (metricsData.sleep && metricsData.sleep.trim()) {
        const sleepValue = parseFloat(metricsData.sleep);
        if (!isNaN(sleepValue)) {
          await updateMetric.mutateAsync({ metricId: 'sleep', value: sleepValue });
        }
      }

      // Apply HP damage to profile
      if (profile && hpLost > 0) {
        const { level, hp, maxHp } = calculateNewLevel(profile.level, profile.hp, hpLost);
        await updateProfile.mutateAsync({
          level,
          hp,
          max_hp: maxHp,
        });
      }

      // Convert mood (1-5) to mood_score (1-10 scale for database)
      const moodScore = journalData.mood ? journalData.mood * 2 : null;

      // Save daily summary with AI response
      await createSummary.mutateAsync({
        mood_score: moodScore,
        notes: journalData.notes || null,
        xp_earned: xpEarned,
        hp_lost: hpLost,
        ai_response: roast || null,
      });

>>>>>>> cf46c6e (Initial commit: project files)
      toast({
        title: 'Nightly Review Complete',
        description: `+${xpEarned} XP earned, -${hpLost} HP lost`,
      });

<<<<<<< HEAD
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
=======
      onOpenChange(false);
      setStep(0);
      metricsForm.reset();
      journalForm.reset();
      setRoast('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save review',
>>>>>>> cf46c6e (Initial commit: project files)
        variant: 'destructive',
      });
    }
  };

  const steps_content = [
    // Step 0: Metrics
<<<<<<< HEAD
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
=======
    <Form key="metrics" {...metricsForm}>
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">Log your daily metrics</p>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={metricsForm.control}
            name="steps"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm">
                  <Footprints className="w-4 h-4" />
                  Steps
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={metrics?.steps?.toString() || '0'}
                    {...field}
                    className="bg-secondary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={metricsForm.control}
            name="sleep"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm">
                  <Moon className="w-4 h-4" />
                  Sleep (hrs)
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={metrics?.sleep?.toString() || '0'}
                    {...field}
                    className="bg-secondary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>,

    // Step 1: Exceptions
    <div key="exceptions" className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Review unchecked resistance habits
      </p>
      
      {uncheckedBadHabits.length === 0 ? (
        <div className="text-center py-6">
          <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
          <p className="text-sm">All resistance habits checked!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uncheckedBadHabits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border"
            >
              <span className="text-sm">{habit.title}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={exceptions[habit.id] === true ? 'default' : 'outline'}
                  onClick={() => setExceptions({ ...exceptions, [habit.id]: true })}
                >
                  Exception
                </Button>
                <Button
                  size="sm"
                  variant={exceptions[habit.id] === false ? 'destructive' : 'outline'}
                  onClick={() => setExceptions({ ...exceptions, [habit.id]: false })}
                >
                  Failed
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>,

    // Step 2: Journal with Mood Picker
    <Form key="journal" {...journalForm}>
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">How was your day?</p>
        
        {/* Mood Picker */}
        <FormField
          control={journalForm.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-center gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl transition-all border-2",
                      field.value === option.value
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-border bg-secondary/30 hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs text-muted-foreground mt-1">{option.label}</span>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={journalForm.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Daily reflection... What did you learn? What could be improved?"
                  {...field}
                  className="min-h-[120px] bg-secondary resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>,

    // Step 3: Summary
    <div key="summary" className="space-y-6">
      <p className="text-muted-foreground text-sm">Today's results</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 text-center">
          <Zap className="w-8 h-8 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-primary">+{xpEarned}</div>
          <div className="text-xs text-muted-foreground">XP Earned</div>
        </div>
        
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30 text-center">
          <Shield className="w-8 h-8 mx-auto text-destructive mb-2" />
          <div className="text-2xl font-bold text-destructive">-{hpLost}</div>
          <div className="text-xs text-muted-foreground">HP Lost</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• {missedCount} missed habits (-{missedCount * 10} HP)</p>
        <p>• {incompleteCount} incomplete tasks (-{incompleteCount * 5} HP)</p>
      </div>
    </div>,

    // Step 4: Debrief (Drill Sergeant)
    <div key="debrief" className="space-y-4">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Skull className="w-6 h-6 text-destructive" />
        <span className="font-bold text-lg uppercase tracking-wider">Drill Sergeant</span>
      </div>
      
      <div className="bg-destructive/10 border-2 border-destructive/40 rounded-xl p-4">
        <p className="text-sm font-medium leading-relaxed text-center">
          "{roast}"
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setRoast(generateRoast())}
      >
        Different Roast
      </Button>
    </div>,
>>>>>>> cf46c6e (Initial commit: project files)
  ];

  const stepTitles = ['Metrics', 'Exceptions', 'Journal', 'Summary', 'Debrief'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
<<<<<<< HEAD
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Moon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Nightly Review - {stepTitles[step]}</span>
=======
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Nightly Review - {stepTitles[step]}
>>>>>>> cf46c6e (Initial commit: project files)
          </DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
<<<<<<< HEAD
        <div className="flex justify-center gap-2 py-3">
=======
        <div className="flex justify-center gap-2 py-2">
>>>>>>> cf46c6e (Initial commit: project files)
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={cn(
<<<<<<< HEAD
                'w-2.5 h-2.5 rounded-full transition-colors',
=======
                'w-2 h-2 rounded-full transition-colors',
>>>>>>> cf46c6e (Initial commit: project files)
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
