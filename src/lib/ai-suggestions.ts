// AI-powered habit suggestions based on patterns
import { loadAIConfig } from './encryption';

export interface SuggestionContext {
  completedHabits: Array<{ title: string; frequency: number[]; completionRate: number }>;
  missedHabits: Array<{ title: string; frequency: number[]; completionRate: number }>;
  currentXP: number;
  totalHabits: number;
  weeklyAverage: number; // % completion rate
}

export interface HabitRecommendation {
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  suggestedXP: number;
  suggestedDays: number[];
}

export interface SuggestionResult {
  success: boolean;
  recommendations?: HabitRecommendation[];
  insights?: string;
  error?: string;
}

// Analyze user patterns and suggest new habits or improvements
export async function generateHabitSuggestions(context: SuggestionContext): Promise<SuggestionResult> {
  const aiConfig = loadAIConfig();
  
  if (!aiConfig.enabled || !aiConfig.apiKey || aiConfig.provider === 'local') {
    return generateLocalSuggestions(context);
  }

  const prompt = buildSuggestionPrompt(context);
  
  try {
    let response;
    switch (aiConfig.provider) {
      case 'gemini':
        response = await callGeminiSuggestions(prompt, aiConfig.apiKey);
        break;
      case 'openai':
        response = await callOpenAISuggestions(prompt, aiConfig.apiKey);
        break;
      case 'claude':
        response = await callClaudeSuggestions(prompt, aiConfig.apiKey);
        break;
      default:
        return generateLocalSuggestions(context);
    }
    
    return parseSuggestionResponse(response);
  } catch (error) {
    console.error('AI suggestions failed, using local:', error);
    return generateLocalSuggestions(context);
  }
}

function buildSuggestionPrompt(context: SuggestionContext): string {
  const habitList = context.completedHabits
    .concat(context.missedHabits)
    .map(h => `- ${h.title} (${Math.round(h.completionRate)}% completion)`)
    .join('\n');

  return `You are a Life OS habit coach analyzing a user's patterns to suggest improvements.

**Current Stats:**
- Total Habits: ${context.totalHabits}
- Weekly Completion: ${Math.round(context.weeklyAverage)}%
- Current XP: ${context.currentXP}

**Existing Habits:**
${habitList}

**Task:** Provide 3-5 actionable suggestions to help them level up their life.

**Guidelines:**
1. Identify gaps in their routine (health, productivity, learning, social)
2. Suggest "keystone habits" that enable other good behaviors
3. Consider habit stacking (pair new habit with existing one)
4. Be specific and actionable
5. Prioritize high-impact, easy-to-start habits

**Output Format (JSON):**
{
  "insights": "2-3 sentence analysis of their current patterns",
  "recommendations": [
    {
      "title": "Specific habit title",
      "reason": "Why this would help them (reference their patterns)",
      "priority": "high" | "medium" | "low",
      "category": "health" | "productivity" | "learning" | "social" | "other",
      "suggestedXP": 5 or 10 or 15,
      "suggestedDays": [0,1,2,3,4,5,6]
    }
  ]
}

Generate the JSON now:`;
}

async function callGeminiSuggestions(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        },
      }),
    }
  );

  if (!response.ok) throw new Error('Gemini API failed');
  
  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || '';
}

async function callOpenAISuggestions(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error('OpenAI API failed');
  
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callClaudeSuggestions(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Claude API failed');
  
  const data = await response.json();
  return data.content[0]?.text || '';
}

function parseSuggestionResponse(response: string): SuggestionResult {
  try {
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                      response.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[1]);
    
    return {
      success: true,
      recommendations: parsed.recommendations,
      insights: parsed.insights,
    };
  } catch (error) {
    console.error('Failed to parse suggestions:', error);
    return {
      success: false,
      error: 'Failed to parse AI response',
    };
  }
}

// Fallback suggestions when AI is not available
function generateLocalSuggestions(context: SuggestionContext): SuggestionResult {
  const suggestions: HabitRecommendation[] = [];
  
  // Check for common gaps
  const hasHealthHabit = context.completedHabits.some(h => 
    h.title.toLowerCase().includes('exercise') || 
    h.title.toLowerCase().includes('workout') ||
    h.title.toLowerCase().includes('walk')
  );
  
  const hasSleepHabit = context.completedHabits.some(h =>
    h.title.toLowerCase().includes('sleep') ||
    h.title.toLowerCase().includes('bed')
  );
  
  const hasLearningHabit = context.completedHabits.some(h =>
    h.title.toLowerCase().includes('read') ||
    h.title.toLowerCase().includes('learn') ||
    h.title.toLowerCase().includes('study')
  );
  
  if (!hasHealthHabit) {
    suggestions.push({
      title: 'Morning Walk (15 min)',
      reason: 'Physical activity boosts energy and mood for the whole day',
      priority: 'high',
      category: 'health',
      suggestedXP: 10,
      suggestedDays: [1, 2, 3, 4, 5], // Weekdays
    });
  }
  
  if (!hasSleepHabit) {
    suggestions.push({
      title: 'Sleep by 11 PM',
      reason: 'Consistent sleep schedule improves recovery and focus',
      priority: 'high',
      category: 'health',
      suggestedXP: 15,
      suggestedDays: [0, 1, 2, 3, 4, 5, 6], // Daily
    });
  }
  
  if (!hasLearningHabit) {
    suggestions.push({
      title: 'Read for 20 minutes',
      reason: 'Daily learning compounds into major growth over time',
      priority: 'medium',
      category: 'learning',
      suggestedXP: 10,
      suggestedDays: [0, 1, 2, 3, 4, 5, 6], // Daily
    });
  }
  
  // If completion rate is low, suggest easier habits
  if (context.weeklyAverage < 60) {
    suggestions.push({
      title: 'Drink Water First Thing',
      reason: 'Easy win to build momentum - start your day with a quick success',
      priority: 'high',
      category: 'health',
      suggestedXP: 5,
      suggestedDays: [0, 1, 2, 3, 4, 5, 6],
    });
  }
  
  return {
    success: true,
    recommendations: suggestions.slice(0, 4),
    insights: context.weeklyAverage > 75 
      ? "You're doing great! These suggestions can take you to the next level."
      : "Let's start with some easy wins to build momentum.",
  };
}
