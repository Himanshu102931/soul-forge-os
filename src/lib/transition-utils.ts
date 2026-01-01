/**
 * Smooth Transitions Utility
 * Phase 3E: UX Polish
 * 
 * Provides smooth, optimized transitions for state changes
 * Reduces layout shifts and improves perceived performance
 */

import { Variants } from 'framer-motion';
import { ANIMATION_TIMINGS } from './animation-optimizer';

/**
 * Fade in/out transition
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  },
  exit: { 
    opacity: 0,
    transition: { duration: ANIMATION_TIMINGS.QUICK }
  }
};

/**
 * Slide up transition (for modals, toasts)
 */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: ANIMATION_TIMINGS.DEFAULT,
      ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: ANIMATION_TIMINGS.QUICK }
  }
};

/**
 * Scale transition (for buttons, cards)
 */
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: ANIMATION_TIMINGS.QUICK }
  }
};

/**
 * Slide from left transition (for sidebars, drawers)
 */
export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: ANIMATION_TIMINGS.QUICK }
  }
};

/**
 * Slide from right transition
 */
export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: ANIMATION_TIMINGS.QUICK }
  }
};

/**
 * List item stagger container
 */
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_TIMINGS.STAGGER_ITEM,
      delayChildren: ANIMATION_TIMINGS.STAGGER_ITEM
    }
  }
};

/**
 * List item stagger child
 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  }
};

/**
 * Expand/collapse transition
 */
export const expandVariants: Variants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  },
  expanded: { 
    height: 'auto', 
    opacity: 1,
    transition: { duration: ANIMATION_TIMINGS.DEFAULT }
  }
};

/**
 * Rotation transition (for icons, spinners)
 */
export const rotateVariants: Variants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { 
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Pulse animation (for notifications, badges)
 */
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Shake animation (for errors, validation)
 */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

/**
 * Bounce animation (for success states)
 */
export const bounceVariants: Variants = {
  initial: { y: 0 },
  bounce: {
    y: [0, -10, 0],
    transition: { 
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55] // Bounce easing
    }
  }
};

/**
 * Page transition variants
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: ANIMATION_TIMINGS.DEFAULT
};
