<<<<<<< HEAD
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trophy, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StreakDisplay } from '@/components/analytics/StreakDisplay';
import { cn } from '@/lib/utils';
import type { HabitStats } from '@/lib/analytics-utils';

interface TopPerformersProps {
  habitStats: HabitStats[];
  statsLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopPerformers({ habitStats, statsLoading, isOpen, onOpenChange }: TopPerformersProps): JSX.Element | null {
  if (!habitStats || habitStats.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="bg-card border border-border rounded-xl p-4">
      <div className="space-y-4">
        <CollapsibleTrigger className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold flex-1 text-left">Top Performers</h3>
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen ? 'rotate-180' : '')} />
        </CollapsibleTrigger>
        
        {/* Always show top 3 */}
        {!isOpen && (
          <div className="space-y-2 mt-4">
            {habitStats.slice(0, 3).map((stat, idx) => (
              <div key={stat.habitId} className="flex items-center gap-3 p-2">
                <div className="text-sm font-bold text-muted-foreground w-6">#{idx + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{stat.habitTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(stat.completionRate)}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CollapsibleContent className="mt-4">
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {habitStats.slice(0, 5).map((stat, idx) => (
                <div key={stat.habitId} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="text-lg font-bold text-muted-foreground w-6">#{idx + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{stat.habitTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(stat.completionRate)}% completion • {stat.totalCompletions} done
                    </div>
                  </div>
                  <StreakDisplay 
                    currentStreak={stat.streak.currentStreak}
                    longestStreak={stat.streak.longestStreak}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
=======
import { useState } from 'react';
import { useTopPerformers } from '@/hooks/useAnalytics';
import { Trophy, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function TopPerformers() {
  const { data: performers, isLoading } = useTopPerformers(30);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="h-48 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!performers || performers.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-base md:text-lg">Top Performers</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">No habits tracked yet</div>
        </div>
      </div>
    );
  }

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-500'; // Gold
      case 1:
        return 'text-gray-400'; // Silver
      case 2:
        return 'text-amber-600'; // Bronze
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-semibold text-base md:text-lg">Top Performers</h3>
        <span className="text-xs text-muted-foreground ml-auto">Last 30 days</span>
      </div>

      <div className="space-y-3">
        {performers.slice(0, showAll ? performers.length : 3).map((performer, index) => (
          <motion.div
            key={performer.habitId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            {/* Rank */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center font-bold ${getMedalColor(index)}`}>
              {index < 3 ? <Trophy className="w-4 h-4" /> : `#${index + 1}`}
            </div>

            {/* Habit title */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{performer.habitTitle}</div>
              <div className="text-xs text-muted-foreground">
                {performer.completedDays}/{performer.totalDays} days
              </div>
            </div>

            {/* Completion rate */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="text-lg font-bold text-primary">
                  {Math.round(performer.completionRate)}%
                </div>
              </div>
              {performer.completionRate === 100 && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expand/Collapse button */}
      {performers.length > 3 && (
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
                Show All ({performers.length} habits)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Footer note */}
      {performers.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Ranked by completion rate over scheduled days
        </div>
      )}
    </div>
>>>>>>> cf46c6e (Initial commit: project files)
  );
}
