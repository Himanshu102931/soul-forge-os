// Sentry Integration - Error Tracking & Performance Monitoring
// Initialize Sentry for production error tracking and performance monitoring

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

/**
 * Initialize Sentry for error tracking and performance monitoring
 * 
 * Features:
 * - Automatic error capture (unhandled exceptions, console.error)
 * - Performance monitoring (page loads, API calls, user interactions)
 * - Release tracking (know which version had errors)
 * - User tracking (identify affected users)
 * - Environment separation (dev vs production)
 */

export function initializeSentry() {
  // Only initialize in production or if explicitly enabled
  const isDev = import.meta.env.DEV;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn("Sentry DSN not configured. Error tracking disabled.");
    return;
  }

  Sentry.init({
    // Sentry project URL (get from https://sentry.io/)
    dsn: sentryDsn,

    // Release version for tracking which versions have issues
    release: "soul-forge-os@1.0.0",

    // Environment separation
    environment: isDev ? "development" : "production",

    // Performance monitoring
    integrations: [
      // Capture page load performance
      new BrowserTracing({
        // Capture user interactions (clicks, navigation, etc)
        tracingOrigins: [
          "localhost",
          /^\//,
          /^https:\/\/himanshu102931\.github\.io/,
          /^https:\/\/.*\.supabase\.co/,
        ],
        // Sample % of transactions (1 = 100%, 0.1 = 10%)
        traceSampleRate: isDev ? 1.0 : 0.1,
      }),
      // Capture console.error, console.warn as breadcrumbs
      new Sentry.Replay({
        maskAllText: true, // Hide user data in replay
        blockAllMedia: true, // Don't record media
      }),
    ],

    // Capture unhandled promise rejections
    attachStacktrace: true,

    // Capture breadcrumbs (user actions that led to error)
    maxBreadcrumbs: 50,

    // Session tracking (track user sessions)
    tracesSampleRate: isDev ? 1.0 : 0.1,

    // Replays: Record user sessions on error (1% of sessions on errors, 0.1% of all sessions)
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: isDev ? 1.0 : 0.1,

    // Skip certain errors
    beforeSend(event, hint) {
      // Ignore ResizeObserver errors (spam)
      if (
        hint.originalException?.message?.includes("ResizeObserver") ||
        event.exception?.values?.[0]?.value?.includes("ResizeObserver")
      ) {
        return null;
      }

      // Ignore network errors we can't control
      if (
        hint.originalException?.message?.includes("Network request failed")
      ) {
        return null;
      }

      return event;
    },

    // Debug mode
    debug: isDev,
  });

  console.log(
    `Sentry initialized for ${isDev ? "development" : "production"} environment`
  );
}

/**
 * Capture user context for Sentry
 * Call this after user authenticates
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email || undefined,
  });
}

/**
 * Clear user context (call on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add custom context/tags for better error tracking
 */
export function setSentryContext(
  contextName: string,
  context: Record<string, any>
) {
  Sentry.setContext(contextName, context);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Start a manual transaction for performance tracking
 * Useful for tracking specific operations
 */
export function startTransaction(
  name: string,
  op: string = "http.client"
): Sentry.Transaction | null {
  return Sentry.startTransaction({
    name,
    op,
  });
}

export default Sentry;
