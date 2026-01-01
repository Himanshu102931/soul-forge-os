import { motion } from 'framer-motion';
import { Flame, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useGamificationStats } from '@/hooks/useGamification';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';

export function AchievementMilestoneSummary() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGamificationStats();
  const { data: profile } = useProfile();

  if (isLoading) {
    return <Skeleton className="h-48" />;
  }

  if (!stats || !profile) return null;

  const currentStreak = stats.currentStreak || 0;
  const totalCompletions = stats.totalCompletions || 0;

  // Define next milestones
  const streakMilestones = [7, 14, 30, 60, 100];
  const completionMilestones = [10, 50, 100, 500, 1000];

  const nextStreakMilestone = streakMilestones.find(m => m > currentStreak) || streakMilestones[streakMilestones.length - 1];
  const nextCompletionMilestone = completionMilestones.find(m => m > totalCompletions) || completionMilestones[completionMilestones.length - 1];

  const streakProgress = Math.min((currentStreak / nextStreakMilestone) * 100, 100);
  const completionProgress = Math.min((totalCompletions / nextCompletionMilestone) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🏆 Achievements</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/achievements')}
          className="gap-2"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Streak Milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Streak Milestones</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStreak} / {nextStreakMilestone} days
            </span>
          </div>
          <Progress value={streakProgress} className="h-2" />
        </div>

        {/* Completion Milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Completion Milestones</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {totalCompletions} / {nextCompletionMilestone} habits
            </span>
          </div>
          <Progress value={completionProgress} className="h-2" />
        </div>

        {/* Summary */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {stats.unlockedAchievements.length} achievements unlocked
        </p>
      </div>
    </motion.div>
  );
}
