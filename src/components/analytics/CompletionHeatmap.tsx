import { motion } from 'framer-motion';
import { HeatmapDay } from '@/lib/analytics-utils';
import { cn } from '@/lib/utils';
import { isFuture } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompletionHeatmapProps {
  data: HeatmapDay[];
  weeks?: number; // Number of weeks to show (default: 12)
  showLegend?: boolean; // Show legend (default: false for compact view)
  compact?: boolean; // Compact sizing (default: true for month view)
  onDayClick?: (date: string) => void; // Callback when day is clicked
  showDayLabels?: boolean; // Show S, M, T, W, T, F, S labels (default: true)
}

export function CompletionHeatmap({ 
  data, 
  weeks = 12, 
  showLegend = false, 
  compact = true,
  onDayClick,
  showDayLabels = true 
}: CompletionHeatmapProps) {
  // Generate all dates for the month including empty ones
  const allDates: HeatmapDay[] = [];
  const dataMap = new Map(data.map(d => [d.date, d]));
  
  if (data.length > 0) {
    const dates = data.map(d => new Date(d.date)).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    const current = new Date(firstDate);
    while (current <= lastDate) {
      const dateStr = current.toISOString().split('T')[0];
      const existingData = dataMap.get(dateStr);
      allDates.push(existingData || { date: dateStr, count: 0, percentage: 0 });
      current.setDate(current.getDate() + 1);
    }
  }

  // Group data by weeks - start from the first day, no padding
  const weeksData: (HeatmapDay | null)[][] = [];
  
  if (allDates.length > 0) {
    const firstDate = new Date(allDates[0].date);
    const firstDayOfWeek = firstDate.getDay(); // 0-6 (Sun-Sat)
    
    // Create first week with nulls before the first date
    const firstWeek: (HeatmapDay | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      firstWeek.push(null);
    }
    
    // Add actual dates
    let weekIndex = 0;
    allDates.forEach((day, index) => {
      if (firstWeek.length < 7) {
        firstWeek.push(day);
      } else {
        if (weeksData[weekIndex] && weeksData[weekIndex].length === 7) {
          weekIndex++;
        }
        if (!weeksData[weekIndex]) {
          weeksData[weekIndex] = [];
        }
        weeksData[weekIndex].push(day);
      }
    });
    
    // Add the first week
    if (firstWeek.length > 0) {
      weeksData.unshift(firstWeek);
    }
    
    // Pad the last week with nulls if needed
    const lastWeek = weeksData[weeksData.length - 1];
    if (lastWeek && lastWeek.length < 7) {
      while (lastWeek.length < 7) {
        lastWeek.push(null);
      }
    }
  }

  const getIntensityColor = (percentage: number) => {
    if (percentage === 0) return 'bg-muted'; // Grey for empty (like GitHub)
    if (percentage < 25) return 'bg-green-500/30';
    if (percentage < 50) return 'bg-green-500/50';
    if (percentage < 75) return 'bg-green-500/70';
    if (percentage < 100) return 'bg-green-500/85';
    return 'bg-green-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTooltipContent = (day: HeatmapDay) => {
    const dateObj = new Date(day.date);
    const isFutureDate = isFuture(dateObj);
    
    if (isFutureDate) {
      return (
        <div className="text-xs space-y-1">
          <div className="font-medium">{formatDate(day.date)}</div>
          <div className="text-muted-foreground">Future date</div>
        </div>
      );
    }
    
    if (day.percentage === 0) {
      return (
        <div className="text-xs space-y-1">
          <div className="font-medium">{formatDate(day.date)}</div>
          <div className="text-muted-foreground">No habits completed</div>
        </div>
      );
    }
    
    return (
      <div className="text-xs space-y-1">
        <div className="font-medium">{formatDate(day.date)}</div>
        <div className="text-muted-foreground">
          {day.count} {day.count === 1 ? 'habit' : 'habits'} completed ({Math.round(day.percentage)}%)
        </div>
        <div className="text-xs text-primary mt-1">Click to view details</div>
      </div>
    );
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const cellSize = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
      {showLegend && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Completion Heatmap</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 25, 50, 75, 100].map((val) => (
                <div
                  key={val}
                  className={cn(cellSize + ' rounded-sm', getIntensityColor(val))}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      <TooltipProvider>
        <div className="flex gap-0.5 overflow-x-auto pb-1">
          {/* Day labels - conditionally render */}
          {showDayLabels && (
            <div className="flex flex-col gap-0.5 mr-1">
              <div className={cellSize} /> {/* Spacer for alignment */}
              {dayLabels.map((label, i) => (
                <div key={i} className={`${cellSize} flex items-center justify-center text-[8px] text-muted-foreground`}>
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Heatmap grid */}
          {weeksData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {/* Month label for first week of month */}
              <div className={cellSize} />
              
              {/* Week days */}
              {week.map((day, dayIndex) => {
                if (!day) {
                  // Empty space for days before month starts or after month ends
                  return <div key={dayIndex} className={cellSize} />;
                }
                
                return (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                        onClick={() => onDayClick?.(day.date)}
                        className={cn(
                          cellSize + ' rounded cursor-pointer transition-all hover:ring-2 hover:ring-primary hover:scale-110',
                          getIntensityColor(day?.percentage || 0)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {getTooltipContent(day)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
