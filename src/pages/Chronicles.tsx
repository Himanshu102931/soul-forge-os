import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChroniclesCalendar } from '@/components/chronicles/ChroniclesCalendar';
import { PlayerStats } from '@/components/chronicles/PlayerStats';
import { useRecalculateXP } from '@/hooks/useRecalculateXP';
import { useRebuildDailySummaries } from '@/hooks/useRebuildDailySummaries';
import { BarChart3, CalendarDays, RotateCcw, Loader2, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';
import { format, subDays } from 'date-fns';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecalcOption {
  label: string;
  days: number;
}

const RECALC_OPTIONS: RecalcOption[] = [
  { label: '7 Days (Default)', days: 7 },
  { label: '30 Days', days: 30 },
];

export default function Chronicles() {
  const [showRecalculateDialog, setShowRecalculateDialog] = useState(false);
  const [showRebuildDialog, setShowRebuildDialog] = useState(false);
  const [selectedRecalcDays, setSelectedRecalcDays] = useState(7);
  const [lastRecalcDays, setLastRecalcDays] = useState(7); // Track last recovery period
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const recalculateXP = useRecalculateXP();
  const rebuildSummaries = useRebuildDailySummaries();

  const handleRecalculate = () => {
    setLastRecalcDays(selectedRecalcDays); // Remember the period used
    recalculateXP.mutate({ 
      daysBack: selectedRecalcDays,
      endDate: useCustomDate ? customEndDate : undefined 
    });
    setShowRecalculateDialog(false);
  };

  const handleRebuild = () => {
    rebuildSummaries.mutate(lastRecalcDays); // Use same period as last Recover XP
    setShowRebuildDialog(false);
  };
  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">Chronicles</h1>
            <p className="text-sm text-muted-foreground">Your journey through time</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRebuildDialog(true)}
              disabled={rebuildSummaries.isPending}
              className="shrink-0"
              title="Rebuild daily summaries from habit logs"
            >
              {rebuildSummaries.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Rebuild Data
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={recalculateXP.isPending}
                  className="shrink-0"
                >
                  {recalculateXP.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-1" />
                  )}
                  Recover XP
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              {RECALC_OPTIONS.map(option => (
                <DropdownMenuItem
                  key={option.days}
                  onClick={() => {
                    setSelectedRecalcDays(option.days);
                    setUseCustomDate(false);
                    setShowRecalculateDialog(true);
                  }}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => {
                  setUseCustomDate(true);
                  setShowRecalculateDialog(true);
                }}
              >
                Custom Range...
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Player Stats
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Time Machine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlayerStats />
          </motion.div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ChroniclesCalendar />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Recalculate XP Confirmation Dialog */}
      <AlertDialog open={showRecalculateDialog} onOpenChange={setShowRecalculateDialog}>
        <AlertDialogContent className="max-w-sm max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <AlertDialogTitle>Recover Lost XP</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3">
              <div>
                <p className="font-medium text-foreground">Recalculation Period</p>
                <p className="text-sm">
                  {useCustomDate ? 'Custom Range' : `Past ${selectedRecalcDays} days`}
                </p>
              </div>
              {useCustomDate && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">End Date:</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm bg-background"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                This will recalculate XP from nightly reviews within the selected period. Your current XP and level will be updated.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRecalculate}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Recalculate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rebuild Daily Summaries Confirmation Dialog */}
      <AlertDialog open={showRebuildDialog} onOpenChange={setShowRebuildDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <AlertDialogTitle>Rebuild Daily Summaries?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2">
              <p>This will recalculate XP for each day based on your actual habit logs for the last {lastRecalcDays} days.</p>
              <p className="font-semibold text-foreground">⚠️ Do this FIRST, then click "Recover XP" to fix your profile.</p>
              <p className="text-xs text-muted-foreground">
                This process will scan your habits from the past {lastRecalcDays} days and update daily summaries with the correct XP earned.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRebuild}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Rebuild Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
