import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateHabit } from '@/hooks/useHabits';
import { generateOnboardingPlan, HabitSuggestion, OnboardingInput } from '@/lib/ai-onboarding';
import { Loader2, Sparkles, CheckCircle, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState('');
  const [experience, setExperience] = useState<string>('beginner');
  const [availableTime, setAvailableTime] = useState('30-60 min/day');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
  
  const createHabit = useCreateHabit();
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    
    const input: OnboardingInput = {
      goals,
      experience,
      availableTime,
    };
    
    const result = await generateOnboardingPlan(input);
    
    if (result.success && result.habits) {
      setSuggestions(result.habits);
      setWelcomeMessage(result.welcomeMessage || 'Welcome to your Life OS!');
      // Pre-select all habits
      setSelectedHabits(new Set(result.habits.map((_, i) => i)));
      setStep(2);
    } else {
      toast({
        title: 'AI Generation Failed',
        description: result.error || 'Please try again or skip to manual setup',
        variant: 'destructive',
      });
    }
    
    setIsGenerating(false);
  };

  const handleCreateHabits = async () => {
    const habitsToCreate = suggestions.filter((_, i) => selectedHabits.has(i));
    
    try {
      for (const habit of habitsToCreate) {
        await createHabit.mutateAsync({
          title: habit.title,
          frequency_days: habit.frequency,
          xp_reward: habit.xpReward,
          is_bad_habit: false,
          description: null,
          archived: false,
          sort_order: 0,
        });
      }
      
      toast({
        title: '✨ Welcome to Life OS!',
        description: `Created ${habitsToCreate.length} habits to get you started!`,
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Error Creating Habits',
        description: 'Some habits may not have been created',
        variant: 'destructive',
      });
    }
  };

  const toggleHabit = (index: number) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedHabits(newSelected);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '💪';
      case 'productivity': return '🎯';
      case 'learning': return '📚';
      case 'social': return '🤝';
      default: return '⭐';
    }
  };

  const steps = [
    // Step 0: Welcome & Goals
    <div key="goals" className="space-y-6">
      <div className="text-center space-y-2">
        <Sparkles className="w-12 h-12 mx-auto text-primary" />
        <h3 className="text-xl font-bold">Welcome to Life OS! 🚀</h3>
        <p className="text-sm text-muted-foreground">
          Let's build your personalized habit system with AI
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="goals">What are your main goals?</Label>
        <Textarea
          id="goals"
          placeholder="e.g., Get fit, build a side project, improve sleep, learn Spanish..."
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-3">
        <Label>Experience with habit tracking?</Label>
        <div className="grid grid-cols-3 gap-2">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setExperience(level)}
              className={cn(
                'px-4 py-2 rounded-lg border transition-all text-sm',
                experience === level
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              )}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>How much time can you dedicate daily?</Label>
        <div className="grid grid-cols-2 gap-2">
          {['15-30 min/day', '30-60 min/day', '1-2 hrs/day', '2+ hrs/day'].map((time) => (
            <button
              key={time}
              onClick={() => setAvailableTime(time)}
              className={cn(
                'px-3 py-2 rounded-lg border transition-all text-sm',
                availableTime === time
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              )}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Generating...
    <div key="generating" className="space-y-6 text-center py-8">
      <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
      <div className="space-y-2">
        <h3 className="text-xl font-bold">AI is crafting your plan...</h3>
        <p className="text-sm text-muted-foreground">
          Analyzing your goals and creating personalized habits
        </p>
      </div>
    </div>,

    // Step 2: Review & Customize
    <div key="review" className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Your Personalized Plan</h3>
        </div>
        <p className="text-sm text-muted-foreground">{welcomeMessage}</p>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {suggestions.map((habit, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleHabit(index)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              selectedHabits.has(index)
                ? 'bg-primary/10 border-primary'
                : 'bg-secondary/50 border-border hover:border-muted-foreground'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getCategoryIcon(habit.category)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{habit.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    +{habit.xpReward} XP
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{habit.reason}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  {habit.frequency.length === 7 ? 'Daily' : 
                   habit.frequency.length === 5 ? 'Weekdays' :
                   `${habit.frequency.length} days/week`}
                </div>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                selectedHabits.has(index)
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground'
              )}>
                {selectedHabits.has(index) && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        💡 Tip: Click habits to select/deselect. You can add more habits later in Settings!
      </p>
    </div>,
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle className="text-lg">
            {step === 0 ? 'Get Started' : step === 1 ? 'Generating...' : 'Review Your Plan'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-3 mt-4">
          {step === 0 && (
            <>
              <Button variant="outline" onClick={() => onComplete()}>
                Skip Setup
              </Button>
              <Button 
                onClick={() => {
                  setStep(1);
                  handleGeneratePlan();
                }}
                disabled={!goals.trim() || isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep(0)}
              >
                Start Over
              </Button>
              <Button 
                onClick={handleCreateHabits}
                disabled={selectedHabits.size === 0 || createHabit.isPending}
              >
                {createHabit.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Create {selectedHabits.size} Habits
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
