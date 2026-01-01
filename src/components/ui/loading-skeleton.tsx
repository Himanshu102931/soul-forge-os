/**
 * Enhanced Loading Skeleton Component
 * Phase 3E: UX Polish
 * 
 * Features:
 * - Smooth pulse animation with optimized timing
 * - Shimmer effect for premium feel
 * - Customizable size and shape variants
 * - ARIA accessibility for screen readers
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATION_TIMINGS } from '@/lib/animation-optimizer';

interface LoadingSkeletonProps {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  className?: string;
  shimmer?: boolean;
  count?: number;
  'aria-label'?: string;
}

const variantStyles = {
  default: 'h-4 w-full rounded',
  card: 'h-32 w-full rounded-xl',
  text: 'h-4 w-3/4 rounded',
  avatar: 'h-12 w-12 rounded-full',
  button: 'h-10 w-24 rounded-lg',
};

export function LoadingSkeleton({ 
  variant = 'default', 
  className,
  shimmer = true,
  count = 1,
  'aria-label': ariaLabel = 'Loading...',
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {skeletons.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: ANIMATION_TIMINGS.QUICK,
            delay: i * ANIMATION_TIMINGS.STAGGER_ITEM,
          }}
          className={cn(
            'relative overflow-hidden bg-muted',
            variantStyles[variant],
            className
          )}
          role="status"
          aria-label={ariaLabel}
          aria-live="polite"
        >
          {/* Base pulse animation */}
          <motion.div
            className="absolute inset-0 bg-muted"
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Shimmer effect */}
          {shimmer && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.1,
              }}
            />
          )}
          
          {/* Screen reader only text */}
          <span className="sr-only">{ariaLabel}</span>
        </motion.div>
      ))}
    </>
  );
}

/**
 * Card skeleton with multiple elements
 */
export function LoadingCard({ 
  className,
  showAvatar = false,
  rows = 3,
}: { 
  className?: string;
  showAvatar?: boolean;
  rows?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
      className={cn('bg-card border border-border rounded-xl p-4 space-y-3', className)}
      role="status"
      aria-label="Loading content..."
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {showAvatar && (
          <LoadingSkeleton variant="avatar" shimmer={false} />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-1/2" />
          <LoadingSkeleton variant="text" className="w-1/3 h-3" />
        </div>
      </div>
      
      {/* Content rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <LoadingSkeleton 
            key={i} 
            variant="text" 
            className={i === rows - 1 ? 'w-2/3' : 'w-full'} 
          />
        ))}
      </div>
      
      <span className="sr-only">Loading content...</span>
    </motion.div>
  );
}

/**
 * Grid skeleton for achievement grids
 */
export function LoadingGrid({ 
  columns = 4,
  rows = 3,
  className,
}: { 
  columns?: number;
  rows?: number;
  className?: string;
}) {
  const items = Array.from({ length: columns * rows });
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
      className={cn(
        'grid gap-4',
        `grid-cols-${Math.min(columns, 6)}`,
        className
      )}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="status"
      aria-label="Loading grid..."
    >
      {items.map((_, i) => (
        <LoadingSkeleton
          key={i}
          variant="card"
          className="aspect-square"
        />
      ))}
      <span className="sr-only">Loading grid...</span>
    </motion.div>
  );
}

/**
 * List skeleton for habit/task lists
 */
export function LoadingList({ 
  count = 4,
  showCheckbox = false,
  className,
}: { 
  count?: number;
  showCheckbox?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ANIMATION_TIMINGS.DEFAULT }}
      className={cn('space-y-3', className)}
      role="status"
      aria-label="Loading list..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: ANIMATION_TIMINGS.DEFAULT,
            delay: i * ANIMATION_TIMINGS.STAGGER_ITEM,
          }}
          className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
        >
          {showCheckbox && (
            <LoadingSkeleton variant="avatar" className="h-5 w-5 rounded" shimmer={false} />
          )}
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-3/4" />
            <LoadingSkeleton variant="text" className="w-1/2 h-3" />
          </div>
        </motion.div>
      ))}
      <span className="sr-only">Loading list...</span>
    </motion.div>
  );
}
