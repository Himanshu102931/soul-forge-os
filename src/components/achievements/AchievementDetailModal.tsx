import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ANIMATION_TIMINGS, SPRING_CONFIGS } from '@/lib/animation-optimizer';

interface AchievementWithStatus {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  condition: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface AchievementDetailModalProps {
  achievement: AchievementWithStatus | null;
  onClose: () => void;
}

export function AchievementDetailModal({ achievement, onClose }: AchievementDetailModalProps) {
  if (!achievement) return null;

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sticky top-0 bg-background z-10">
          <DialogTitle className="text-lg">{achievement?.name}</DialogTitle>
        </DialogHeader>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
            className="space-y-6"
            role="dialog"
            aria-labelledby="achievement-title"
            aria-describedby="achievement-description"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...SPRING_CONFIGS.STANDARD }}
                className={`w-32 h-32 rounded-2xl border-4 flex items-center justify-center ${
                  achievement.isUnlocked
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-amber-500/20'
                    : 'border-border bg-secondary/50 grayscale opacity-60'
                }`}
              >
                <span className="text-7xl">{achievement.emoji}</span>
              </motion.div>
            </div>

            {/* Title & Status */}
            <div className="text-center space-y-2">
              <h2 id="achievement-title" className="text-2xl font-bold">{achievement.name}</h2>
              <div className="flex items-center justify-center gap-2">
                {achievement.isUnlocked ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    ✓ Unlocked
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {achievement.xpReward} XP
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <p id="achievement-description" className="text-sm text-muted-foreground text-center">
                {achievement.description}
              </p>
            </div>

            {/* Unlock Condition */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">How to Unlock</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm">{achievement.condition}</p>
              </div>
            </div>

            {/* Unlock Date */}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Close Button */}
            <Button onClick={onClose} className="w-full" variant="outline">
              Close
            </Button>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
