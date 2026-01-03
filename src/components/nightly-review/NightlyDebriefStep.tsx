/**
 * Nightly Review - Debrief Step
 * Show the drill sergeant roast and rate limit status
 */

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DebriefStepProps {
  roast: string;
  isRoasting: boolean;
  onGetNewRoast: () => void;
  canMakeAIRequest: boolean;
  requestsRemaining: number;
  monthlyUsage?: {
    requestsThisMonth: number;
    estimatedCost: number;
  };
}

export function NightlyDebriefStep({
  roast,
  isRoasting,
  onGetNewRoast,
  canMakeAIRequest,
  requestsRemaining,
  monthlyUsage = { requestsThisMonth: 0, estimatedCost: 0 },
}: DebriefStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">Final assessment</p>
      
      <div className="p-4 bg-muted rounded-lg border border-muted-foreground/20">
        <p className="text-sm leading-relaxed text-foreground">
          {roast || "Complete your review to unlock the drill sergeant's verdict..."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onGetNewRoast}
          disabled={isRoasting || !canMakeAIRequest}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isRoasting ? 'Roasting...' : 'New Roast'}
        </Button>
      </div>

      {!canMakeAIRequest && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700">
            <p className="font-semibold">Rate limit reached</p>
            <p className="mt-1">
              {requestsRemaining === 0
                ? 'You\'ve used your AI requests for today. Try again tomorrow.'
                : `${requestsRemaining} request${requestsRemaining === 1 ? '' : 's'} remaining today`}
            </p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
        <p className="font-semibold mb-1">AI Usage This Month</p>
        <p>• {monthlyUsage.requestsThisMonth} requests</p>
        <p>• ${monthlyUsage.estimatedCost.toFixed(2)} estimated cost</p>
      </div>
    </div>
  );
}
