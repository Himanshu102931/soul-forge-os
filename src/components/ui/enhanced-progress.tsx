/**
 * Enhanced Progress Indicator
 * Phase 3E: UX Polish
 * 
 * Animated progress bar with smooth transitions
 * Shows near-unlock states with special effects
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATION_TIMINGS, SPRING_CONFIGS } from '@/lib/animation-optimizer';
import { Sparkles } from 'lucide-react';

interface EnhancedProgressProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
  isNearComplete?: boolean; // Special animation when >80%
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function EnhancedProgress({
  value,
  max = 100,
  showLabel = false,
  label,
  showPercentage = false,
  className,
  barClassName,
  isNearComplete = false,
  animated = true,
  size = 'md',
}: EnhancedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isAlmostComplete = percentage >= 80;
  const shouldShowSparkles = isNearComplete && isAlmostComplete;

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {/* Label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {showLabel && label && (
            <span className="font-medium">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              key={percentage}
              initial={animated ? { opacity: 0, y: -5 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: ANIMATION_TIMINGS.QUICK }}
              className={cn(
                'text-xs font-medium',
                isAlmostComplete ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div 
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        {/* Background shimmer effect for near-complete */}
        {shouldShowSparkles && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Progress bar fill */}
        <motion.div
          className={cn(
            'h-full rounded-full',
            isAlmostComplete
              ? 'bg-gradient-to-r from-primary to-primary/80'
              : 'bg-primary',
            barClassName
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? { ...SPRING_CONFIGS.STANDARD }
              : { duration: 0 }
          }
        >
          {/* Inner glow for near-complete */}
          {shouldShowSparkles && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-foreground/20 via-transparent to-primary-foreground/20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Sparkle indicator */}
        {shouldShowSparkles && (
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_CONFIGS.STIFF }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Near-complete message */}
      {shouldShowSparkles && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
          className="text-xs text-primary font-medium flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          Almost there!
        </motion.p>
      )}
    </div>
  );
}

/**
 * Circular progress indicator
 */
export function CircularProgress({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  showPercentage = true,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ ...SPRING_CONFIGS.STANDARD }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showPercentage && (
        <motion.div
          key={percentage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: ANIMATION_TIMINGS.QUICK }}
          className="absolute inset-0 flex items-center justify-center text-sm font-bold"
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  );
}
