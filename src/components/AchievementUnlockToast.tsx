import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { X } from 'lucide-react';
import { useOptimizedAnimationProps, SPRING_CONFIGS, ANIMATION_TIMINGS, getPrefersReducedMotion } from '@/lib/animation-optimizer';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: string;
}

interface AchievementUnlockToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementUnlockToast({ achievement, onClose }: AchievementUnlockToastProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiActive, setConfettiActive] = useState(true);
  const prefersReducedMotion = getPrefersReducedMotion();

  useEffect(() => {
    if (!achievement) return;

    // Set window size for confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setConfettiActive(false);
      setTimeout(onClose, prefersReducedMotion ? 0 : 300); // Wait for animation to finish
    }, ANIMATION_TIMINGS.CONFETTI_DURATION * 1000);

    return () => clearTimeout(timer);
  }, [achievement, onClose, prefersReducedMotion]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={prefersReducedMotion ? { duration: 0 } : { ...SPRING_CONFIGS.STIFF }}
        className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
      >
        {confettiActive && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={150}
            gravity={0.3}
          />
        )}

        {/* Backdrop Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : ANIMATION_TIMINGS.QUICK }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 pointer-events-auto"
        />

        {/* Toast Content */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: -20 }}
          className="relative bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border-2 border-primary rounded-2xl p-8 max-w-md mx-4 pointer-events-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Achievement Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { ...SPRING_CONFIGS.STIFF, delay: ANIMATION_TIMINGS.STAGGER_ITEM }}
            className="text-7xl mb-4 text-center"
          >
            {achievement.icon}
          </motion.div>

          {/* Achievement Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_TIMINGS.DEFAULT, delay: ANIMATION_TIMINGS.STAGGER_ITEM * 2 }}
            className="text-2xl font-bold text-center mb-2"
          >
            Achievement Unlocked!
          </motion.h2>

          {/* Achievement Name */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_TIMINGS.DEFAULT, delay: ANIMATION_TIMINGS.STAGGER_ITEM * 3 }}
            className="text-xl font-bold text-primary text-center mb-2"
          >
            {achievement.title}
          </motion.h3>

          {/* Achievement Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: ANIMATION_TIMINGS.DEFAULT, delay: ANIMATION_TIMINGS.STAGGER_ITEM * 4 }}
            className="text-sm text-muted-foreground text-center mb-4"
          >
            {achievement.description}
          </motion.p>

          {/* XP Reward */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: ANIMATION_TIMINGS.DEFAULT, delay: ANIMATION_TIMINGS.STAGGER_ITEM * 5 }}
            className="bg-primary/20 rounded-lg p-3 text-center"
          >
            <div className="text-sm text-muted-foreground">XP Reward</div>
            <div className="text-2xl font-bold text-primary">+{achievement.xpReward}</div>
          </motion.div>

          {/* Auto-dismiss indicator */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: ANIMATION_TIMINGS.CONFETTI_DURATION, ease: 'linear' }}
            style={{ originX: 0 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-b-2xl"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
