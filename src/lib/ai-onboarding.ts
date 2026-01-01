// AI Onboarding Service - Help new users set up their Life OS
import { loadAIConfig } from './encryption';

export interface OnboardingInput {
  goals: string; // User's main goals (e.g., "Get fit, build side project, improve sleep")
  experience: string; // Habit tracking experience (beginner/intermediate/advanced)
  availableTime: string; // How much time they can dedicate (e.g., "30 min/day")
}

export interface HabitSuggestion {
  title: string;
  frequency: number[]; // Days of week (0-6)
  xpReward: number; // 5, 10, or 15
  category: 'health' | 'productivity' | 'learning' | 'social' | 'other';
  reason: string; // Why AI suggests this
}

export interface OnboardingResult {
  success: boolean;
  habits?: HabitSuggestion[];
  welcomeMessage?: string;
  error?: string;
}

// Generate onboarding recommendations using AI
export async function generateOnboardingPlan(input: OnboardingInput): Promise<OnboardingResult> {
  const aiConfig = loadAIConfig();
  
  if (!aiConfig.enabled || !aiConfig.apiKey || aiConfig.provider === 'local') {
    return {
      success: false,
      error: 'AI not configured. Please set up AI in Settings first.',
    };
  }

  const prompt = buildOnboardingPrompt(input);
  
  try {
    let response;
    switch (aiConfig.provider) {
      case 'gemini':
        response = await callGeminiOnboarding(prompt, aiConfig.apiKey);
        break;
      case 'openai':
        response = await callOpenAIOnboarding(prompt, aiConfig.apiKey);
        break;
      case 'claude':
        response = await callClaudeOnboarding(prompt, aiConfig.apiKey);
        break;
      default:
        return { success: false, error: 'Unknown AI provider' };
    }
    
    return parseOnboardingResponse(response);
  } catch (error) {
    console.error('AI onboarding failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function buildOnboardingPrompt(input: OnboardingInput): string {
  return `You are a helpful Life OS assistant setting up a new user's habit tracking system.

**User Profile:**
- Main Goals: ${input.goals}
- Experience Level: ${input.experience}
- Available Time: ${input.availableTime}

**Task:** Create a personalized habit plan with 5-8 habits to help them achieve their goals.

**Requirements:**
1. Mix of easy wins (XP: 5) and impactful habits (XP: 10-15)
2. Consider their time constraints
3. Start small for beginners, be ambitious for advanced users
4. Include variety: health, productivity, learning
5. Suggest realistic frequency (daily, weekdays, specific days)

**Output Format (JSON):**
{
  "welcomeMessage": "Brief personalized welcome (2-3 sentences)",
  "habits": [
    {
      "title": "Habit name (concise, actionable)",
      "frequency": [0,1,2,3,4,5,6],  // 0=Sunday, 6=Saturday, use [1,2,3,4,5] for weekdays
      "xpReward": 5 or 10 or 15,
      "category": "health" | "productivity" | "learning" | "social" | "other",
      "reason": "1 sentence why this helps their goals"
    }
  ]
}

Generate the JSON now:`;
}

async function callGeminiOnboarding(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) throw new Error('Gemini API failed');
  
  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function callOpenAIOnboarding(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error('OpenAI API failed');
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callClaudeOnboarding(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Claude API failed');
  
  const data = await response.json();
  return data.content[0]?.text || '';
}

function parseOnboardingResponse(response: string): OnboardingResult {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                      response.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[1]);
    
    return {
      success: true,
      habits: parsed.habits,
      welcomeMessage: parsed.welcomeMessage,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      success: false,
      error: 'Failed to parse AI recommendations',
    };
  }
}
