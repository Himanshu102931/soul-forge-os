/**
 * Nightly Review - Summary Step
 * Display XP earned and HP lost summary
 */

import { Zap, Shield } from 'lucide-react';

interface SummaryStepProps {
  xpEarned: number;
  hpLost: number;
  missedCount: number;
  incompleteCount: number;
}

export function NightlySummaryStep({
  xpEarned,
  hpLost,
  missedCount,
  incompleteCount,
}: SummaryStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">Today's results</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 text-center">
          <Zap className="w-8 h-8 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-primary">+{xpEarned}</div>
          <div className="text-xs text-muted-foreground">XP Earned</div>
        </div>
        
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30 text-center">
          <Shield className="w-8 h-8 mx-auto text-destructive mb-2" />
          <div className="text-2xl font-bold text-destructive">-{hpLost}</div>
          <div className="text-xs text-muted-foreground">HP Lost</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• {missedCount} missed habits (-{missedCount * 10} HP)</p>
        <p>• {incompleteCount} incomplete tasks (-{incompleteCount * 5} HP)</p>
      </div>
    </div>
  );
}
