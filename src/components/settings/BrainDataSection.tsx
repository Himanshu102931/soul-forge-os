/**
 * Settings - Brain & Data Section
 * Export data and view local neural core status
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Download, Loader2, FileJson, FileSpreadsheet } from 'lucide-react';
import { DateRangeOption } from '@/hooks/useDataExport';

interface BrainDataSectionProps {
  exportDateRange: DateRangeOption;
  customStartDate: string;
  customEndDate: string;
  exportFormat: 'json' | 'csv';
  isExporting: boolean;
  onDateRangeChange: (range: DateRangeOption) => void;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
  onFormatChange: (format: 'json' | 'csv') => void;
  onExport: () => void;
}

export function BrainDataSection({
  exportDateRange,
  customStartDate,
  customEndDate,
  exportFormat,
  isExporting,
  onDateRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onFormatChange,
  onExport,
}: BrainDataSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* Local Neural Core Status */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Local Neural Core: Active</span>
          </div>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The Drill Sergeant uses a local algorithm for instant feedback (0ms latency, 100% uptime).
        </p>
      </div>

      {/* Export Options */}
      <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Export All Data</h4>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDateRangeChange('7days')}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                exportDateRange === '7days'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => onDateRangeChange('30days')}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                exportDateRange === '30days'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => onDateRangeChange('3months')}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                exportDateRange === '3months'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              Last 3 Months
            </button>
            <button
              onClick={() => onDateRangeChange('all')}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                exportDateRange === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              All Time
            </button>
          </div>
          <button
            onClick={() => onDateRangeChange('custom')}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition ${
              exportDateRange === 'custom'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:border-primary'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Range */}
        {exportDateRange === 'custom' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <div className="flex gap-2">
            <button
              onClick={() => onFormatChange('json')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition flex items-center justify-center gap-2 ${
                exportFormat === 'json'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => onFormatChange('csv')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition flex items-center justify-center gap-2 ${
                exportFormat === 'csv'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Download className="w-4 h-4 mr-2" />
          Download {exportFormat.toUpperCase()}
        </Button>

        {/* Info text */}
        <p className="text-xs text-muted-foreground">
          Exports all your data: habits, tasks, daily summaries, metrics, and profile information.
        </p>
      </div>
    </div>
  );
}
