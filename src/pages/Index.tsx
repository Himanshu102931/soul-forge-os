import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { motion } from 'framer-motion';
import { CharacterCard } from '@/components/CharacterCard';
=======
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion } from 'framer-motion';
import { RPGHeader } from '@/components/RPGHeader';
>>>>>>> cf46c6e (Initial commit: project files)
import { HorizonWidget } from '@/components/HorizonWidget';
import { HabitTracker } from '@/components/HabitTracker';
import { QuickMetrics } from '@/components/QuickMetrics';
import { NightlyReviewModal } from '@/components/NightlyReviewModal';
<<<<<<< HEAD
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { AICoachCard } from '@/components/AICoachCard';
import { AchievementUnlockToast, Achievement } from '@/components/AchievementUnlockToast';
=======
>>>>>>> cf46c6e (Initial commit: project files)
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { formatDateDisplay } from '@/lib/time-utils';
<<<<<<< HEAD
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
        setUnlockedAchievement(achievement as unknown as Achievement);
      }
      setPreviousAchievementCount(currentCount);
    }
  }, [gamificationStats, hasInitializedAchievements, previousAchievementCount]);

  return (
    <div className="space-y-4 pb-24 md:pb-8">
=======
import { useQueryClient } from '@tanstack/react-query';

export default function Index() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.time('DashboardLoad');
    }
    return () => {
      if (import.meta.env.DEV) {
        console.timeEnd('DashboardLoad');
      }
    };
  }, []);

  const [reviewOpen, setReviewOpen] = useState(false);
  const { logicalDate } = useLogicalDate();
  const queryClient = useQueryClient();

  const handleRefreshAll = () => {
    // Invalidate all dashboard-related queries (all variants)
    queryClient.invalidateQueries({ queryKey: ['profile'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['tasks'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['habits'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['metrics'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['daily-summary'], exact: false });
  };

  return (
    <div className="space-y-4 pb-28 md:pb-8">
>>>>>>> cf46c6e (Initial commit: project files)
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
<<<<<<< HEAD
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
=======
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{formatDateDisplay(logicalDate)}</p>
        </div>
        <button
          className="ml-auto px-3 py-1.5 rounded bg-secondary text-xs font-medium border border-border hover:bg-muted transition"
          onClick={handleRefreshAll}
        >
          Refresh All
        </button>
      </motion.div>

      <RPGHeader />
      <HorizonWidget />
      <HabitTracker />
      <QuickMetrics />

      {/* FAB for Nightly Review - 56x56px for comfortable mobile tap */}
      <Button
        size="lg"
        className="fixed bottom-32 right-4 md:bottom-8 md:right-8 min-w-[56px] min-h-[56px] w-14 h-14 rounded-full shadow-lg glow-xp"
>>>>>>> cf46c6e (Initial commit: project files)
        onClick={() => setReviewOpen(true)}
      >
        <Moon className="w-6 h-6" />
      </Button>

      <NightlyReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
<<<<<<< HEAD
      
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
=======
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
>>>>>>> cf46c6e (Initial commit: project files)
    </div>
  );
}
