import { useState } from 'react';
import { useDataImport } from '@/hooks/useDataImport';
import { useDataExport } from '@/hooks/useDataExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileJson, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ExportEntity = 'profiles' | 'habits' | 'habit_logs' | 'tasks' | 'daily_summaries' | 'metric_logs';
type ExportFormat = 'json' | 'csv-combined' | 'csv-individual';
type TimeFilter = 'all' | '1month' | '3months' | '6months' | '1year' | 'custom';

export function ImportDataSection() {
  // Import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const importData = useDataImport();

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [entitiesOpen, setEntitiesOpen] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<Set<ExportEntity>>(
    new Set(['profiles', 'habits', 'habit_logs', 'tasks', 'daily_summaries', 'metric_logs'])
  );
  const exportData = useDataExport();

  const ENTITY_OPTIONS: { id: ExportEntity; label: string }[] = [
    { id: 'profiles', label: 'Profile' },
    { id: 'habits', label: 'Habits' },
    { id: 'habit_logs', label: 'Habit Logs' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'daily_summaries', label: 'Daily Summaries' },
    { id: 'metric_logs', label: 'Metrics' },
  ];

  // Calculate date range based on filter
  const getDateRange = (): { start?: string; end?: string } => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start: string | undefined;

    switch (timeFilter) {
      case '1month':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        start = oneMonthAgo.toISOString().split('T')[0];
        break;
      case '3months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        start = threeMonthsAgo.toISOString().split('T')[0];
        break;
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        start = sixMonthsAgo.toISOString().split('T')[0];
        break;
      case '1year':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        start = oneYearAgo.toISOString().split('T')[0];
        break;
      case 'custom':
        return { start: customStartDate || undefined, end: customEndDate || undefined };
      case 'all':
      default:
        return { start: undefined, end: undefined };
    }

    return { start, end };
  };

  // Import handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');

      if (isJSON || isCSV) {
        setSelectedFile(file);
      } else {
        alert('Please select a JSON or CSV file');
      }
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    await importData.mutateAsync(selectedFile);
    setSelectedFile(null);
    setConfirmOpen(false);
  };

  // Export handlers
  const toggleEntity = (entity: ExportEntity) => {
    const newSet = new Set(selectedEntities);
    if (newSet.has(entity)) {
      newSet.delete(entity);
    } else {
      newSet.add(entity);
    }
    setSelectedEntities(newSet);
  };

  const handleExport = async () => {
    if (selectedEntities.size === 0) {
      alert('Please select at least one entity to export');
      return;
    }

    const dateRange = getDateRange();

    await exportData.mutateAsync({
      entities: Array.from(selectedEntities),
      format: exportFormat,
      startDate: dateRange.start,
      endDate: dateRange.end,
    });
  };

  const selectedCount = selectedEntities.size;

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Export Data</h4>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Single File)</SelectItem>
                <SelectItem value="csv-combined">CSV Combined (Single File with all entities)</SelectItem>
                <SelectItem value="csv-individual">CSV Individual (Separate file per entity)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={timeFilter} onValueChange={(value) => {
              setTimeFilter(value as TimeFilter);
              setShowCustomDates(value === 'custom');
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everything</SelectItem>
                <SelectItem value="1month">Last 1 Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last 1 Year</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>

            {/* Custom Date Range */}
            {showCustomDates && (
              <div className="mt-3 space-y-2 p-3 bg-secondary/50 rounded-lg">
                <div>
                  <label className="text-xs font-medium mb-1 block">Start Date</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">End Date</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Entity Selection - Dropdown */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Entities ({selectedCount}/{ENTITY_OPTIONS.length})</label>
            <div className="border rounded-lg bg-background overflow-hidden">
              <button
                onClick={() => setEntitiesOpen(!entitiesOpen)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <span className="text-sm">
                  {selectedCount === 0
                    ? 'No entities selected'
                    : selectedCount === ENTITY_OPTIONS.length
                      ? 'All entities selected'
                      : `${selectedCount} entit${selectedCount === 1 ? 'y' : 'ies'} selected`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${entitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {entitiesOpen && (
                <div className="border-t p-3 space-y-2 bg-secondary/30">
                  {ENTITY_OPTIONS.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedEntities.has(option.id)}
                        onChange={() => toggleEntity(option.id)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm flex-1">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={selectedEntities.size === 0 || exportData.isPending}
            className="w-full"
          >
            {exportData.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-secondary/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-medium">Import Data</h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Supports JSON backups, single-entity CSVs, or combined multi-entity CSVs. All existing data will be replaced.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".json,.csv,application/json,text/csv"
              onChange={handleFileSelect}
              className="flex-1"
              disabled={importData.isPending}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              disabled={!selectedFile || importData.isPending}
            >
              {importData.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <FileJson className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>

          {selectedFile && (
            <div className="text-xs text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import Data?</AlertDialogTitle>
              <AlertDialogDescription>
                <p>This will replace all existing data with the data from your file.</p>
                <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                  <li><strong>JSON Backup</strong>: Imports all data (habits, tasks, logs, summaries, metrics, profile)</li>
                  <li><strong>Single-Entity CSV</strong>: Imports based on filename detection</li>
                  <li><strong>Multi-Entity CSV</strong>: Imports all entities with table_type column</li>
                </ul>
                <p className="mt-2">Profile data will be merged by keeping higher values. Duplicates by date are skipped.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmImport}>
                Import Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
