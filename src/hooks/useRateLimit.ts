/**
 * AI Rate Limiting Hook
 * 
 * Prevents excessive API calls to AI providers
 * Tracks request count and enforces hourly limit
 * 
 * Usage:
 *   const { canMakeRequest, requestsRemaining, makeRequest } = useRateLimit('gemini', 5);
 *   
 *   if (!canMakeRequest) {
 *     toast.error(`Too many requests. Try again in ${timeUntilReset} minutes.`);
 *     return;
 *   }
 *   
 *   const result = await makeRequest(async () => {
 *     return aiService.generateSuggestions(...);
 *   });
 */

import { useState, useCallback, useEffect } from 'react';

interface RateLimitState {
  provider: string;
  requests: number[];
  limit: number;
  windowMs: number;
}

const RATE_LIMIT_STORAGE_KEY = 'ai-rate-limits';
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_LIMIT = 5; // 5 requests per hour

/**
 * Get all rate limit states from localStorage
 */
function getStoredRateLimits(): Record<string, RateLimitState> {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save rate limit states to localStorage
 */
function saveRateLimits(limits: Record<string, RateLimitState>) {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(limits));
  } catch {
    console.error('Failed to save rate limits to localStorage');
  }
}

/**
 * Clean old requests outside the window
 */
function cleanOldRequests(requests: number[], windowMs: number): number[] {
  const now = Date.now();
  return requests.filter(time => now - time < windowMs);
}

/**
 * Hook for rate limiting API requests
 * 
 * @param provider - AI provider name (e.g., 'gemini', 'openai', 'claude')
 * @param limit - Max requests per hour (default: 5)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 */
export function useRateLimit(
  provider: string = 'gemini',
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
) {
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = getStoredRateLimits();
    if (stored[provider]) {
      return {
        ...stored[provider],
        limit,
        windowMs,
      };
    }
    return {
      provider,
      requests: [],
      limit,
      windowMs,
    };
  });

  const [canMakeRequest, setCanMakeRequest] = useState(true);
  const [requestsRemaining, setRequestsRemaining] = useState(limit);
  const [timeUntilReset, setTimeUntilReset] = useState<number | null>(null);

  // Update state when localStorage changes
  useEffect(() => {
    const updateState = () => {
      const stored = getStoredRateLimits();
      if (stored[provider]) {
        setState(prev => ({
          ...prev,
          requests: cleanOldRequests(stored[provider].requests, windowMs),
        }));
      }
    };

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', updateState);
    
    // Also update periodically to clean old requests
    const interval = setInterval(updateState, 5000);
    
    return () => {
      window.removeEventListener('storage', updateState);
      clearInterval(interval);
    };
  }, [provider, windowMs]);

  // Update computed values
  useEffect(() => {
    const cleanedRequests = cleanOldRequests(state.requests, state.windowMs);
    const remaining = Math.max(0, state.limit - cleanedRequests.length);
    const canMake = cleanedRequests.length < state.limit;
    
    setRequestsRemaining(remaining);
    setCanMakeRequest(canMake);

    // Calculate time until reset
    if (!canMake && cleanedRequests.length > 0) {
      const oldestRequest = Math.min(...cleanedRequests);
      const timeUntil = Math.ceil((oldestRequest + state.windowMs - Date.now()) / 1000 / 60);
      setTimeUntilReset(Math.max(0, timeUntil));
    } else {
      setTimeUntilReset(null);
    }

    // Update stored state
    const allLimits = getStoredRateLimits();
    allLimits[provider] = {
      ...state,
      requests: cleanedRequests,
    };
    saveRateLimits(allLimits);
  }, [state, provider]);

  /**
   * Make a rate-limited request
   * Throws error if rate limit exceeded
   */
  const makeRequest = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const cleanedRequests = cleanOldRequests(state.requests, state.windowMs);

      if (cleanedRequests.length >= state.limit) {
        const oldestRequest = Math.min(...cleanedRequests);
        const waitMs = oldestRequest + state.windowMs - Date.now();
        const waitMinutes = Math.ceil(waitMs / 1000 / 60);
        
        throw new Error(
          `Rate limit exceeded for ${provider}. ` +
          `You've made ${state.limit} requests in the last hour. ` +
          `Please try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`
        );
      }

      const result = await fn();
      
      // Record this request
      const updatedRequests = [...cleanedRequests, Date.now()];
      const allLimits = getStoredRateLimits();
      allLimits[provider] = {
        ...state,
        requests: updatedRequests,
      };
      saveRateLimits(allLimits);
      
      setState(prev => ({
        ...prev,
        requests: updatedRequests,
      }));

      return result;
    },
    [state, provider]
  );

  /**
   * Manually reset the rate limit (for testing/admin purposes)
   */
  const resetLimit = useCallback(() => {
    const allLimits = getStoredRateLimits();
    allLimits[provider] = {
      provider,
      requests: [],
      limit: state.limit,
      windowMs: state.windowMs,
    };
    saveRateLimits(allLimits);
    
    setState(prev => ({
      ...prev,
      requests: [],
    }));
  }, [provider, state.limit, state.windowMs]);

  return {
    // Status
    canMakeRequest,
    requestsRemaining,
    requestsMade: Math.max(0, state.limit - requestsRemaining),
    timeUntilReset,
    
    // Actions
    makeRequest,
    resetLimit,
    
    // Debug
    provider,
    limit: state.limit,
    windowMs: state.windowMs,
  };
}

/**
 * Hook for tracking total AI costs across all providers
 */
export function useAICostTracking() {
  const [totalCost, setTotalCost] = useState(0);
  const [costByProvider, setCostByProvider] = useState<Record<string, number>>({});
  const [costByFeature, setCostByFeature] = useState<Record<string, number>>({});

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-cost-tracking');
      if (stored) {
        const data = JSON.parse(stored);
        setTotalCost(data.totalCost || 0);
        setCostByProvider(data.costByProvider || {});
        setCostByFeature(data.costByFeature || {});
      }
    } catch {
      console.error('Failed to load cost tracking data');
    }
  }, []);

  const recordCost = useCallback((
    provider: string,
    feature: string,
    cost: number
  ) => {
    setTotalCost(prev => prev + cost);
    
    setCostByProvider(prev => ({
      ...prev,
      [provider]: (prev[provider] || 0) + cost,
    }));
    
    setCostByFeature(prev => ({
      ...prev,
      [feature]: (prev[feature] || 0) + cost,
    }));

    // Persist to localStorage
    try {
      const data = {
        totalCost: totalCost + cost,
        costByProvider: { ...costByProvider, [provider]: (costByProvider[provider] || 0) + cost },
        costByFeature: { ...costByFeature, [feature]: (costByFeature[feature] || 0) + cost },
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('ai-cost-tracking', JSON.stringify(data));
    } catch {
      console.error('Failed to save cost tracking data');
    }
  }, [totalCost, costByProvider, costByFeature]);

  const resetCostTracking = useCallback(() => {
    setTotalCost(0);
    setCostByProvider({});
    setCostByFeature({});
    localStorage.removeItem('ai-cost-tracking');
  }, []);

  return {
    totalCost,
    costByProvider,
    costByFeature,
    recordCost,
    resetCostTracking,
  };
}

/**
 * Hook combining rate limiting and cost tracking
 */
export function useAILimitation(provider: string = 'gemini') {
  const rateLimiting = useRateLimit(provider);
  const costTracking = useAICostTracking();

  return {
    ...rateLimiting,
    ...costTracking,
  };
}
