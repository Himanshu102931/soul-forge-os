import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateHabitSuggestions, HabitRecommendation, SuggestionContext } from '@/lib/ai-suggestions';
import { useHabits, useCreateHabit } from '@/hooks/useHabits';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { Loader2, Sparkles, Target, TrendingUp, CheckCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useHabitStatistics } from '@/hooks/useAdvancedAnalytics';

interface HabitSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitSuggestionsDialog({ open, onOpenChange }: HabitSuggestionsDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<HabitRecommendation[]>([]);
  const [insights, setInsights] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  
  const { data: habits } = useHabits();
  const { logicalDate } = useLogicalDate();
  const createHabit = useCreateHabit();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: habitStats } = useHabitStatistics(7); // Last 7 days for weekly average

  const handleGenerateSuggestions = async () => {
    if (!habits) return;
    
    setIsGenerating(true);
    
    // Calculate completion rates for each habit
    const habitsWithStats = habits.map(habit => {
      const stats = habitStats?.find(s => s.habitId === habit.id);
      return {
        title: habit.title,
        frequency: habit.frequency_days,
        completionRate: stats?.completionRate || 0,
      };
    });
    
    // Calculate weekly average completion rate
    const weeklyAverage = habitStats && habitStats.length > 0
      ? habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) / habitStats.length
      : 0;
    
    // Build context from current habits
    const context: SuggestionContext = {
      completedHabits: habitsWithStats,
      missedHabits: [],
      currentXP: profile?.xp || 0,
      totalHabits: habits.length,
      weeklyAverage: Math.round(weeklyAverage),
    };
    
    const result = await generateHabitSuggestions(context);
    
    if (result.success && result.recommendations) {
      setSuggestions(result.recommendations);
      setInsights(result.insights || '');
      setSelectedSuggestions(new Set()); // None selected by default
    } else {
      toast({
        title: 'Failed to Generate Suggestions',
        description: result.error || 'Please try again',
        variant: 'destructive',
      });
    }
    
    setIsGenerating(false);
  };

  const handleCreateSelected = async () => {
    const habitsToCreate = suggestions.filter((_, i) => selectedSuggestions.has(i));
    
    try {
      for (const suggestion of habitsToCreate) {
        await createHabit.mutateAsync({
          title: suggestion.title,
          frequency_days: suggestion.suggestedDays,
          xp_reward: suggestion.suggestedXP,
          is_bad_habit: false,
          description: null,
          archived: false,
          sort_order: 0,
        });
      }
      
      toast({
        title: '✨ Habits Created!',
        description: `Added ${habitsToCreate.length} new ${habitsToCreate.length === 1 ? 'habit' : 'habits'} to your routine`,
      });
      
      onOpenChange(false);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
    } catch (error) {
      toast({
        title: 'Error Creating Habits',
        description: 'Some habits may not have been created',
        variant: 'destructive',
      });
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '✨';
      default: return '📌';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Habit Suggestions
          </DialogTitle>
        </DialogHeader>

        {suggestions.length === 0 ? (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-3">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Let AI Analyze Your Patterns</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Get personalized habit recommendations based on your current routine, goals, and performance patterns.
              </p>
            </div>

            <Button 
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || !habits || habits.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Habits...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Suggestions
                </>
              )}
            </Button>

            {habits && habits.length === 0 && (
              <p className="text-xs text-center text-muted-foreground">
                Add some habits first to get personalized suggestions
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {insights && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{insights}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Recommendations ({suggestions.length})
              </h4>
              
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => toggleSuggestion(index)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all',
                    selectedSuggestions.has(index)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-secondary/50 border-border hover:border-muted-foreground'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getPriorityIcon(suggestion.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{suggestion.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          +{suggestion.suggestedXP} XP
                        </span>
                        <span className={cn('text-xs font-medium', getPriorityColor(suggestion.priority))}>
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{suggestion.reason}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="w-3 h-3" />
                        {suggestion.suggestedDays.length === 7 ? 'Daily' : 
                         suggestion.suggestedDays.length === 5 ? 'Weekdays' :
                         `${suggestion.suggestedDays.length} days/week`}
                      </div>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      selectedSuggestions.has(index)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    )}>
                      {selectedSuggestions.has(index) && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSuggestions([]);
                  setSelectedSuggestions(new Set());
                }}
                className="flex-1"
              >
                Generate New
              </Button>
              <Button 
                onClick={handleCreateSelected}
                disabled={selectedSuggestions.size === 0 || createHabit.isPending}
                className="flex-1"
              >
                {createHabit.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Add {selectedSuggestions.size} {selectedSuggestions.size === 1 ? 'Habit' : 'Habits'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
