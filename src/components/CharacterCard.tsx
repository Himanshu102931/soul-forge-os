import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useGamificationStats, useUserLevel, useUserRank } from '@/hooks/useGamification';
import { calculateLevelProgress, calculateLevelThreshold } from '@/lib/rpg-utils';
import { Shield, Zap, Flame, Trophy, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function CharacterCard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userLevel, isLoading: levelLoading } = useUserLevel();
  const { data: stats, isLoading: statsLoading } = useGamificationStats();
  const { data: rankData, isLoading: rankLoading } = useUserRank();

  if (profileLoading || levelLoading || statsLoading || rankLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-6 mb-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!profile || !userLevel || !stats || !rankData) return null;

  const xpProgress = calculateLevelProgress(profile.xp, profile.level);
  const xpThreshold = calculateLevelThreshold(profile.level);
  const hpProgress = (profile.hp / profile.max_hp) * 100;

  const statCards = [
    { icon: Flame, label: 'Streak', value: stats.currentStreak, color: 'text-orange-500' },
    { icon: Trophy, label: 'Total', value: stats.totalCompletions, color: 'text-green-500' },
    { icon: Zap, label: 'Today', value: stats.todayCompletions, color: 'text-yellow-500' },
    { icon: Star, label: 'Badges', value: stats.unlockedAchievements.length, color: 'text-purple-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 sm:p-5"
    >
      {/* Top Row: Circle + XP/HP Bars */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        {/* Level Circle - Outline Only */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-transparent flex items-center justify-center border-[3px] border-primary">
            <span className="text-2xl sm:text-3xl font-bold text-primary">{profile.level}</span>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium bg-background px-2 rounded">
            LVL
          </span>
        </div>

        {/* XP and HP Bars */}
        <div className="flex-1 space-y-2.5">
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-xp">
                <Zap className="w-4 h-4" />
                <span className="font-medium">XP</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {profile.xp} / {xpThreshold}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full gradient-xp rounded-full"
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-hp">
                <Shield className="w-4 h-4" />
                <span className="font-medium">HP</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {profile.hp} / {profile.max_hp}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hpProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full gradient-hp rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
