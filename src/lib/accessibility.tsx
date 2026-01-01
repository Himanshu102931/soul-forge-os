/**
 * PHASE 3D: Accessibility Improvements
 * WCAG 2.1 AAA Compliance Module
 * 
 * Features:
 * 1. Keyboard Navigation (Arrow keys, Tab, Enter, Escape)
 * 2. Screen Reader Support (ARIA labels, live regions)
 * 3. Focus Management
 * 4. Color Contrast Validation
 * 5. Touch Target Sizing
 */

import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * ============================================
 * WCAG STANDARDS
 * ============================================
 */

export const WCAG_STANDARDS = {
  // Touch target size (WCAG 2.5.5 Level AAA)
  TOUCH_TARGET_MIN: 44,    // Minimum 44x44 pixels
  TOUCH_TARGET_AAA: 44,    // AAA level
  TOUCH_TARGET_SPACING: 8, // Minimum 8px spacing

  // Color contrast ratios
  CONTRAST: {
    NORMAL_TEXT_AA: 4.5,      // Normal text AA
    NORMAL_TEXT_AAA: 7,       // Normal text AAA
    LARGE_TEXT_AA: 3,         // Large text (18pt+) AA
    LARGE_TEXT_AAA: 4.5,      // Large text AAA
    UI_COMPONENTS_AA: 3,      // UI components AA
    UI_COMPONENTS_AAA: 3,     // UI components AAA (same)
  },

  // Focus indicators
  FOCUS_OUTLINE_WIDTH: 2,   // 2px minimum
  FOCUS_OUTLINE_OFFSET: 2,  // 2px offset from element

  // Keyboard timing
  KEY_REPEAT_INITIAL: 500,  // 500ms before repeat starts
  KEY_REPEAT_INTERVAL: 50,  // 50ms between repeats
};

/**
 * ============================================
 * KEYBOARD NAVIGATION HOOKS
 * ============================================
 */

interface UseKeyboardNavigationOptions {
  initialIndex?: number;
  itemCount: number;
  onSelect: (index: number) => void;
  allowHorizontal?: boolean;
  allowVertical?: boolean;
  wrapAround?: boolean;
  disabled?: boolean;
}

/**
 * Hook for managing keyboard navigation through lists/grids
 * Supports arrow keys, Home, End, Tab
 */
export const useKeyboardNavigation = ({
  initialIndex = 0,
  itemCount,
  onSelect,
  allowHorizontal = true,
  allowVertical = true,
  wrapAround = true,
  disabled = false,
}: UseKeyboardNavigationOptions) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const itemsPerRow = Math.ceil(Math.sqrt(itemCount)); // For grid layout

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      let nextIndex = currentIndex;
      let handled = false;

      switch (e.key) {
        // Horizontal navigation
        case 'ArrowRight':
          if (allowHorizontal) {
            nextIndex = wrapAround
              ? (currentIndex + 1) % itemCount
              : Math.min(currentIndex + 1, itemCount - 1);
            handled = true;
          }
          break;

        case 'ArrowLeft':
          if (allowHorizontal) {
            nextIndex = wrapAround
              ? (currentIndex - 1 + itemCount) % itemCount
              : Math.max(currentIndex - 1, 0);
            handled = true;
          }
          break;

        // Vertical navigation
        case 'ArrowDown':
          if (allowVertical) {
            nextIndex = Math.min(currentIndex + itemsPerRow, itemCount - 1);
            handled = true;
          }
          break;

        case 'ArrowUp':
          if (allowVertical) {
            nextIndex = Math.max(currentIndex - itemsPerRow, 0);
            handled = true;
          }
          break;

        // Jump to start
        case 'Home':
          nextIndex = 0;
          handled = true;
          break;

        // Jump to end
        case 'End':
          nextIndex = itemCount - 1;
          handled = true;
          break;

        // Enter/Space to select
        case 'Enter':
        case ' ':
          onSelect(currentIndex);
          handled = true;
          break;

        default:
          break;
      }

      if (handled) {
        e.preventDefault();
        if (nextIndex !== currentIndex) {
          setCurrentIndex(nextIndex);
          onSelect(nextIndex);
        }
      }
    },
    [currentIndex, itemCount, onSelect, allowHorizontal, allowVertical, wrapAround, disabled, itemsPerRow],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
};

/**
 * ============================================
 * FOCUS MANAGEMENT
 * ============================================
 */

/**
 * Hook for managing focus within a component
 * Useful for modals, dropdowns, etc.
 */
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(containerRef.current.querySelectorAll(selector));
  }, []);

  const focusNextElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const nextIndex = (focusedIndex + 1) % elements.length;
    setFocusedIndex(nextIndex);
    elements[nextIndex].focus();
  }, [focusedIndex, getFocusableElements]);

  const focusPreviousElement = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const prevIndex = (focusedIndex - 1 + elements.length) % elements.length;
    setFocusedIndex(prevIndex);
    elements[prevIndex].focus();
  }, [focusedIndex, getFocusableElements]);

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      if (e.shiftKey) {
        focusPreviousElement();
      } else {
        focusNextElement();
      }

      e.preventDefault();
    },
    [focusNextElement, focusPreviousElement, getFocusableElements],
  );

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    focusNextElement,
    focusPreviousElement,
    trapFocus,
    getFocusableElements,
  };
};

/**
 * ============================================
 * ARIA UTILITIES
 * ============================================
 */

/**
 * Generate ARIA labels for common components
 */
export const generateAriaLabel = (context: {
  type: 'button' | 'link' | 'tab' | 'menuitem' | 'achievement';
  label: string;
  state?: string;
  count?: number;
}): string => {
  const { type, label, state, count } = context;

  switch (type) {
    case 'button':
      return `${label}${state ? `, ${state}` : ''}`;

    case 'achievement': {
      const statusText = state === 'locked' ? 'locked' : 'unlocked';
      const countText = count ? `, ${count}% complete` : '';
      return `${label}, ${statusText}${countText}`;
    }

    case 'tab':
      return `${label} tab${state ? `, ${state}` : ''}`;

    case 'menuitem':
      return `${label}${state ? `, ${state}` : ''}`;

    default:
      return label;
  }
};

/**
 * ARIA live region for announcements
 */
export interface AriaLiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  atomic?: boolean;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  politeness = 'polite',
  atomic = true,
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    className="sr-only"
    role="status"
  >
    {message}
  </div>
);

/**
 * ============================================
 * COLOR CONTRAST UTILITIES
 * ============================================
 */

/**
 * Calculate relative luminance for WCAG contrast ratio
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export const getContrastRatio = (
  color1: [r: number, g: number, b: number],
  color2: [r: number, g: number, b: number],
): number => {
  const l1 = getRelativeLuminance(color1[0], color1[1], color1[2]);
  const l2 = getRelativeLuminance(color2[0], color2[1], color2[2]);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate color contrast against WCAG standard
 */
export const validateContrast = (
  foreground: [r: number, g: number, b: number],
  background: [r: number, g: number, b: number],
  isLargeText: boolean = false,
): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
} => {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    meetsAA: isLargeText ? ratio >= WCAG_STANDARDS.CONTRAST.LARGE_TEXT_AA : ratio >= WCAG_STANDARDS.CONTRAST.NORMAL_TEXT_AA,
    meetsAAA: isLargeText ? ratio >= WCAG_STANDARDS.CONTRAST.LARGE_TEXT_AAA : ratio >= WCAG_STANDARDS.CONTRAST.NORMAL_TEXT_AAA,
  };
};

/**
 * ============================================
 * TOUCH TARGET VALIDATION
 * ============================================
 */

/**
 * Validate touch target size
 */
export const validateTouchTarget = (
  element: HTMLElement,
): {
  width: number;
  height: number;
  meetsMin: boolean;
  meetsAAA: boolean;
} => {
  const rect = element.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    meetsMin: rect.width >= WCAG_STANDARDS.TOUCH_TARGET_MIN && rect.height >= WCAG_STANDARDS.TOUCH_TARGET_MIN,
    meetsAAA: rect.width >= WCAG_STANDARDS.TOUCH_TARGET_AAA && rect.height >= WCAG_STANDARDS.TOUCH_TARGET_AAA,
  };
};

/**
 * ============================================
 * SCREEN READER SUPPORT
 * ============================================
 */

/**
 * Skip to main content link component
 * Should be first focusable element on page
 */
export const SkipToMainContent: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground"
  >
    Skip to main content
  </a>
);

/**
 * Visually hidden but readable by screen readers
 */
export const SR_ONLY_STYLES = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

/**
 * ============================================
 * HONEYCOMB ACCESSIBILITY
 * ============================================
 */

/**
 * Hook for making honeycomb/circular layouts keyboard accessible
 */
export const useHoneycombKeyboardNav = ({
  itemCount,
  onSelect,
}: {
  itemCount: number;
  onSelect: (index: number) => void;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keysHandled = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];

      if (!keysHandled.includes(e.key)) return;

      e.preventDefault();

      let nextIndex = selectedIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (selectedIndex + 1) % itemCount;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (selectedIndex - 1 + itemCount) % itemCount;
          break;

        case 'Home':
          nextIndex = 0;
          break;

        case 'End':
          nextIndex = itemCount - 1;
          break;

        case 'Enter':
        case ' ':
          onSelect(selectedIndex);
          return;

        default:
          break;
      }

      if (nextIndex !== selectedIndex) {
        setSelectedIndex(nextIndex);
        onSelect(nextIndex);

        // Announce to screen readers
        const element = containerRef.current?.querySelector(
          `[data-achievement-index="${nextIndex}"]`,
        ) as HTMLElement;
        element?.focus();
      }
    },
    [selectedIndex, itemCount, onSelect],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    containerRef,
    selectedIndex,
    setSelectedIndex,
  };
};

/**
 * ============================================
 * ANNOUNCEMENTS & NOTIFICATIONS
 * ============================================
 */

/**
 * Announce achievement unlock to screen readers
 */
export const announceAchievementUnlock = (
  achievementName: string,
  rarity: string,
): void => {
  const message = `Achievement Unlocked: ${achievementName}! ${rarity} rarity.`;

  const region = document.createElement('div');
  region.setAttribute('aria-live', 'assertive');
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  region.textContent = message;

  document.body.appendChild(region);

  setTimeout(() => {
    document.body.removeChild(region);
  }, 1000);
};

/**
 * ============================================
 * TESTING UTILITIES
 * ============================================
 */

/**
 * Test WCAG compliance of a component
 */
export const testWCAGCompliance = (element: HTMLElement): {
  hasAlt: boolean;
  hasAriaLabels: boolean;
  focusable: boolean;
  contrastRatio: number;
  touchTargetSize: { width: number; height: number };
} => {
  const images = element.querySelectorAll('img');
  const hasAlt = Array.from(images).every((img) => img.hasAttribute('alt'));

  const buttons = element.querySelectorAll('button, [role="button"]');
  const hasAriaLabels = Array.from(buttons).every((btn) =>
    btn.hasAttribute('aria-label') || btn.textContent?.trim(),
  );

  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]',
  );
  const focusable = focusableElements.length > 0;

  const rect = element.getBoundingClientRect();
  const touchTargetSize = { width: rect.width, height: rect.height };

  return {
    hasAlt,
    hasAriaLabels,
    focusable,
    contrastRatio: 7, // Mock value for demo
    touchTargetSize,
  };
};

export default {
  WCAG_STANDARDS,
  useKeyboardNavigation,
  useFocusManagement,
  generateAriaLabel,
  AriaLiveRegion,
  getRelativeLuminance,
  getContrastRatio,
  validateContrast,
  validateTouchTarget,
  SkipToMainContent,
  SR_ONLY_STYLES,
  useHoneycombKeyboardNav,
  announceAchievementUnlock,
  testWCAGCompliance,
};
