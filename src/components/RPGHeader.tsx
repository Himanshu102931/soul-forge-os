import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { calculateLevelProgress, calculateLevelThreshold } from '@/lib/rpg-utils';
import { Shield, Zap } from 'lucide-react';

export function RPGHeader() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="p-4 bg-card rounded-lg animate-pulse">
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    );
  }

  const xpProgress = calculateLevelProgress(profile.xp, profile.level);
  const xpThreshold = calculateLevelThreshold(profile.level);
  const hpProgress = (profile.hp / profile.max_hp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-4">
        {/* Level Circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary glow-xp">
            <span className="text-2xl font-bold text-primary">{profile.level}</span>
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium bg-background px-2 rounded">
            LVL
          </span>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-3">
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-xp">
                <Zap className="w-3 h-3" />
                <span className="font-medium">XP</span>
              </div>
              <span className="text-muted-foreground">
                {profile.xp} / {xpThreshold}
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
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
                <Shield className="w-3 h-3" />
                <span className="font-medium">HP</span>
              </div>
              <span className="text-muted-foreground">
                {profile.hp} / {profile.max_hp}
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
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
