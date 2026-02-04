import { useState } from 'react';
import { useHabitStreaks } from '@/hooks/useAnalytics';
import { Flame, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function StreakCard() {
  const { data: streaks, isLoading } = useHabitStreaks();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="h-48 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading streaks...</div>
        </div>
      </div>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-base md:text-lg">Habit Streaks</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No habits tracked yet</div>
        </div>
      </div>
    );
  }

  // Show top 3 by current streak (or all if expanded)
  const displayStreaks = streaks.slice(0, showAll ? streaks.length : 3);

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold text-base md:text-lg">Habit Streaks</h3>
      </div>

      <div className="space-y-4">
        {displayStreaks.map((streak, index) => (
          <motion.div
            key={streak.habitId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-l-4 border-orange-500 pl-4 py-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1 truncate">{streak.habitTitle}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>Current: {streak.currentStreak} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-yellow-500" />
                    <span>Best: {streak.longestStreak} days</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-orange-500">
                  {streak.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">days</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expand/Collapse button */}
      {streaks.length > 3 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show All ({streaks.length} habits)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Summary stats */}
      {streaks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Active Streaks</div>
            <div className="text-xl font-bold text-primary">
              {streaks.filter(s => s.currentStreak > 0).length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Longest Ever</div>
            <div className="text-xl font-bold text-orange-500">
              {Math.max(...streaks.map(s => s.longestStreak))}
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        💡 Partial completions count towards your streak!
      </div>
    </div>
  );
}
