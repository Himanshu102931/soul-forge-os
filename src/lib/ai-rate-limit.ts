/**
 * AI Rate Limiting & Cost Tracking System
 * Prevents unexpected API costs and tracks usage
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export interface AIUsageRecord {
  id: string;
  timestamp: number;
  provider: 'gemini' | 'openai' | 'claude';
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost: number; // in USD
  feature: string; // 'roast', 'suggestion', 'weekly-insights', etc.
}

export interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxDailyCost: number; // in USD
  warningThreshold: number; // percentage (e.g., 80 = 80%)
}

export interface UsageStats {
  hourly: number;
  daily: number;
  dailyCost: number;
  providerBreakdown: Record<string, number>;
  featureBreakdown: Record<string, number>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequestsPerHour: 5,
  maxRequestsPerDay: 20,
  maxDailyCost: 1.00, // $1 per day max
  warningThreshold: 80, // warn at 80%
};

// Estimated costs per 1K tokens (approximate, update as needed)
const TOKEN_COSTS = {
  gemini: {
    'gemini-1.5-flash': { input: 0.00015, output: 0.0006 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  },
  openai: {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
  },
  claude: {
    'claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
  },
};

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  USAGE_RECORDS: 'ai_usage_records',
  RATE_LIMIT_CONFIG: 'ai_rate_limit_config',
  BUDGET_ALERT_SHOWN: 'ai_budget_alert_shown',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStorageKey(userId: string, key: string): string {
  return `${userId}_${key}`;
}

function getUsageRecords(userId: string): AIUsageRecord[] {
  const key = getStorageKey(userId, STORAGE_KEYS.USAGE_RECORDS);
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveUsageRecord(userId: string, record: AIUsageRecord): void {
  const records = getUsageRecords(userId);
  records.push(record);
  
  // Keep only last 7 days of records
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const filtered = records.filter(r => r.timestamp > sevenDaysAgo);
  
  const key = getStorageKey(userId, STORAGE_KEYS.USAGE_RECORDS);
  localStorage.setItem(key, JSON.stringify(filtered));
}

function getRateLimitConfig(userId: string): RateLimitConfig {
  const key = getStorageKey(userId, STORAGE_KEYS.RATE_LIMIT_CONFIG);
  const stored = localStorage.getItem(key);
  if (!stored) return DEFAULT_RATE_LIMIT;
  
  try {
    return { ...DEFAULT_RATE_LIMIT, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_RATE_LIMIT;
  }
}

function saveRateLimitConfig(userId: string, config: Partial<RateLimitConfig>): void {
  const current = getRateLimitConfig(userId);
  const updated = { ...current, ...config };
  
  const key = getStorageKey(userId, STORAGE_KEYS.RATE_LIMIT_CONFIG);
  localStorage.setItem(key, JSON.stringify(updated));
}

function calculateCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const providerCosts = TOKEN_COSTS[provider as keyof typeof TOKEN_COSTS];
  if (!providerCosts) {
    return ((inputTokens + outputTokens) / 1000) * 0.001;
  }
  const costs = providerCosts[model as keyof typeof providerCosts] as { input: number; output: number } | undefined;
  if (!costs) {
    // Fallback: use average cost if model not found
    return ((inputTokens + outputTokens) / 1000) * 0.001;
  }
  
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  
  return inputCost + outputCost;
}

function calculateUsageStats(records: AIUsageRecord[]): UsageStats {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  
  const hourlyRecords = records.filter(r => r.timestamp > oneHourAgo);
  const dailyRecords = records.filter(r => r.timestamp > oneDayAgo);
  
  const providerBreakdown: Record<string, number> = {};
  const featureBreakdown: Record<string, number> = {};
  let dailyCost = 0;
  
  dailyRecords.forEach(record => {
    providerBreakdown[record.provider] = (providerBreakdown[record.provider] || 0) + 1;
    featureBreakdown[record.feature] = (featureBreakdown[record.feature] || 0) + 1;
    dailyCost += record.estimated_cost;
  });
  
  return {
    hourly: hourlyRecords.length,
    daily: dailyRecords.length,
    dailyCost,
    providerBreakdown,
    featureBreakdown,
  };
}

// ============================================================================
// REACT HOOK
// ============================================================================

export function useAIRateLimit() {
  const { user } = useAuth();
  const [config, setConfig] = useState<RateLimitConfig>(DEFAULT_RATE_LIMIT);
  const [stats, setStats] = useState<UsageStats>({
    hourly: 0,
    daily: 0,
    dailyCost: 0,
    providerBreakdown: {},
    featureBreakdown: {},
  });
  
  // Load config and calculate stats
  useEffect(() => {
    if (!user?.id) return;
    
    const loadedConfig = getRateLimitConfig(user.id);
    setConfig(loadedConfig);
    
    const records = getUsageRecords(user.id);
    const calculatedStats = calculateUsageStats(records);
    setStats(calculatedStats);
  }, [user?.id]);
  
  // Check if request is allowed
  const canMakeRequest = (): { allowed: boolean; reason?: string } => {
    if (!user?.id) return { allowed: false, reason: 'Not authenticated' };
    
    if (stats.hourly >= config.maxRequestsPerHour) {
      return { allowed: false, reason: `Hourly limit reached (${config.maxRequestsPerHour} requests/hour)` };
    }
    
    if (stats.daily >= config.maxRequestsPerDay) {
      return { allowed: false, reason: `Daily limit reached (${config.maxRequestsPerDay} requests/day)` };
    }
    
    if (stats.dailyCost >= config.maxDailyCost) {
      return { allowed: false, reason: `Daily cost limit reached ($${config.maxDailyCost})` };
    }
    
    return { allowed: true };
  };
  
  // Record a request
  const recordRequest = (
    provider: 'gemini' | 'openai' | 'claude',
    feature: string,
    inputTokens = 0,
    outputTokens = 0,
    model?: string
  ): void => {
    if (!user?.id) return;
    
    const estimatedCost = calculateCost(provider, model || '', inputTokens, outputTokens);
    
    const record: AIUsageRecord = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      provider,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: estimatedCost,
      feature,
    };
    
    saveUsageRecord(user.id, record);
    
    // Recalculate stats
    const records = getUsageRecords(user.id);
    const updatedStats = calculateUsageStats(records);
    setStats(updatedStats);
  };
  
  // Update config
  const updateConfig = (newConfig: Partial<RateLimitConfig>): void => {
    if (!user?.id) return;
    
    saveRateLimitConfig(user.id, newConfig);
    const updated = getRateLimitConfig(user.id);
    setConfig(updated);
  };
  
  // Get all usage records (for dashboard)
  const getRecords = (): AIUsageRecord[] => {
    if (!user?.id) return [];
    return getUsageRecords(user.id);
  };
  
  // Calculate usage percentages
  const getUsagePercentages = () => {
    return {
      hourly: (stats.hourly / config.maxRequestsPerHour) * 100,
      daily: (stats.daily / config.maxRequestsPerDay) * 100,
      cost: (stats.dailyCost / config.maxDailyCost) * 100,
    };
  };
  
  // Check if warning threshold reached
  const shouldShowWarning = (): boolean => {
    const percentages = getUsagePercentages();
    return (
      percentages.hourly >= config.warningThreshold ||
      percentages.daily >= config.warningThreshold ||
      percentages.cost >= config.warningThreshold
    );
  };
  
  return {
    config,
    stats,
    canMakeRequest,
    recordRequest,
    updateConfig,
    getRecords,
    getUsagePercentages,
    shouldShowWarning,
  };
}

// ============================================================================
// STANDALONE FUNCTIONS (for use outside React components)
// ============================================================================

export const AIRateLimit = {
  canMakeRequest(userId: string): { allowed: boolean; reason?: string } {
    const config = getRateLimitConfig(userId);
    const records = getUsageRecords(userId);
    const stats = calculateUsageStats(records);
    
    if (stats.hourly >= config.maxRequestsPerHour) {
      return { allowed: false, reason: `Hourly limit reached (${config.maxRequestsPerHour} requests/hour)` };
    }
    
    if (stats.daily >= config.maxRequestsPerDay) {
      return { allowed: false, reason: `Daily limit reached (${config.maxRequestsPerDay} requests/day)` };
    }
    
    if (stats.dailyCost >= config.maxDailyCost) {
      return { allowed: false, reason: `Daily cost limit reached ($${config.maxDailyCost})` };
    }
    
    return { allowed: true };
  },
  
  recordRequest(
    userId: string,
    provider: 'gemini' | 'openai' | 'claude',
    feature: string,
    inputTokens = 0,
    outputTokens = 0,
    model?: string
  ): void {
    const estimatedCost = calculateCost(provider, model || '', inputTokens, outputTokens);
    
    const record: AIUsageRecord = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      provider,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost: estimatedCost,
      feature,
    };
    
    saveUsageRecord(userId, record);
  },
};
