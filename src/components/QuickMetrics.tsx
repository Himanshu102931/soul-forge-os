import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMetrics, useUpdateMetric } from '@/hooks/useMetrics';
import { Input } from '@/components/ui/input';
import { Footprints } from 'lucide-react';
import { SleepCalculator } from './SleepCalculator';
import { MetricInputSchema } from '@/lib/validation';

export function QuickMetrics() {
  const { data: metrics, isLoading } = useMetrics();
  const updateMetric = useUpdateMetric();

  const [steps, setSteps] = useState<string>('');
  const [stepsError, setStepsError] = useState<string>('');

  useEffect(() => {
    if (metrics) {
      setSteps(metrics.steps?.toString() || '');
    }
  }, [metrics]);

  // Save only on blur (focus lost) to prevent lag during typing
  const handleStepsBlur = () => {
    const num = parseInt(steps);
    
    // Validate using Zod schema
    const validation = MetricInputSchema.safeParse({ steps: num });
    
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setStepsError(String(errors.steps?.[0] || 'Invalid input'));
      return;
    }
    
    if (!isNaN(num) && num >= 0) {
      setStepsError('');
      updateMetric.mutate({ metricId: 'steps', value: num });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-semibold text-xs sm:text-sm">Quick Metrics</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Steps</p>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="0"
                value={steps}
                onChange={(e) => {
                  setSteps(e.target.value);
                  setStepsError('');
                }}
                onBlur={handleStepsBlur}
                className="bg-transparent border-none p-0 h-auto text-lg sm:text-xl font-bold focus-visible:ring-0"
                aria-invalid={!!stepsError}
              />
              {stepsError && (
                <p className="text-xs text-red-500 mt-1">{stepsError}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sleep Calculator */}
        <SleepCalculator />
      </div>
    </div>
  );
}
