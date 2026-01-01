import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  dateRange: number;
  onDateRangeChange: (days: number) => void;
}

export function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps): JSX.Element {
  return (
    <div className="flex gap-2">
      {[7, 30, 90].map((days) => (
        <button
          key={days}
          onClick={() => onDateRangeChange(days)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg border transition-all',
            dateRange === days
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background border-border hover:border-primary'
          )}
        >
          {days} days
        </button>
      ))}
    </div>
  );
}
