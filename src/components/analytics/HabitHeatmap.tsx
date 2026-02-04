import { useState } from 'react';
import { useHabitHeatmap } from '@/hooks/useAnalytics';
import { format, getDay, startOfYear, eachWeekOfInterval, endOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function HabitHeatmap() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data: heatmapData, isLoading } = useHabitHeatmap(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  // Group days by week
  const getWeeklyData = () => {
    if (!heatmapData) return [];

    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 0 });

    return weeks.map(weekStart => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = heatmapData.find(d => d.date === dateStr);
        return dayData || { date: dateStr, count: 0, level: 0 as const };
      });
      return days;
    });
  };

  const weeklyData = getWeeklyData();

  // Color scheme (GitHub-style)
  const getLevelColor = (level: 0 | 1 | 2 | 3 | 4) => {
    switch (level) {
      case 0:
        return 'bg-muted';
      case 1:
        return 'bg-green-200 dark:bg-green-900';
      case 2:
        return 'bg-green-400 dark:bg-green-700';
      case 3:
        return 'bg-green-600 dark:bg-green-500';
      case 4:
        return 'bg-green-800 dark:bg-green-300';
    }
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-semibold text-base md:text-lg">Activity Heatmap</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousYear}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-24 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextYear}
            disabled={selectedYear >= currentYear}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month labels */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[800px]">
          <div className="flex gap-1 mb-2 pl-8">
            {monthLabels.map((month, idx) => (
              <div
                key={month}
                className="text-xs text-muted-foreground flex-1 text-left"
                style={{ marginLeft: idx === 0 ? '0' : '' }}
              >
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 pr-2">
                <div className="h-3 text-xs text-muted-foreground">S</div>
                <div className="h-3 text-xs text-muted-foreground">M</div>
                <div className="h-3 text-xs text-muted-foreground">T</div>
                <div className="h-3 text-xs text-muted-foreground">W</div>
                <div className="h-3 text-xs text-muted-foreground">T</div>
                <div className="h-3 text-xs text-muted-foreground">F</div>
                <div className="h-3 text-xs text-muted-foreground">S</div>
              </div>

              {/* Weeks */}
              <div className="flex gap-1 flex-1">
                {weeklyData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)} transition-colors cursor-pointer hover:ring-2 hover:ring-primary`}
                        title={`${format(new Date(day.date), 'MMM dd, yyyy')}: ${day.count} habits completed`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`h-3 w-3 rounded-sm ${getLevelColor(level as 0 | 1 | 2 | 3 | 4)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
