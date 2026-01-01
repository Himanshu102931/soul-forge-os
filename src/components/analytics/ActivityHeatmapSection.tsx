import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { CompletionHeatmap } from '@/components/analytics/CompletionHeatmap';
import { DayDetailsModal } from '@/components/analytics/DayDetailsModal';
import type { HeatmapDay } from '@/lib/analytics-utils';

interface ActivityHeatmapSectionProps {
  data: HeatmapDay[];
}

interface MonthData {
  month: string;
  year: number;
  data: HeatmapDay[];
}

export function ActivityHeatmapSection({ data }: ActivityHeatmapSectionProps): JSX.Element {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get available years from data
  const availableYears = useMemo(() => {
    if (data.length === 0) return [new Date().getFullYear()];
    
    const years = new Set<number>();
    data.forEach((day) => {
      const year = new Date(day.date).getFullYear();
      years.add(year);
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  // Calculate all 12 months with data for selected year
  const allMonthsData = useMemo(() => {
    if (data.length === 0) return [];

    // Filter data for selected year
    const filteredData = data.filter(day => {
      return new Date(day.date).getFullYear() === selectedYear;
    });

    if (filteredData.length === 0) {
      // Return empty months for the year
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames.map((monthName) => ({
        month: monthName,
        year: selectedYear,
        data: [],
      }));
    }

    // Group data by month
    const monthMap: Map<string, HeatmapDay[]> = new Map();
    filteredData.forEach((day) => {
      const date = new Date(day.date);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthMap.has(key)) {
        monthMap.set(key, []);
      }
      monthMap.get(key)!.push(day);
    });

    // Create all 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const displayMonths: MonthData[] = [];

    monthNames.forEach((monthName) => {
      const monthKey = `${monthName} ${selectedYear}`;
      const monthData = monthMap.get(monthKey) || [];

      displayMonths.push({
        month: monthName,
        year: selectedYear,
        data: monthData,
      });
    });

    return displayMonths;
  }, [data, selectedYear]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-semibold">Activity Heatmap</h3>
        </div>
        
        {/* Year Selector - Inline */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const idx = availableYears.indexOf(selectedYear);
              if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
            }}
            disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
            className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-2 py-1 rounded-md border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const idx = availableYears.indexOf(selectedYear);
              if (idx > 0) setSelectedYear(availableYears[idx - 1]);
            }}
            disabled={availableYears.indexOf(selectedYear) === 0}
            className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 12-Month Horizontal Layout (GitHub Style) */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Day labels - Show once on the left */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
          <div className="h-5 mb-[6px]" /> {/* Spacer for month header (h-5 + mb-2) */}
          <div className="w-2.5 h-2.5" /> {/* Spacer matching heatmap top spacer */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
            <div key={i} className="w-2.5 h-2.5 flex items-center justify-center text-[8px] text-muted-foreground font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* All 12 months - expanded to fill space */}
        <div className="flex gap-6 flex-1 min-w-0">
          {allMonthsData.map((month, idx) => {
            // Generate all dates for this month
            // Month rendering
            const daysInMonth = new Date(month.year, idx + 1, 0).getDate();
            const monthDates: HeatmapDay[] = [];

            // Create a map of existing data
            const dataMap = new Map(month.data.map(d => [d.date, d]));

            // Generate all dates in the month
            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = new Date(month.year, idx, day).toISOString().split('T')[0];
              const existingData = dataMap.get(dateStr);
              monthDates.push(
                existingData || {
                  date: dateStr,
                  count: 0,
                  percentage: 0,
                }
              );
            }

            return (
              <motion.div
                key={`${month.month}-${month.year}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex-1 min-w-[60px]"
              >
                {/* Month Header */}
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground h-5">
                  {month.month}
                </h4>

                {/* Heatmap for this month - compact mode with no day labels */}
                <CompletionHeatmap
                  data={monthDates}
                  weeks={Math.ceil(daysInMonth / 7)}
                  compact={true}
                  showLegend={false}
                  showDayLabels={false}
                  onDayClick={(date) => setSelectedDate(date)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Single Legend at Bottom - GitHub Style */}
      <div className="mt-8 pt-4 border-t border-border/30 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {['bg-muted', 'bg-green-500/30', 'bg-green-500/50', 'bg-green-500/70', 'bg-green-500'].map((bg, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded ${bg}`} />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Day Details Modal */}
      <DayDetailsModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </motion.div>
  );
}
