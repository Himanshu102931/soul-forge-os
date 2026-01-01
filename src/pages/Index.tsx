import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CharacterCard } from '@/components/CharacterCard';
import { HorizonWidget } from '@/components/HorizonWidget';
import { HabitTracker } from '@/components/HabitTracker';
import { QuickMetrics } from '@/components/QuickMetrics';
import { NightlyReviewModal } from '@/components/NightlyReviewModal';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { AICoachCard } from '@/components/AICoachCard';
import { AchievementUnlockToast, Achievement } from '@/components/AchievementUnlockToast';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { formatDateDisplay } from '@/lib/time-utils';
import { useHabits } from '@/hooks/useHabits';
import { useGamificationStats } from '@/hooks/useGamification';
import { GAMIFICATION_ACHIEVEMENTS } from '@/lib/gamification-utils';

export default function Index() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0);
  const [hasInitializedAchievements, setHasInitializedAchievements] = useState(false);
  const { logicalDate } = useLogicalDate();
  const { data: habits } = useHabits();
  const { data: gamificationStats } = useGamificationStats();
  
  // Show onboarding for new users with no habits
  useEffect(() => {
    if (habits && habits.length === 0) {
      const hasSeenOnboarding = localStorage.getItem('life-os-onboarding-seen');
      if (!hasSeenOnboarding) {
        setOnboardingOpen(true);
      }
    }
  }, [habits]);

  // Track achievement unlocks
  useEffect(() => {
    if (!gamificationStats) return;

    const currentCount = gamificationStats.unlockedAchievements.length;

    // Initialize on first load (don't show toast)
    if (!hasInitializedAchievements) {
      setPreviousAchievementCount(currentCount);
      setHasInitializedAchievements(true);
      return;
    }

    // Only show toast when achievements count increases (after initialization)
    if (currentCount > previousAchievementCount) {
      const newAchievements = gamificationStats.unlockedAchievements.slice(previousAchievementCount);
      if (newAchievements.length > 0) {
        // Show the first new achievement
        const achievement = newAchievements[0];
        setUnlockedAchievement(achievement as Achievement);
      }
      setPreviousAchievementCount(currentCount);
    }
  }, [gamificationStats, hasInitializedAchievements, previousAchievementCount]);

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{formatDateDisplay(logicalDate)}</p>
        </div>
      </motion.div>

      <CharacterCard />
      <HorizonWidget />
      <HabitTracker />
      <AICoachCard />
      <QuickMetrics />

      {/* FAB for Nightly Review */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full shadow-lg glow-xp"
        onClick={() => setReviewOpen(true)}
      >
        <Moon className="w-6 h-6" />
      </Button>

      <NightlyReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
      
      <OnboardingWizard 
        open={onboardingOpen} 
        onComplete={() => {
          setOnboardingOpen(false);
          localStorage.setItem('life-os-onboarding-seen', 'true');
        }} 
      />

      <AchievementUnlockToast 
        achievement={unlockedAchievement} 
        onClose={() => setUnlockedAchievement(null)} 
      />
    </div>
  );
}
