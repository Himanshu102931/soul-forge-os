import { useState } from 'react';
import { useAllDailySummaries, useDayHabitLogs } from '@/hooks/useChronicles';
import { format, isFuture, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { DayDossier } from './DayDossier';
import { getLogicalDate } from '@/lib/time-utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Hook to get habit pause data for calendar
function useMonthHabitData(month: Date) {
  const { user } = useAuth();
  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['habit-logs-month', user?.id, monthStart, monthEnd],
    queryFn: async () => {
      if (!user?.id) return {};

      const { data: logs, error } = await supabase
        .from('habit_logs')
        .select('date, status, habit_id')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (error) throw error;

      // Group by date and calculate pause percentage
      const dateMap: Record<string, { total: number; skipped: number }> = {};
      
      logs?.forEach(log => {
        if (!dateMap[log.date]) {
          dateMap[log.date] = { total: 0, skipped: 0 };
        }
        dateMap[log.date].total++;
        if (log.status === 'skipped') {
          dateMap[log.date].skipped++;
        }
      });

      return dateMap;
    },
    enabled: !!user?.id,
  });
}

export function ChroniclesCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: summaries } = useAllDailySummaries();
  const { data: habitData } = useMonthHabitData(currentMonth);

  // Create a map of dates to mood scores
  const moodMap = new Map<string, number | null>();
  summaries?.forEach(s => {
    // Force cast to number to handle potential string issues
    const moodScore = s.mood_score !== null && s.mood_score !== undefined 
      ? Number(s.mood_score) 
      : null;
    moodMap.set(s.date, moodScore);
  });

  // Get days for the calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get padding days for the start of the month
  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (startPadding - i));
    return date;
  });

  // Get padding days for the end of the month (fill to 42 cells for 6 rows)
  const totalCells = 42;
  const endPadding = totalCells - (paddingDays.length + daysInMonth.length);
  const endPaddingDays = Array.from({ length: endPadding }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...paddingDays, ...daysInMonth, ...endPaddingDays];
  const today = getLogicalDate();

  const getMoodStyles = (date: Date): { 
    moodColor: string | null; 
    habitStatus: 'completed' | 'good' | 'partial' | 'paused' | 'missed' | null;
    text: string;
  } => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const mood = moodMap.get(dateStr);
    
    // Get mood border color
    let moodColor: string | null = null;
    if (mood !== null && mood !== undefined) {
      if (mood >= 4) moodColor = '#10b981'; // green
      else if (mood >= 3) moodColor = '#eab308'; // yellow
      else moodColor = '#ef4444'; // red
    }
    
    // Determine habit status for inside fill
    let habitStatus: 'completed' | 'good' | 'partial' | 'paused' | 'missed' | null = null;
    const dayHabitData = habitData?.[dateStr];
    
    if (dayHabitData && dayHabitData.total > 0) {
      const pausePercentage = dayHabitData.skipped / dayHabitData.total;
      
      // More than 50% paused = blue (rest day)
      if (pausePercentage > 0.5) {
        habitStatus = 'paused';
      } else {
        // Check completion percentage from actual habit completion
        const completed = dayHabitData.total - dayHabitData.skipped;
        const completionPercentage = completed / dayHabitData.total;
        
        // Option A: Green 70%+, Yellow 40-69%, Red <40%
        if (completionPercentage >= 0.7) habitStatus = 'completed'; // green - strong day
        else if (completionPercentage >= 0.4) habitStatus = 'good'; // yellow - decent day
        else habitStatus = 'missed'; // red - weak day
      }
    }
    
    return {
      moodColor,
      habitStatus,
      text: 'text-foreground'
    };
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Glass Container */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Calendar Grid */}
          <div className="flex-1 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevMonth}
                  className="h-9 w-9 bg-secondary/50 border-border/50 hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-9 w-9 bg-secondary/50 border-border/50 hover:bg-secondary"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {DAY_NAMES.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {allDays.map((date, index) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isDisabled = isFuture(startOfDay(date));
                const isToday = format(today, 'yyyy-MM-dd') === dateStr;
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
                const styles = getMoodStyles(date);
                
                // Determine background color based on habit status
                const getBgColor = () => {
                  if (!styles.habitStatus) return 'transparent';
                  switch (styles.habitStatus) {
                    case 'completed': return 'rgba(34, 197, 94, 0.4)'; // green - 70%+ strong
                    case 'good': return 'rgba(234, 179, 8, 0.4)'; // yellow - 40-69% decent
                    case 'paused': return 'rgba(59, 130, 246, 0.4)'; // blue - rest day
                    case 'missed': return 'rgba(239, 68, 68, 0.4)'; // red - <40% weak
                    default: return 'transparent';
                  }
                };
                
                return (
                  <button
                    key={index}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled && isCurrentMonth) setSelectedDate(date);
                    }}
                    style={{
                      borderWidth: '3px',
                      borderColor: isSelected ? 'hsl(var(--primary))' : (styles.moodColor || '#4b5563'),
                      backgroundColor: isSelected ? 'hsl(var(--primary))' : (getBgColor() !== 'transparent' ? getBgColor() : 'transparent'),
                    }}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-xl font-medium text-sm transition-all duration-200 relative overflow-hidden",
                      !isCurrentMonth && "opacity-30 pointer-events-none",
                      isDisabled && isCurrentMonth && "opacity-40 cursor-not-allowed",
                      !isDisabled && isCurrentMonth && "hover:scale-105 cursor-pointer",
                      isSelected && "ring-2 ring-primary/50 ring-offset-2 ring-offset-black/40 scale-105",
                      styles.text,
                      isToday && !isSelected && "ring-2 ring-primary/70 ring-offset-1 ring-offset-black/40"
                    )}
                  >
                    {/* Date number */}
                    <span className="relative z-10 font-semibold">{date.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-white/10">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Border = Mood</div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-emerald-500" />
                  <span className="text-xs text-muted-foreground">Great (4-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-yellow-500" />
                  <span className="text-xs text-muted-foreground">Okay (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-red-500" />
                  <span className="text-xs text-muted-foreground">Rough (1-2)</span>
                </div>
              </div>
              
              <div className="text-xs font-semibold text-muted-foreground uppercase mt-2">Inside = Habits</div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/40" />
                  <span className="text-xs text-muted-foreground">70%+ Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500/40" />
                  <span className="text-xs text-muted-foreground">40-69% Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/40" />
                  <span className="text-xs text-muted-foreground">&lt;40% Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500/40" />
                  <span className="text-xs text-muted-foreground">Rest Day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Day Dossier - Inline on larger screens */}
          {selectedDate && (
            <div className="lg:w-[400px] lg:border-l border-t lg:border-t-0 border-white/10 bg-black/20">
              <DayDossier 
                date={selectedDate} 
                onClose={() => setSelectedDate(undefined)}
                inline
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Day Dossier as Dialog */}
      <div className="lg:hidden">
        <DayDossier 
          date={selectedDate} 
          onClose={() => setSelectedDate(undefined)} 
        />
      </div>
    </div>
  );
}
