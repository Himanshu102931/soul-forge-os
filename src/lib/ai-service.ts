// AI Service for integrating external AI providers
import { DailyStats } from './local-roast';
import { loadAIConfig } from './encryption';
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

// Estimated costs per 1K tokens (approximate)
const COST_PER_1K_TOKENS = {
  'gemini': 0.0005,      // Gemini Pro
  'openai-3.5': 0.0015,  // GPT-3.5 Turbo
  'openai-4': 0.03,      // GPT-4
  'claude': 0.008,       // Claude Sonnet
};

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
  
  const config = loadAIConfig();
  
  if (!config.enabled || !config.apiKey) {
    return { success: false, error: 'AI not configured' };
  }

  const prompt = buildDrillSergeantPrompt(stats, last7DaysContext);
  
  try {
    let result;
    let providerName: 'gemini' | 'openai' | 'claude';
    
    switch (config.provider) {
      case 'gemini':
        result = await callGeminiAPI(prompt, config.apiKey);
        providerName = 'gemini';
        break;
      case 'openai':
        result = await callOpenAIAPI(prompt, config.apiKey);
        providerName = 'openai';
        break;
      case 'claude':
        result = await callClaudeAPI(prompt, config.apiKey);
        providerName = 'claude';
        break;
      default:
        return { success: false, error: 'Unknown AI provider' };
    }
    
    // Record usage
    if (userId && result.tokensUsed) {
      AIRateLimit.recordRequest(
        userId,
        providerName,
        'roast',
        Math.floor(result.tokensUsed * 0.6), // Estimate input tokens (60%)
        Math.floor(result.tokensUsed * 0.4), // Estimate output tokens (40%)
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

// Gemini API call
async function callGeminiAPI(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    return {
      text,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      cost: ((data.usageMetadata?.totalTokenCount || 0) / 1000) * COST_PER_1K_TOKENS['gemini'],
      provider: 'Gemini',
    };
  } catch (error) {
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// OpenAI API call
async function callOpenAIAPI(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API failed');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      text,
      tokensUsed,
      cost: (tokensUsed / 1000) * COST_PER_1K_TOKENS['openai-3.5'],
      provider: 'OpenAI GPT-3.5',
    };
  } catch (error) {
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Claude API call
async function callClaudeAPI(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API failed');
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'No response';
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;

    return {
      text,
      tokensUsed,
      cost: (tokensUsed / 1000) * COST_PER_1K_TOKENS['claude'],
      provider: 'Claude',
    };
  } catch (error) {
    throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Test AI connection
export async function testAIConnection(provider: string, apiKey: string): Promise<boolean> {
  try {
    const testPrompt = 'Say "Connection successful" if you can read this.';
    
    switch (provider) {
      case 'gemini':
        await callGeminiAPI(testPrompt, apiKey);
        return true;
      case 'openai':
        await callOpenAIAPI(testPrompt, apiKey);
        return true;
      case 'claude':
        await callClaudeAPI(testPrompt, apiKey);
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('AI connection test failed:', error);
    return false;
  }
}
