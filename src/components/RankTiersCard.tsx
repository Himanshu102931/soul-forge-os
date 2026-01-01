import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useUserRank } from '@/hooks/useGamification';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Zap } from 'lucide-react';

export function RankTiersCard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: rankData, isLoading: rankLoading } = useUserRank();

  if (profileLoading || rankLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Rank Tiers</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile || !rankData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Rank Progression</h3>
        <p className="text-sm text-muted-foreground">
          Your journey from F rank to ZENITH
        </p>
      </div>

      {/* All Ranks */}
      <div className="space-y-2">
        {rankData.ranksWithStatus.map((rank, idx) => {
          const isUnlocked = rank.isUnlocked;
          const isCurrent = rank.isCurrentRank;
          const showProgress = isUnlocked && !isCurrent;

          return (
            <motion.div
              key={rank.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-lg border p-3 transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/10'
                  : isUnlocked
                    ? 'border-border bg-background'
                    : 'border-border/50 bg-background/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{rank.badge}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{rank.name}</span>
                      {isCurrent && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          CURRENT
                        </span>
                      )}
                      {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{rank.description}</p>
                  </div>
                </div>

                <div className="text-right ml-4 shrink-0">
                  <div className="text-sm font-mono text-muted-foreground">
                    Lv. {rank.minLevel}-{rank.maxLevel}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-primary font-medium mt-1">
                      {rank.progress}%
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for current rank */}
              {isCurrent && (
                <div className="mt-3">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rank.progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Progress bar for unlocked non-current */}
              {showProgress && rank.progress > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden opacity-50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `100%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-muted-foreground to-muted rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Next Rank Info */}
      {rankData.nextRank && !rankData.ranksWithStatus[rankData.ranksWithStatus.length - 1].isCurrentRank && (
        <div className="mt-6 p-4 border-l-2 border-primary bg-primary/5 rounded">
          <div className="flex items-start gap-2">
            <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Next Goal</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reach Level {rankData.nextRank.minLevel} to unlock{' '}
                <span className="font-bold text-primary">{rankData.nextRank.badge} {rankData.nextRank.name}</span> rank
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Zenith Achievement */}
      {rankData.ranksWithStatus[rankData.ranksWithStatus.length - 1].isCurrentRank && (
        <div className="mt-6 p-4 border-2 border-amber-500 bg-amber-500/10 rounded-lg text-center">
          <p className="text-2xl mb-2">💎</p>
          <p className="font-bold text-amber-600">ZENITH ACHIEVED!</p>
          <p className="text-xs text-amber-600/80 mt-1">The ultimate goal - legendary mastery</p>
        </div>
      )}
    </motion.div>
  );
}
