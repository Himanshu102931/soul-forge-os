import { motion } from 'framer-motion';
import { Flame, Target, Zap, Crown, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EnhancedProgress } from '@/components/ui/enhanced-progress';
import { LoadingGrid, LoadingCard } from '@/components/ui/loading-skeleton';
import { useGamificationStats } from '@/hooks/useGamification';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { ANIMATION_TIMINGS } from '@/lib/animation-optimizer';
import { generateAriaLabel } from '@/lib/accessibility';

interface MilestoneCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  bgColor: string;
  isUnlocked?: boolean;
}

function MilestoneCard({ icon: Icon, title, description, current, target, unit, color, bgColor, isUnlocked }: MilestoneCardProps) {
  const progress = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
      className={cn(
        "bg-card border rounded-xl p-4 transition-all",
        isUnlocked ? "border-primary/50 bg-gradient-to-br from-primary/5 to-transparent" : "border-border"
      )}
      role="article"
      aria-label={generateAriaLabel({
        type: 'achievement',
        label: title,
        state: isUnlocked ? 'unlocked' : 'locked',
        count: Math.round(progress),
      })}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", bgColor)}>
            <Icon className={cn("w-4 h-4", color)} />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {isUnlocked && (
          <Badge variant="secondary" className="text-xs">
            ✓ Unlocked
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className={color}>
            {current} / {target} {unit}
          </span>
          {!isUnlocked && (
            <span className="text-xs text-muted-foreground">
              {remaining} {unit} to go
            </span>
          )}
        </div>
        <EnhancedProgress 
          value={current} 
          max={target}
          isNearComplete={progress >= 80}
          animated
        />
      </div>
    </motion.div>
  );
}

export function AchievementOverview() {
  const { data: stats, isLoading } = useGamificationStats();
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard rows={2} />
        <LoadingGrid columns={2} rows={3} className="grid-cols-1 md:grid-cols-2" />
      </div>
    );
  }

  if (!stats || !profile) return null;

  const currentStreak = stats.currentStreak || 0;
  const totalCompletions = stats.totalCompletions || 0;
  const totalXP = profile.xp || 0;
  const currentLevel = profile.level || 1;

  // Define milestone tiers
  const streakMilestones = [
    { target: 7, description: '7-day streak', isUnlocked: currentStreak >= 7 },
    { target: 14, description: '14-day streak', isUnlocked: currentStreak >= 14 },
    { target: 30, description: '30-day streak', isUnlocked: currentStreak >= 30 },
    { target: 60, description: '60-day streak', isUnlocked: currentStreak >= 60 },
    { target: 100, description: '100-day streak', isUnlocked: currentStreak >= 100 },
  ];

  const completionMilestones = [
    { target: 10, description: '10 completions', isUnlocked: totalCompletions >= 10 },
    { target: 50, description: '50 completions', isUnlocked: totalCompletions >= 50 },
    { target: 100, description: '100 completions', isUnlocked: totalCompletions >= 100 },
    { target: 500, description: '500 completions', isUnlocked: totalCompletions >= 500 },
    { target: 1000, description: '1000 completions', isUnlocked: totalCompletions >= 1000 },
  ];

  const xpMilestones = [
    { target: 1000, description: '1K XP earned', isUnlocked: totalXP >= 1000 },
    { target: 5000, description: '5K XP earned', isUnlocked: totalXP >= 5000 },
    { target: 10000, description: '10K XP earned', isUnlocked: totalXP >= 10000 },
    { target: 50000, description: '50K XP earned', isUnlocked: totalXP >= 50000 },
    { target: 100000, description: '100K XP earned', isUnlocked: totalXP >= 100000 },
  ];

  const levelMilestones = [
    { target: 10, description: 'Reach level 10', isUnlocked: currentLevel >= 10 },
    { target: 25, description: 'Reach level 25', isUnlocked: currentLevel >= 25 },
    { target: 50, description: 'Reach level 50', isUnlocked: currentLevel >= 50 },
    { target: 100, description: 'Reach level 100', isUnlocked: currentLevel >= 100 },
    { target: 250, description: 'Reach level 250', isUnlocked: currentLevel >= 250 },
  ];

  // Find next milestone for each category
  const nextStreakMilestone = streakMilestones.find(m => !m.isUnlocked) || streakMilestones[streakMilestones.length - 1];
  const nextCompletionMilestone = completionMilestones.find(m => !m.isUnlocked) || completionMilestones[completionMilestones.length - 1];
  const nextXPMilestone = xpMilestones.find(m => !m.isUnlocked) || xpMilestones[xpMilestones.length - 1];
  const nextLevelMilestone = levelMilestones.find(m => !m.isUnlocked) || levelMilestones[levelMilestones.length - 1];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div>
            <h2 className="text-lg font-bold">Achievement Progress</h2>
            <p className="text-sm text-muted-foreground">
              {stats.unlockedAchievements.length} achievements unlocked
            </p>
          </div>
        </div>
      </motion.div>

      {/* Milestone Categories - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Streak Milestones */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Streak Milestones
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <MilestoneCard
              icon={Flame}
              title={nextStreakMilestone.description}
              description="Maintain your habit streak"
              current={currentStreak}
              target={nextStreakMilestone.target}
              unit="days"
              color="text-orange-500"
              bgColor="bg-orange-500/10"
              isUnlocked={nextStreakMilestone.isUnlocked}
            />
          </div>
        </div>

        {/* Completion Milestones */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            Completion Milestones
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <MilestoneCard
              icon={Target}
              title={nextCompletionMilestone.description}
              description="Complete habits consistently"
              current={totalCompletions}
              target={nextCompletionMilestone.target}
              unit="habits"
              color="text-green-500"
              bgColor="bg-green-500/10"
              isUnlocked={nextCompletionMilestone.isUnlocked}
            />
          </div>
        </div>

        {/* XP Milestones */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            XP Milestones
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <MilestoneCard
              icon={Zap}
              title={nextXPMilestone.description}
              description="Earn experience points"
              current={totalXP}
              target={nextXPMilestone.target}
              unit="XP"
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
              isUnlocked={nextXPMilestone.isUnlocked}
            />
          </div>
        </div>

        {/* Level Milestones */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-500" />
            Level Milestones
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <MilestoneCard
              icon={Crown}
              title={nextLevelMilestone.description}
              description="Level up your character"
              current={currentLevel}
              target={nextLevelMilestone.target}
              unit="levels"
              color="text-purple-500"
              bgColor="bg-purple-500/10"
              isUnlocked={nextLevelMilestone.isUnlocked}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
