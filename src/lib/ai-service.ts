// AI Service for integrating external AI providers
// Now uses Edge Function proxy for secure server-side API key management
import { DailyStats } from './local-roast';
import { supabase } from '@/integrations/supabase/client';
import { AIRateLimit } from './ai-rate-limit';

export interface AIResponse {
  text: string;
  tokensUsed?: number;
  cost?: number;
  provider: string;
}

export interface AIRequestResult<T = AIResponse> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimited?: boolean;
}

// Call AI proxy Edge Function (server-side key management)
async function callAIProxy(
  provider: 'gemini' | 'openai' | 'claude',
  prompt: string,
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      provider,
      prompt,
      model: options?.model,
      maxTokens: options?.maxTokens || 200,
      temperature: options?.temperature || 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI proxy request failed');
  }

  return await response.json();
}

// Generate AI-powered drill sergeant roast
export async function generateAIDrillSergeantRoast(
  stats: DailyStats,
  last7DaysContext?: DailyStats[],
  userId?: string
): Promise<{ success: boolean; roast?: string; tokensUsed?: number; cost?: number; error?: string; rateLimited?: boolean }> {
  // Check rate limit
  if (userId) {
    const { allowed, reason } = AIRateLimit.canMakeRequest(userId);
    if (!allowed) {
      return {
        success: false,
        error: reason || 'Rate limit exceeded',
        rateLimited: true,
      };
    }
  }
  
  // Get user's configured provider from database
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: configData } = await supabase
    .from('user_ai_config')
    .select('provider, enabled')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .single();

  if (!configData) {
    return { success: false, error: 'AI not configured' };
  }

  const prompt = buildDrillSergeantPrompt(stats, last7DaysContext);
  
  try {
    // Call server-side AI proxy (keys never exposed to client)
    const result = await callAIProxy(configData.provider as 'gemini' | 'openai' | 'claude', prompt);
    
    // Record usage (server already logged in database)
    if (userId && result.tokensUsed) {
      AIRateLimit.recordRequest(
        userId,
        configData.provider,
        'roast',
        Math.floor(result.tokensUsed * 0.6),
        Math.floor(result.tokensUsed * 0.4),
        result.provider
      );
    }
    
    return {
      success: true,
      roast: result.text,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Build drill sergeant prompt
function buildDrillSergeantPrompt(stats: DailyStats, last7Days?: DailyStats[]): string {
  const { 
    sleepHours, 
    completedHabits, 
    totalHabits, 
    steps, 
    partialHabits = 0,
    resistanceCompleted = 0,
    resistanceTotal = 0,
    missedHabits
  } = stats;

  const completionRate = totalHabits > 0 ? (completedHabits / totalHabits * 100).toFixed(1) : 0;
  const resistanceRate = resistanceTotal > 0 ? (resistanceCompleted / resistanceTotal * 100).toFixed(1) : 100;

  return `You are a brutally honest, aggressive drill sergeant reviewing someone's daily performance. Your job is to roast them if they underperformed and grudgingly acknowledge if they did well.

**Today's Performance:**
- Sleep: ${sleepHours} hours
- Good Habits: ${completedHabits}/${totalHabits} completed (${completionRate}%)
- Partial completions: ${partialHabits}
- Bad Habits resisted: ${resistanceCompleted}/${resistanceTotal} (${resistanceRate}%)
- Missed habits: ${missedHabits}
- Steps: ${steps}

${last7Days ? `**Last 7 Days Context:** ${JSON.stringify(last7Days)}` : ''}

**Instructions:**
- Keep response to 2-3 sentences max
- Be BRUTAL and DIRECT (use CAPS for emphasis)
- If performance is poor (<50% completion or <5 hrs sleep): ROAST them hard
- If performance is average (50-75%): Push them to do better
- If performance is excellent (85%+ and good sleep): Grudgingly acknowledge it
- Focus on the most glaring weakness
- No sugar-coating, pure drill sergeant energy
- End with a motivational kick

Generate a drill sergeant roast:`;
}

// Test AI connection (via proxy)
export async function testAIConnection(provider: 'gemini' | 'openai' | 'claude'): Promise<boolean> {
  try {
    const testPrompt = 'Say "Connection successful" if you can read this.';
    await callAIProxy(provider, testPrompt, { maxTokens: 50 });
    return true;
  } catch (error) {
    console.error('AI connection test failed:', error);
    return false;
  }
}
