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
  );
}
