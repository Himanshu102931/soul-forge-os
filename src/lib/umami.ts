/**
 * Umami Analytics Integration
 * Privacy-friendly, GDPR-compliant analytics
 * 
 * Setup Instructions:
 * 1. Sign up at https://cloud.umami.is/ (or self-host)
 * 2. Create a website in your Umami dashboard
 * 3. Copy your Website ID
 * 4. Add to .env:
 *    VITE_UMAMI_WEBSITE_ID=your-website-id
 *    VITE_UMAMI_SRC=https://cloud.umami.is/script.js (or your self-hosted URL)
 */

// TypeScript declaration for Umami global
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
const UMAMI_SRC = import.meta.env.VITE_UMAMI_SRC;

/**
 * Check if Umami is configured and available
 */
export function isUmamiEnabled(): boolean {
  return !!(UMAMI_WEBSITE_ID && UMAMI_SRC);
}

/**
 * Check if Umami is loaded and ready
 */
export function isUmamiLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.umami;
}

/**
 * Track a custom event with Umami
 * @param eventName The name of the event (e.g., 'habit-completed', 'task-created')
 * @param eventData Optional data to attach to the event
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  if (!isUmamiEnabled()) {
    console.debug('[Umami] Not configured - skipping event:', eventName);
    return;
  }

  if (!isUmamiLoaded()) {
    console.warn('[Umami] Script not loaded yet - skipping event:', eventName);
    return;
  }

  try {
    window.umami?.track(eventName, eventData);
    console.debug('[Umami] Event tracked:', eventName, eventData);
  } catch (error) {
    console.error('[Umami] Failed to track event:', error);
  }
}

/**
 * Track page view (Umami does this automatically, but you can manually trigger)
 * @param pageName Optional custom page name
 */
export function trackPageView(pageName?: string): void {
  if (pageName) {
    trackEvent('pageview', { page: pageName });
  }
}

/**
 * Common event tracking helpers
 */
export const analytics = {
  // Habit events
  habitCompleted: (habitId: string, habitTitle: string) => 
    trackEvent('habit-completed', { habitId, habitTitle }),
  
  habitCreated: (habitTitle: string) => 
    trackEvent('habit-created', { habitTitle }),
  
  habitArchived: (habitTitle: string) => 
    trackEvent('habit-archived', { habitTitle }),
  
  // Task events
  taskCompleted: (taskTitle: string) => 
    trackEvent('task-completed', { taskTitle }),
  
  taskCreated: (taskTitle: string) => 
    trackEvent('task-created', { taskTitle }),
  
  // AI events
  aiSuggestionsGenerated: (count: number) => 
    trackEvent('ai-suggestions-generated', { count }),
  
  aiInsightsViewed: (type: 'weekly' | 'monthly') => 
    trackEvent('ai-insights-viewed', { type }),
  
  // Level events
  levelUp: (newLevel: number) => 
    trackEvent('level-up', { level: newLevel }),
  
  // Settings events
  settingsChanged: (setting: string, value: string | number | boolean) => 
    trackEvent('settings-changed', { setting, value }),
};

/**
 * Initialize Umami tracking script dynamically
 * Call this in your main.tsx or App.tsx
 */
export function initializeUmami(): void {
  if (!isUmamiEnabled()) {
    console.info('[Umami] Analytics not configured. See src/lib/umami.ts for setup instructions.');
    return;
  }

  if (isUmamiLoaded()) {
    console.debug('[Umami] Already loaded');
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.setAttribute('data-website-id', UMAMI_WEBSITE_ID!);
    script.src = UMAMI_SRC!;
    
    script.onload = () => {
      console.info('[Umami] Analytics loaded successfully');
    };
    
    script.onerror = () => {
      console.error('[Umami] Failed to load analytics script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Umami] Error initializing analytics:', error);
  }
}
