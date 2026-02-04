import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { calculateLevelProgress, calculateLevelThreshold } from '@/lib/rpg-utils';
import { Shield, Zap } from 'lucide-react';
<<<<<<< HEAD

export function RPGHeader() {
  const { data: profile, isLoading } = useProfile();
=======
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useMemo } from 'react';

export function RPGHeader() {
  const { data: profile, isLoading } = useProfile();
  const { toast } = useToast();
  const hasShownWarningRef = useRef(false);

  const xpProgress = profile ? calculateLevelProgress(profile.xp, profile.level) : 0;
  const xpThreshold = profile ? calculateLevelThreshold(profile.level) : 0;
  const hpProgress = profile ? (profile.hp / profile.max_hp) * 100 : 0;
  const isHPCritical = profile && profile.hp <= 20;

  // Show warning when HP is critical (once per session)
  useEffect(() => {
    if (isHPCritical && !hasShownWarningRef.current && profile) {
      hasShownWarningRef.current = true;
      toast({
        title: '⚠️ HP Critical!',
        description: `HP is at ${profile.hp}/${profile.max_hp}. Complete habits to avoid level down.`,
        variant: 'destructive',
      });
    }
    // Reset warning if HP recovers above 30
    if (profile && profile.hp > 30) {
      hasShownWarningRef.current = false;
    }
  }, [isHPCritical, profile, toast]);

  const lastUpdated = useMemo(() => profile?.updated_at ? new Date(profile.updated_at) : null, [profile]);
>>>>>>> cf46c6e (Initial commit: project files)

  if (isLoading || !profile) {
    return (
      <div className="p-4 bg-card rounded-lg animate-pulse">
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    );
  }

<<<<<<< HEAD
  const xpProgress = calculateLevelProgress(profile.xp, profile.level);
  const xpThreshold = calculateLevelThreshold(profile.level);
  const hpProgress = (profile.hp / profile.max_hp) * 100;

=======
>>>>>>> cf46c6e (Initial commit: project files)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-4">
        {/* Level Circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary glow-xp">
            <span className="text-2xl font-bold text-primary">{profile.level}</span>
=======
      className="bg-card border border-border rounded-xl p-3 md:p-4"
    >
      <div className="flex items-center gap-3 md:gap-4" aria-label="Profile Stats Header">
        {/* Level Circle */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary glow-xp">
            <span className="text-xl md:text-2xl font-bold text-primary">{profile.level}</span>
>>>>>>> cf46c6e (Initial commit: project files)
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium bg-background px-2 rounded">
            LVL
          </span>
        </div>

        {/* Bars */}
<<<<<<< HEAD
        <div className="flex-1 space-y-3">
=======
        <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
>>>>>>> cf46c6e (Initial commit: project files)
          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-xp">
                <Zap className="w-3 h-3" />
                <span className="font-medium">XP</span>
              </div>
<<<<<<< HEAD
              <span className="text-muted-foreground">
                {profile.xp} / {xpThreshold}
              </span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
=======
              <span className="text-muted-foreground text-xs">
                {profile.xp} / {xpThreshold}
              </span>
            </div>
            <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
>>>>>>> cf46c6e (Initial commit: project files)
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
<<<<<<< HEAD
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
=======
              <span className={`text-xs ${isHPCritical ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                {profile.hp} / {profile.max_hp}
              </span>
            </div>
            <div className="h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${hpProgress}%`,
                  scale: isHPCritical ? [1, 1.05, 1] : 1,
                }}
                transition={{ 
                  width: { duration: 0.5, ease: 'easeOut' },
                  scale: { duration: 1, repeat: isHPCritical ? Infinity : 0, ease: 'easeInOut' }
                }}
                className={`h-full rounded-full ${isHPCritical ? 'bg-destructive' : 'gradient-hp'}`}
>>>>>>> cf46c6e (Initial commit: project files)
              />
            </div>
          </div>
        </div>
      </div>
<<<<<<< HEAD
=======
      {lastUpdated && (
        <div className="text-right text-xs text-muted-foreground mt-1">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
>>>>>>> cf46c6e (Initial commit: project files)
    </motion.div>
  );
}
