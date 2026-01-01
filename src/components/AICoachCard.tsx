import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HabitSuggestionsDialog } from '@/components/HabitSuggestionsDialog';
import { WeeklyInsightsDialog } from '@/components/WeeklyInsightsDialog';
import { useHabits } from '@/hooks/useHabits';
import { useLogicalDate } from '@/contexts/LogicalDateContext';
import { Sparkles, Lightbulb, TrendingUp, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllHabitLogs, useHabitStatistics } from '@/hooks/useAdvancedAnalytics';
import { WeeklyStats } from '@/lib/ai-weekly-insights';

export function AICoachCard() {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [weeklyInsightsOpen, setWeeklyInsightsOpen] = useState(false);
  const [monthlyInsightsOpen, setMonthlyInsightsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  
  const { data: habits } = useHabits();
  const { logicalDate } = useLogicalDate();
  const { data: weeklyLogs } = useAllHabitLogs(7);
  const { data: monthlyLogs } = useAllHabitLogs(30);
  const { data: weeklyStats } = useHabitStatistics(7);
  const { data: monthlyStatsData } = useHabitStatistics(30);
  
  // Calculate weekly stats
  const calculatedWeeklyStats: WeeklyStats = useMemo(() => {
    if (!weeklyLogs || !weeklyStats) {
      return {
        totalHabitsCompleted: 0,
        totalHabitsPossible: 0,
        completionRate: 0,
        xpGained: 0,
        bestStreak: 0,
        worstDay: 'Unknown',
        bestDay: 'Unknown',
        topHabits: [],
        strugglingHabits: [],
      };
    }
    
    const completedLogs = weeklyLogs.filter(log => log.status === 'completed');
    const totalCompleted = completedLogs.length;
    const totalPossible = weeklyLogs.length;
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
    
    // Calculate XP (assuming 10 XP per habit)
    const xpGained = totalCompleted * 10;
    
    // Best streak from stats
    const bestStreak = Math.max(...weeklyStats.map(s => s.streak.currentStreak), 0);
    
    // Group by day to find best/worst
    const logsByDay: Record<string, number> = {};
    weeklyLogs.forEach(log => {
      if (log.status === 'completed') {
        logsByDay[log.date] = (logsByDay[log.date] || 0) + 1;
      }
    });
    
    const days = Object.keys(logsByDay);
    let bestDay = 'Unknown';
    let worstDay = 'Unknown';
    
    if (days.length > 0) {
      const sortedDays = days.sort((a, b) => logsByDay[b] - logsByDay[a]);
      bestDay = new Date(sortedDays[0]).toLocaleDateString('en-US', { weekday: 'long' });
      worstDay = new Date(sortedDays[sortedDays.length - 1]).toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // Top and struggling habits
    const topHabits = weeklyStats
      .slice(0, 3)
      .map(s => ({ title: s.habitTitle, completionRate: s.completionRate }));
    
    const strugglingHabits = weeklyStats
      .slice(-3)
      .reverse()
      .map(s => ({ title: s.habitTitle, completionRate: s.completionRate }));
    
    return {
      totalHabitsCompleted: totalCompleted,
      totalHabitsPossible: totalPossible,
      completionRate,
      xpGained,
      bestStreak,
      worstDay,
      bestDay,
      topHabits,
      strugglingHabits,
    };
  }, [weeklyLogs, weeklyStats]);
  
  // Calculate monthly stats
  const calculatedMonthlyStats: WeeklyStats = useMemo(() => {
    if (!monthlyLogs || !monthlyStatsData) {
      return {
        totalHabitsCompleted: 0,
        totalHabitsPossible: 0,
        completionRate: 0,
        xpGained: 0,
        bestStreak: 0,
        worstDay: 'Unknown',
        bestDay: 'Unknown',
        topHabits: [],
        strugglingHabits: [],
      };
    }
    
    const completedLogs = monthlyLogs.filter(log => log.status === 'completed');
    const totalCompleted = completedLogs.length;
    const totalPossible = monthlyLogs.length;
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
    
    const xpGained = totalCompleted * 10;
    const bestStreak = Math.max(...monthlyStatsData.map(s => s.streak.currentStreak), 0);
    
    const logsByDay: Record<string, number> = {};
    monthlyLogs.forEach(log => {
      if (log.status === 'completed') {
        logsByDay[log.date] = (logsByDay[log.date] || 0) + 1;
      }
    });
    
    const days = Object.keys(logsByDay);
    let bestDay = 'Unknown';
    let worstDay = 'Unknown';
    
    if (days.length > 0) {
      const sortedDays = days.sort((a, b) => logsByDay[b] - logsByDay[a]);
      bestDay = new Date(sortedDays[0]).toLocaleDateString('en-US', { weekday: 'long' });
      worstDay = new Date(sortedDays[sortedDays.length - 1]).toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    const topHabits = monthlyStatsData
      .slice(0, 3)
      .map(s => ({ title: s.habitTitle, completionRate: s.completionRate }));
    
    const strugglingHabits = monthlyStatsData
      .slice(-3)
      .reverse()
      .map(s => ({ title: s.habitTitle, completionRate: s.completionRate }));
    
    return {
      totalHabitsCompleted: totalCompleted,
      totalHabitsPossible: totalPossible,
      completionRate,
      xpGained,
      bestStreak,
      worstDay,
      bestDay,
      topHabits,
      strugglingHabits,
    };
  }, [monthlyLogs, monthlyStatsData]);
  
  // Track habit count for smart suggestions
  useEffect(() => {
    const lastCount = localStorage.getItem('life-os-last-habit-count');
    const currentCount = habits?.length || 0;
    
    if (lastCount && parseInt(lastCount) < currentCount) {
      // New habit added - show suggestion badge
      setShowNewBadge(true);
    }
    
    localStorage.setItem('life-os-last-habit-count', currentCount.toString());
  }, [habits?.length]);
  
  // Auto-expand on Sunday or 1st of month
  useEffect(() => {
    const date = new Date(logicalDate);
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    // Sunday = 0
    const isSunday = dayOfWeek === 0;
    const isFirstOfMonth = dayOfMonth === 1;
    
    // Auto-expand if Sunday or 1st
    if (isSunday || isFirstOfMonth) {
      const autoExpandKey = `life-os-ai-expand-${logicalDate}`;
      const hasAutoExpanded = localStorage.getItem(autoExpandKey);
      
      if (!hasAutoExpanded) {
        setIsExpanded(true);
        localStorage.setItem(autoExpandKey, 'true');
      }
    }
  }, [logicalDate]);
  
  const handleSuggestionsClick = () => {
    setShowNewBadge(false);
    setSuggestionsOpen(true);
  };
  
  const date = new Date(logicalDate);
  const isSunday = date.getDay() === 0;
  const isFirstOfMonth = date.getDate() === 1;
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold flex items-center gap-2">
                AI Coach
                {showNewBadge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 animate-pulse">
                    New
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isSunday ? 'Weekly insights ready' : 
                 isFirstOfMonth ? 'Monthly review available' : 
                 'Get personalized guidance'}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>
        
        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-primary/20 pt-3">
                {/* Sunday Quick Preview */}
                {isSunday && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Sunday Review</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Time to reflect on your week! Click below to get AI-powered insights on your performance.
                    </p>
                  </motion.div>
                )}
                
                {/* 1st of Month Quick Preview */}
                {isFirstOfMonth && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Monthly Review</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      New month, new opportunities! Review last month's progress and set fresh goals.
                    </p>
                  </motion.div>
                )}
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={handleSuggestionsClick}
                    variant="outline"
                    className="w-full justify-start bg-background/50 hover:bg-primary/10 border-primary/30"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    <span className="flex-1 text-left">Get Suggestions</span>
                    {showNewBadge && (
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setWeeklyInsightsOpen(true)}
                    variant="outline"
                    className={cn(
                      "w-full justify-start bg-background/50 border-primary/30",
                      isSunday ? "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/40" : "hover:bg-primary/10"
                    )}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Weekly Insights
                    {isSunday && (
                      <Sparkles className="w-3 h-3 ml-auto text-blue-500" />
                    )}
                  </Button>
                </div>
                
                {/* Monthly Insights Button (only on 1st) */}
                {isFirstOfMonth && (
                  <Button
                    onClick={() => setMonthlyInsightsOpen(true)}
                    variant="outline"
                    className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Monthly Review
                    <Sparkles className="w-3 h-3 ml-auto text-purple-500" />
                  </Button>
                )}
                
                {/* Info Text */}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  💡 AI analyzes your patterns to help you level up
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Dialogs */}
      <HabitSuggestionsDialog 
        open={suggestionsOpen} 
        onOpenChange={setSuggestionsOpen} 
      />
      
      <WeeklyInsightsDialog 
        open={weeklyInsightsOpen} 
        onOpenChange={setWeeklyInsightsOpen}
        weekStats={calculatedWeeklyStats}
      />
      
      {/* Monthly Insights (reuse Weekly with different title) */}
      <WeeklyInsightsDialog 
        open={monthlyInsightsOpen} 
        onOpenChange={setMonthlyInsightsOpen}
        weekStats={calculatedMonthlyStats}
      />
    </>
  );
}
