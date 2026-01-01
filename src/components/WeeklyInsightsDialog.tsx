import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateWeeklyInsights, WeeklyStats } from '@/lib/ai-weekly-insights';
import { Loader2, Sparkles, TrendingUp, Trophy, Target, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekStats?: WeeklyStats;
}

export function WeeklyInsightsDialog({ open, onOpenChange, weekStats }: WeeklyInsightsDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<{
    summary: string;
    wins: string[];
    improvements: string[];
    nextWeekFocus: string;
    motivationalMessage: string;
  } | null>(null);
  
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!weekStats) return;
    
    setIsGenerating(true);
    const result = await generateWeeklyInsights(weekStats);
    
    if (result.success && result.summary) {
      setInsights({
        summary: result.summary,
        wins: result.wins || [],
        improvements: result.improvements || [],
        nextWeekFocus: result.nextWeekFocus || '',
        motivationalMessage: result.motivationalMessage || '',
      });
    } else {
      toast({
        title: 'Failed to Generate Insights',
        description: result.error || 'Please try again',
        variant: 'destructive',
      });
    }
    
    setIsGenerating(false);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getCompletionEmoji = (rate: number) => {
    if (rate >= 90) return '🔥';
    if (rate >= 80) return '💪';
    if (rate >= 70) return '👍';
    if (rate >= 60) return '✊';
    return '🌱';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Insights
          </DialogTitle>
        </DialogHeader>

        {!insights ? (
          <div className="space-y-6 py-4">
            {weekStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <div className={`text-2xl font-bold ${getCompletionColor(weekStats.completionRate)}`}>
                    {Math.round(weekStats.completionRate)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Completion</div>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <div className="text-2xl font-bold text-primary">{weekStats.xpGained}</div>
                  <div className="text-xs text-muted-foreground mt-1">XP Gained</div>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <div className="text-2xl font-bold">{weekStats.bestStreak}</div>
                  <div className="text-xs text-muted-foreground mt-1">Best Streak</div>
                </div>
                
                <div className="p-4 rounded-lg bg-secondary/50 text-center">
                  <div className="text-2xl">{getCompletionEmoji(weekStats.completionRate)}</div>
                  <div className="text-xs text-muted-foreground mt-1">This Week</div>
                </div>
              </div>
            )}

            <div className="text-center space-y-3">
              <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Get Your Weekly Summary</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                AI will analyze your week's performance and provide personalized insights, wins, and actionable improvements.
              </p>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !weekStats}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Your Week...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">{insights.summary}</p>
              </div>
            </div>

            {/* Wins */}
            {insights.wins.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-medium">This Week's Wins</h4>
                </div>
                <div className="space-y-2">
                  {insights.wins.map((win, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <div className="text-green-500 text-xl flex-shrink-0">✓</div>
                      <p className="text-sm">{win}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {insights.improvements.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h4 className="text-sm font-medium">Areas to Improve</h4>
                </div>
                <div className="space-y-2">
                  {insights.improvements.map((improvement, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (insights.wins.length + i) * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <div className="text-blue-500 text-xl flex-shrink-0">→</div>
                      <p className="text-sm">{improvement}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Week Focus */}
            {insights.nextWeekFocus && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Next Week's Focus</h4>
                    <p className="text-sm text-muted-foreground">{insights.nextWeekFocus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Message */}
            {insights.motivationalMessage && (
              <div className="text-center p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm font-medium">{insights.motivationalMessage}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setInsights(null)}
                className="flex-1"
              >
                Generate New
              </Button>
              <Button 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
