import { motion } from 'framer-motion';
import { useGamificationStats, useXPProgress } from '@/hooks/useGamification';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingCard } from '@/components/ui/loading-skeleton';
import { Flame, Zap, Trophy, Star, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserLevelCard() {
  const { data: xpProgress, isLoading } = useXPProgress();

  if (isLoading) {
    return (
      <LoadingCard 
        className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20" 
        showAvatar 
        rows={2}
      />
    );
  }

  if (!xpProgress) return null;

  const filledWidth = Math.min(xpProgress.progressPercent, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-6"
    >
      {/* Level Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">{xpProgress.currentLevelEmoji}</span>
            <div>
              <h2 className="text-2xl font-bold">Level {xpProgress.currentLevel}</h2>
              <p className="text-sm text-muted-foreground">{xpProgress.currentLevelTitle}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{xpProgress.totalXP.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total XP</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">Progress to Next Level</span>
          <span className="text-xs text-muted-foreground">
            {xpProgress.xpInLevel} / {xpProgress.xpNeededForLevel}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${filledWidth}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-primary to-purple-500 h-full rounded-full"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {xpProgress.xpToNextLevel} XP to level up
        </div>
      </div>
    </motion.div>
  );
}

export function GamificationStatsCard() {
  const { data: stats, isLoading } = useGamificationStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { icon: Flame, label: 'Current Streak', value: stats.currentStreak, color: 'text-orange-500', bgColor: 'from-orange-500/10' },
    { icon: Trophy, label: 'Total Completions', value: stats.totalCompletions, color: 'text-green-500', bgColor: 'from-green-500/10' },
    { icon: Zap, label: 'Today\'s Completions', value: stats.todayCompletions, color: 'text-yellow-500', bgColor: 'from-yellow-500/10' },
    { icon: Star, label: 'Achievements', value: stats.unlockedAchievements.length, color: 'text-purple-500', bgColor: 'from-purple-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              'bg-gradient-to-br border rounded-xl p-4',
              `${stat.bgColor} to-transparent border-border/50`
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('w-5 h-5', stat.color)} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className={cn('text-3xl font-bold', stat.color)}>
              {stat.value}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function AchievementsSection() {
  const { data: stats, isLoading } = useGamificationStats();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Gift className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Achievements</h3>
      </div>

      {/* Unlocked Achievements */}
      {stats.unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Unlocked ({stats.unlockedAchievements.length})</h4>
          <div className="space-y-2">
            {stats.unlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg"
              >
                <span className="text-2xl">{achievement.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">
                  +{achievement.xpReward} XP
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Achievements */}
      {stats.nextAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Next Goals</h4>
          <div className="space-y-2">
            {stats.nextAchievements.slice(0, 2).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start gap-3 p-3 bg-secondary/30 border border-border rounded-lg opacity-60"
              >
                <span className="text-2xl grayscale">{achievement.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant="outline" className="ml-auto text-xs">
                  +{achievement.xpReward} XP
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function GamificationWidget() {
  return (
    <div className="space-y-6">
      <UserLevelCard />
      <GamificationStatsCard />
      <AchievementsSection />
    </div>
  );
}
