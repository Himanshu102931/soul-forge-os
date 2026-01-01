/**
 * Nightly Review - Metrics Entry Step
 * Allows user to input steps and sleep data
 */

import { Input } from '@/components/ui/input';
import { Footprints, Moon } from 'lucide-react';

interface MetricsStepProps {
  steps: string;
  sleep: string;
  onStepsChange: (value: string) => void;
  onSleepChange: (value: string) => void;
  currentSteps?: number;
  currentSleep?: number;
}

export function NightlyMetricsStep({
  steps,
  sleep,
  onStepsChange,
  onSleepChange,
  currentSteps,
  currentSleep,
}: MetricsStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">Log your daily metrics</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Footprints className="w-4 h-4" />
            Steps
          </label>
          <Input
            type="tel"
            placeholder={currentSteps?.toString() || '0'}
            value={steps}
            onChange={(e) => onStepsChange(e.target.value)}
            className="bg-secondary"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <Moon className="w-4 h-4" />
            Sleep (hrs)
          </label>
          <Input
            type="tel"
            placeholder={currentSleep?.toString() || '0'}
            value={sleep}
            onChange={(e) => onSleepChange(e.target.value)}
            className="bg-secondary"
          />
        </div>
      </div>
    </div>
  );
}
