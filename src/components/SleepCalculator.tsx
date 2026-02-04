import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Moon, Clock } from 'lucide-react';
import { useMetrics, useUpdateMetric } from '@/hooks/useMetrics';

export function SleepCalculator() {
  const { data: metrics, isLoading } = useMetrics();
  const updateMetric = useUpdateMetric();
  
  const [open, setOpen] = useState(false);
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  
  const sleepValue = metrics?.sleep;

  const calculateSleepDuration = (bed: string, wake: string): number => {
    const [bedHours, bedMinutes] = bed.split(':').map(Number);
    const [wakeHours, wakeMinutes] = wake.split(':').map(Number);
    
    let bedTotalMinutes = bedHours * 60 + bedMinutes;
    let wakeTotalMinutes = wakeHours * 60 + wakeMinutes;
    
    // If wake time is before bed time, assume next day
    if (wakeTotalMinutes < bedTotalMinutes) {
      wakeTotalMinutes += 24 * 60;
    }
    
    const durationMinutes = wakeTotalMinutes - bedTotalMinutes;
    const durationHours = durationMinutes / 60;
    
    return Math.round(durationHours * 100) / 100;
  };

  const previewDuration = calculateSleepDuration(bedTime, wakeTime);

  const handleSave = () => {
    updateMetric.mutate({ metricId: 'sleep', value: previewDuration });
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Sleep Duration</p>
            {sleepValue ? (
              <p className="text-xl font-bold">
                {Math.floor(sleepValue)}h {String(Math.round((sleepValue % 1) * 60)).padStart(2, '0')}m
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Tap to enter</p>
            )}
          </div>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
<<<<<<< HEAD
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto p-4 sm:p-6">
=======
        <DialogContent className="sm:max-w-sm">
>>>>>>> cf46c6e (Initial commit: project files)
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Sleep Calculator
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bedTime">Bed Time</Label>
              <Input
                id="bedTime"
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="text-center text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wakeTime">Wake Time</Label>
              <Input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="text-center text-lg"
              />
            </div>

            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Calculated Duration</p>
              <p className="text-3xl font-bold text-primary">{previewDuration.toFixed(2)} hrs</p>
              <p className="text-xs text-muted-foreground mt-1">
                ({Math.floor(previewDuration)}h {Math.round((previewDuration % 1) * 60)}m)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMetric.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
