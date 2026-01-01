import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGamificationStats } from '@/hooks/useGamification';
import { useStaggeredAnimation, ANIMATION_TIMINGS } from '@/lib/animation-optimizer';
import { generateAriaLabel } from '@/lib/accessibility';

export function AchievementsCard() {
  const { data: stats, isLoading } = useGamificationStats();
  const itemCount = (stats?.unlockedAchievements.length || 0) + (stats?.nextAchievements.length || 0);
  const staggerVariants = useStaggeredAnimation(Math.max(1, itemCount));

  if (isLoading) {
    return <LoadingCard rows={3} />;
  }

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
      className="bg-card border border-border rounded-xl p-6"
      role="region"
      aria-label="Achievements"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Achievements</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {stats.unlockedAchievements.length} / {stats.unlockedAchievements.length + stats.nextAchievements.length}
        </div>
      </div>

      {/* Unlocked Achievements */}
      {stats.unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Unlocked ({stats.unlockedAchievements.length})</h4>
          <motion.div
            variants={staggerVariants.container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {stats.unlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={staggerVariants.item}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg hover:border-yellow-500/40 transition-colors"
                role="article"
                aria-label={generateAriaLabel({
                  type: 'achievement',
                  label: achievement.name,
                  state: 'unlocked',
                })}
              >
                <span className="text-2xl">{achievement.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
                  +{achievement.xpReward} XP
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Upcoming Achievements */}
      {stats.nextAchievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Next Goals</h4>
          <motion.div
            variants={staggerVariants.container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {stats.nextAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={staggerVariants.item}
                className="flex items-start gap-3 p-3 bg-secondary/30 border border-border rounded-lg opacity-60 hover:opacity-80 transition-opacity"
                role="article"
                aria-label={generateAriaLabel({
                  type: 'achievement',
                  label: achievement.name,
                  state: 'locked',
                })}
              >
                <span className="text-2xl grayscale">{achievement.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{achievement.name}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
                <Badge variant="outline" className="ml-auto text-xs flex-shrink-0">
                  +{achievement.xpReward} XP
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* No Achievements */}
      {stats.unlockedAchievements.length === 0 && stats.nextAchievements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No achievements yet. Complete habits to unlock achievements!</p>
        </div>
      )}
    </motion.div>
  );
}
