/**
 * PHASE 3B: Animation Optimization for 60fps Performance
 * 
 * This module provides optimized animation configurations and utilities
 * for ensuring smooth 60fps performance across all achievement animations.
 * 
 * Key Principles:
 * 1. Use GPU-accelerated properties (transform, opacity)
 * 2. Minimize repaints by using will-change
 * 3. Reduce animation delays for faster feedback
 * 4. Disable animations for users with reduced motion preference
 * 5. Monitor performance with PerformanceObserver
 */

import { MotionProps } from 'framer-motion';

/**
 * ============================================
 * ANIMATION TIMING CONSTANTS
 * ============================================
 */

export const ANIMATION_TIMINGS = {
  // Fast interactions (< 100ms)
  INSTANT: 0.05,
  QUICK: 0.1,
  
  // Standard interactions (100-300ms)
  STANDARD: 0.15,
  DEFAULT: 0.2,
  
  // Slow/Emphasis animations (> 300ms)
  SLOW: 0.3,
  ENTRANCE: 0.35,
  
  // Stagger delays
  STAGGER_ITEM: 0.02,      // 20ms per item (was 50ms)
  STAGGER_ROW: 0.05,       // 50ms per row
  CONFETTI_DURATION: 3,    // 3 seconds
};

/**
 * ============================================
 * SPRING ANIMATION CONFIGS
 * ============================================
 */

export const SPRING_CONFIGS = {
  // Stiff springs (fast, minimal overshoot)
  STIFF: {
    type: 'spring' as const,
    stiffness: 400,      // Was 300, increased for snappier feel
    damping: 30,         // Was 25, slightly increased for control
    mass: 1,
  },
  
  // Standard springs (balance of speed and smoothness)
  STANDARD: {
    type: 'spring' as const,
    stiffness: 300,      // Good balance
    damping: 25,         // Smooth with slight overshoot
    mass: 1,
  },
  
  // Soft springs (more bounce, slower)
  SOFT: {
    type: 'spring' as const,
    stiffness: 200,      // Bouncy
    damping: 15,         // More overshoot
    mass: 1,
  },
  
  // Reduced motion (instant)
  REDUCED: {
    type: 'tween' as const,
    duration: 0,         // Instant (accessible)
  },
};

/**
 * ============================================
 * ANIMATION PRESETS
 * ============================================
 */

export const ANIMATION_PRESETS = {
  /**
   * Achievement Grid Item - Staggered entrance
   * Uses opacity and y translation (GPU accelerated)
   */
  gridItemEnter: (index: number, prefersReduced: boolean): MotionProps => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: ANIMATION_TIMINGS.DEFAULT,
      delay: prefersReduced ? 0 : index * ANIMATION_TIMINGS.STAGGER_ITEM,
      ease: 'easeOut',
    },
  }),

  /**
   * Achievement Unlock Toast - Spring animation with celebration
   * Scales icon, fades in backdrop, slides in content
   */
  achievementUnlock: (prefersReduced: boolean): MotionProps => ({
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: prefersReduced 
      ? { ...SPRING_CONFIGS.REDUCED }
      : { ...SPRING_CONFIGS.STIFF },
  }),

  /**
   * Confetti particles - Physics-based animation
   * Individual particles with slight randomization
   */
  confettiParticle: (delay: number = 0): MotionProps => ({
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 0, y: 100 },
    transition: {
      duration: ANIMATION_TIMINGS.CONFETTI_DURATION,
      delay,
      ease: 'easeIn',
    },
  }),

  /**
   * Modal/Dialog entrance - Smooth fade and scale
   */
  modalEnter: (prefersReduced: boolean): MotionProps => ({
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      duration: prefersReduced ? 0 : ANIMATION_TIMINGS.STANDARD,
      ease: 'easeOut',
    },
  }),

  /**
   * Backdrop fade - Simple opacity transition
   */
  backdropFade: (prefersReduced: boolean): MotionProps => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: prefersReduced ? 0 : ANIMATION_TIMINGS.QUICK,
    },
  }),

  /**
   * Page transition - Fade in new content
   */
  pageEnter: (prefersReduced: boolean): MotionProps => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: prefersReduced ? 0 : ANIMATION_TIMINGS.QUICK,
    },
  }),

  /**
   * Pulse animation - For loading states
   */
  pulse: (prefersReduced: boolean): MotionProps => ({
    animate: { opacity: [1, 0.5, 1] },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
      ...(prefersReduced && { duration: 0 }), // Instant if reduced
    },
  }),

  /**
   * Scale up emphasis - For important events
   */
  scaleUp: (duration: number = ANIMATION_TIMINGS.ENTRANCE): MotionProps => ({
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: {
      duration,
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  }),
};

/**
 * ============================================
 * PERFORMANCE OPTIMIZATION UTILITIES
 * ============================================
 */

/**
 * Get user's motion preference
 * Returns true if user prefers reduced motion
 */
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Monitor animation performance
 * Detects long tasks (> 50ms) that could cause jank
 */
export const initPerformanceMonitoring = (): void => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Monitor long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(
            `[Performance] Long task: ${entry.name} (${entry.duration.toFixed(2)}ms)`,
          );
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    // Monitor layout shifts
    const LayoutObserver = new PerformanceObserver((list) => {
      let totalCLS = 0;
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          totalCLS += entry.value;
        }
      }
      if (totalCLS > 0.1) {
        console.warn(`[Performance] Cumulative Layout Shift: ${totalCLS.toFixed(3)}`);
      }
    });

    LayoutObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Performance Observer not supported
  }
};

/**
 * CSS optimizations for animations
 * These should be applied to animated elements
 */
export const GPU_ACCELERATED_STYLES = {
  // For elements with transform/opacity animations
  optimized: {
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
  },

  // Remove will-change after animation for memory efficiency
  normal: {
    willChange: 'auto',
  },
};

/**
 * ============================================
 * COMPONENT OPTIMIZATION HELPERS
 * ============================================
 */

/**
 * Calculate optimal stagger delay based on item count
 * Ensures animations complete in reasonable time
 */
export const calculateStaggerDelay = (
  itemCount: number,
  targetDuration: number = 0.3,
): number => {
  const baseDelay = ANIMATION_TIMINGS.STAGGER_ITEM;
  const calculatedDelay = Math.max(baseDelay, targetDuration / itemCount);
  return Math.min(calculatedDelay, 0.05); // Cap at 50ms
};

/**
 * Get optimized animation props with reduced motion support
 */
export const getOptimizedAnimationProps = (
  preset: keyof typeof ANIMATION_PRESETS,
  prefersReduced: boolean = getPrefersReducedMotion(),
): MotionProps => {
  const presets = ANIMATION_PRESETS as Record<string, any>;
  if (preset === 'gridItemEnter') {
    return presets[preset](0, prefersReduced);
  }
  return presets[preset](prefersReduced);
};

/**
 * ============================================
 * ANIMATION FRAME UTILITIES
 * ============================================
 */

/**
 * Request animation frame with automatic cleanup
 */
export const animationFrame = (callback: FrameRequestCallback): (() => void) => {
  let frameId: number;
  
  const animate = () => {
    frameId = requestAnimationFrame(callback);
  };
  
  animate();
  
  return () => {
    cancelAnimationFrame(frameId);
  };
};

/**
 * Throttle expensive operations in animation frames
 */
export const throttleAnimationFrame = (
  callback: FrameRequestCallback,
  interval: number = 16, // ~60fps
): FrameRequestCallback => {
  let lastTime = 0;
  
  return (time: DOMHighResTimeStamp) => {
    if (time - lastTime >= interval) {
      callback(time);
      lastTime = time;
    }
  };
};

/**
 * ============================================
 * ANIMATION STATE MANAGEMENT
 * ============================================
 */

interface AnimationState {
  isAnimating: boolean;
  frameCount: number;
  fps: number;
}

/**
 * Create animation frame rate monitor
 */
export const createFPSMonitor = (): {
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getMetrics: () => { fps: number; droppedFrames: number };
} => {
  let isMonitoring = false;
  let frameCount = 0;
  let lastTime = performance.now();
  let frameId: number;
  let fps = 60;
  let droppedFrames = 0;

  const measure = () => {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;

    if (elapsed >= 1000) {
      fps = (frameCount * 1000) / elapsed;
      droppedFrames = Math.max(0, 60 - fps);
      frameCount = 0;
      lastTime = now;

      if (droppedFrames > 0) {
        console.warn(`[Animation] FPS: ${fps.toFixed(1)}, Dropped frames: ${droppedFrames}`);
      }
    }

    if (isMonitoring) {
      frameId = requestAnimationFrame(measure);
    }
  };

  return {
    startMonitoring: () => {
      isMonitoring = true;
      frameId = requestAnimationFrame(measure);
    },
    stopMonitoring: () => {
      isMonitoring = false;
      cancelAnimationFrame(frameId);
    },
    getMetrics: () => ({ fps, droppedFrames }),
  };
};

/**
 * ============================================
 * MEMOIZATION FOR ANIMATION PROPS
 * ============================================
 */

import { useMemo } from 'react';

/**
 * Hook to get optimized animation props with memoization
 */
export const useOptimizedAnimationProps = (
  preset: keyof typeof ANIMATION_PRESETS,
): MotionProps => {
  const prefersReduced = getPrefersReducedMotion();

  return useMemo(() => {
    const presets = ANIMATION_PRESETS as Record<string, any>;
    if (preset === 'gridItemEnter') {
      return presets[preset](0, prefersReduced);
    }
    return presets[preset](prefersReduced);
  }, [preset, prefersReduced]);
};

/**
 * Hook for staggered animations with optimal timing
 */
export const useStaggeredAnimation = (itemCount: number) => {
  const prefersReduced = getPrefersReducedMotion();
  const staggerDelay = useMemo(
    () => calculateStaggerDelay(itemCount),
    [itemCount],
  );

  return useMemo(
    () => ({
      container: {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReduced ? 0 : staggerDelay,
          },
        },
      },
      item: {
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: ANIMATION_TIMINGS.DEFAULT,
            ease: 'easeOut',
          },
        },
      },
    }),
    [staggerDelay, prefersReduced],
  );
};

/**
 * ============================================
 * CSS-IN-JS ANIMATIONS
 * ============================================
 */

/**
 * Generate keyframe animations that use GPU-accelerated properties
 */
export const keyframes = {
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,

  slideIn: `
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
};

/**
 * ============================================
 * DEBUGGING & PROFILING
 * ============================================
 */

/**
 * Log animation performance metrics
 */
export const logAnimationMetrics = (): void => {
  const metrics = {
    navigation: performance.getEntriesByType('navigation')[0],
    resources: performance.getEntriesByType('resource'),
    longtasks: performance.getEntriesByType('longtask'),
  };

  console.group('[Animation Performance Metrics]');
  console.log('Navigation Timing:', metrics.navigation);
  console.log('Resource Count:', metrics.resources.length);
  console.log('Long Tasks:', metrics.longtasks.length);
  console.groupEnd();
};

export default {
  ANIMATION_TIMINGS,
  SPRING_CONFIGS,
  ANIMATION_PRESETS,
  getPrefersReducedMotion,
  initPerformanceMonitoring,
  GPU_ACCELERATED_STYLES,
  calculateStaggerDelay,
  getOptimizedAnimationProps,
  animationFrame,
  throttleAnimationFrame,
  createFPSMonitor,
  useOptimizedAnimationProps,
  useStaggeredAnimation,
  keyframes,
  logAnimationMetrics,
};
