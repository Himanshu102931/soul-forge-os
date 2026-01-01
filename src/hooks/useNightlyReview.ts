/**
 * useNightlyReview Hook
 * Centralizes nightly review logic and state management
 */

import { useState, useCallback } from 'react';
import { useTodayHabits } from '@/hooks/useHabits';
import { useTodayTasks } from '@/hooks/useTasks';
import { useTodaySummary, useRecentSummaries } from '@/hooks/useDailySummary';
import { useMetrics } from '@/hooks/useMetrics';
import { useProfile } from '@/hooks/useProfile';
import { calculateHPDamage } from '@/lib/rpg-utils';
import { generateLocalRoast, DailyStats } from '@/lib/local-roast';
import { generateAIDrillSergeantRoast } from '@/lib/ai-service';
import { loadAIConfig } from '@/lib/encryption';
import { useAuth } from '@/contexts/AuthContext';

export function useNightlyReview() {
  // Form state
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState('');
  const [sleep, setSleep] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [exceptions, setExceptions] = useState<Record<string, boolean>>({});
  
  // AI roast state
  const [roast, setRoast] = useState<string>('');
  const [isAIRoast, setIsAIRoast] = useState(false);
  const [aiTokensUsed, setAiTokensUsed] = useState(0);
  const [aiCost, setAiCost] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string>('');
  
  // Loading states
  const [isUpdatingHabits, setIsUpdatingHabits] = useState(false);

  // Data hooks
  const { user } = useAuth();
  const { badHabits, todayHabits } = useTodayHabits();
  const { data: todayTasks } = useTodayTasks();
  const { data: existingSummary } = useTodaySummary();
  const { data: recentSummaries } = useRecentSummaries(7);
  const { data: profile } = useProfile();
  const { data: metrics } = useMetrics();
  const aiConfig = loadAIConfig();

  // Calculations
  const uncheckedBadHabits = badHabits.filter(h => h.todayLog?.status !== 'completed');
  
  const missedHabits = todayHabits.filter(h => 
    !h.todayLog || h.todayLog.status === 'missed' || !h.todayLog.status
  );

  const skippedHabits = todayHabits.filter(h => h.todayLog?.status === 'skipped');
  
  const incompleteTasks = todayTasks?.filter(t => !t.completed) || [];

  const xpEarned = todayHabits.reduce((acc, h) => {
    if (h.todayLog?.status === 'completed') return acc + (h.xp_reward || 10);
    if (h.todayLog?.status === 'partial') return acc + Math.floor((h.xp_reward || 10) / 2);
    return acc;
  }, 0) + badHabits.reduce((acc, h) => {
    if (h.todayLog?.status === 'completed') return acc + (h.xp_reward || 10);
    return acc;
  }, 0);

  const missedCount = missedHabits.length;
  const incompleteCount = incompleteTasks.length;
  const hpLost = calculateHPDamage(missedCount, incompleteCount);

  // Generate roast function
  const generateRoast = useCallback(async (useAI: boolean = true) => {
    const sleepValue = sleep ? parseFloat(sleep) : (metrics?.sleep || 0);
    const stepsValue = steps ? parseInt(steps) : (metrics?.steps || 0);
    
    const dailyStats: DailyStats = {
      sleepHours: sleepValue,
      missedHabits: missedCount,
      completedHabits: todayHabits.filter(h => h.todayLog?.status === 'completed').length,
      totalHabits: todayHabits.length,
      steps: stepsValue,
      skippedHabits: skippedHabits.length,
      partialHabits: todayHabits.filter(h => h.todayLog?.status === 'partial').length,
      resistanceCompleted: badHabits.filter(h => h.todayLog?.status === 'completed').length,
      resistanceTotal: badHabits.length,
    };

    const shouldUseAI = useAI && aiConfig.enabled && aiConfig.apiKey && aiConfig.provider !== 'local';
    
    if (shouldUseAI) {
      setIsGeneratingAI(true);
      setRateLimitError('');
      
      try {
        const last7Days: DailyStats[] = recentSummaries?.slice(0, 7).map(() => ({
          sleepHours: 0,
          missedHabits: 0,
          completedHabits: 0,
          totalHabits: 0,
          steps: 0,
          skippedHabits: 0,
          partialHabits: 0,
          resistanceCompleted: 0,
          resistanceTotal: 0,
        })) || [];
        
        const aiResult = await generateAIDrillSergeantRoast(dailyStats, last7Days, user?.id);
        
        if (aiResult.rateLimited) {
          setRateLimitError(aiResult.error || 'Rate limit exceeded');
          setIsAIRoast(false);
          const localRoast = generateLocalRoast(dailyStats);
          setRoast(localRoast);
          return localRoast;
        }
        
        if (aiResult.success && aiResult.roast) {
          setIsAIRoast(true);
          setAiTokensUsed(aiResult.tokensUsed || 0);
          setAiCost(aiResult.cost || 0);
          setRoast(aiResult.roast);
          setIsGeneratingAI(false);
          return aiResult.roast;
        }
      } catch (error) {
        console.error('AI roast failed:', error);
      }
      setIsGeneratingAI(false);
    }
    
    // Fallback to local roast
    setIsAIRoast(false);
    const localRoast = generateLocalRoast(dailyStats);
    setRoast(localRoast);
    return localRoast;
  }, [sleep, steps, metrics, missedCount, todayHabits, skippedHabits, badHabits, aiConfig, recentSummaries, user?.id]);

  // Reset form
  const resetForm = useCallback(() => {
    setStep(0);
    setNotes('');
    setSteps('');
    setSleep('');
    setMood(null);
    setExceptions({});
    setRoast('');
    setIsAIRoast(false);
    setAiTokensUsed(0);
    setAiCost(0);
    setIsGeneratingAI(false);
    setRateLimitError('');
    setIsUpdatingHabits(false);
  }, []);

  return {
    // Form state
    step,
    setStep,
    notes,
    setNotes,
    steps,
    setSteps,
    sleep,
    setSleep,
    mood,
    setMood,
    exceptions,
    setExceptions,
    
    // AI state
    roast,
    isAIRoast,
    aiTokensUsed,
    aiCost,
    isGeneratingAI,
    rateLimitError,
    
    // Loading state
    isUpdatingHabits,
    setIsUpdatingHabits,
    
    // Data
    badHabits,
    todayHabits,
    todayTasks,
    existingSummary,
    recentSummaries,
    profile,
    metrics,
    uncheckedBadHabits,
    missedHabits,
    skippedHabits,
    incompleteTasks,
    xpEarned,
    hpLost,
    aiConfig,
    
    // Functions
    generateRoast,
    resetForm,
  };
}
