// Weekly AI Insights - Sunday performance summary
// Now uses server-side proxy for secure API key management
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyStats {
  totalHabitsCompleted: number;
  totalHabitsPossible: number;
  completionRate: number;
  xpGained: number;
  bestStreak: number;
  worstDay: string;
  bestDay: string;
  topHabits: Array<{ title: string; completionRate: number }>;
  strugglingHabits: Array<{ title: string; completionRate: number }>;
}

export interface WeeklyInsight {
  success: boolean;
  summary?: string;
  wins?: string[];
  improvements?: string[];
  nextWeekFocus?: string;
  motivationalMessage?: string;
  error?: string;
}

// Call AI proxy for weekly insights
async function callAIProxy(prompt: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: configData } = await supabase
    .from('user_ai_config')
    .select('provider')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .single();

  if (!configData) throw new Error('AI not configured');

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      provider: configData.provider,
      prompt,
      maxTokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI proxy failed');
  }

  const data = await response.json();
  return data.text;
}

// Generate weekly performance summary using AI
export async function generateWeeklyInsights(stats: WeeklyStats): Promise<WeeklyInsight> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return generateLocalInsights(stats);
  }

  const { data: configData } = await supabase
    .from('user_ai_config')
    .select('enabled')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .single();

  if (!configData) {
    return generateLocalInsights(stats);
  }

  const prompt = buildWeeklyPrompt(stats);
  
  try {
    const response = await callAIProxy(prompt);
    return parseInsightsResponse(response);
  } catch (error) {
    console.error('AI insights failed, using local:', error);
    return generateLocalInsights(stats);
  }
}

function buildWeeklyPrompt(stats: WeeklyStats): string {
  const topHabitsList = stats.topHabits
    .map(h => `- ${h.title} (${Math.round(h.completionRate)}% completion)`)
    .join('\n');
  
  const strugglingList = stats.strugglingHabits
    .map(h => `- ${h.title} (${Math.round(h.completionRate)}% completion)`)
    .join('\n');

  return `You are a supportive Life OS coach reviewing a user's weekly performance. Be encouraging but honest.

**This Week's Stats:**
- Completion Rate: ${Math.round(stats.completionRate)}%
- Habits Completed: ${stats.totalHabitsCompleted} / ${stats.totalHabitsPossible}
- XP Gained: ${stats.xpGained}
- Best Streak: ${stats.bestStreak} days
- Best Day: ${stats.bestDay}
- Worst Day: ${stats.worstDay}

**Top Performing Habits:**
${topHabitsList || 'None yet'}

**Struggling Habits:**
${strugglingList || 'None'}

**Task:** Create an encouraging weekly summary with actionable insights.

**Tone:**
- Celebrate wins (even small ones)
- Be constructive about struggles
- Provide 1-2 specific tips
- End with motivation for next week

**Output Format (JSON):**
{
  "summary": "2-3 sentence overview of the week",
  "wins": ["Win 1", "Win 2", "Win 3"],
  "improvements": ["Area 1 to work on", "Area 2 to work on"],
  "nextWeekFocus": "One specific thing to focus on next week",
  "motivationalMessage": "Encouraging 1-2 sentence closing"
}

Generate the JSON now:`;
}

function parseInsightsResponse(response: string): WeeklyInsight {
  try {
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                      response.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[1]);
    
    return {
      success: true,
      summary: parsed.summary,
      wins: parsed.wins,
      improvements: parsed.improvements,
      nextWeekFocus: parsed.nextWeekFocus,
      motivationalMessage: parsed.motivationalMessage,
    };
  } catch (error) {
    console.error('Failed to parse insights:', error);
    return {
      success: false,
      error: 'Failed to parse AI response',
    };
  }
}

// Fallback insights when AI is not available
function generateLocalInsights(stats: WeeklyStats): WeeklyInsight {
  const completionRate = Math.round(stats.completionRate);
  const wins: string[] = [];
  const improvements: string[] = [];
  
  // Generate wins
  if (completionRate >= 80) {
    wins.push('Outstanding week with ' + completionRate + '% completion!');
  } else if (completionRate >= 60) {
    wins.push('Solid performance with ' + completionRate + '% completion');
  } else {
    wins.push('Completed ' + stats.totalHabitsCompleted + ' habits this week');
  }
  
  if (stats.bestStreak >= 5) {
    wins.push('Amazing ' + stats.bestStreak + '-day streak!');
  } else if (stats.bestStreak >= 3) {
    wins.push('Built a ' + stats.bestStreak + '-day streak');
  }
  
  if (stats.topHabits.length > 0) {
    wins.push('Mastered ' + stats.topHabits[0].title + ' (' + Math.round(stats.topHabits[0].completionRate) + '%)');
  }
  
  // Generate improvements
  if (completionRate < 70) {
    improvements.push('Focus on consistency - even 1 habit daily builds momentum');
  }
  
  if (stats.strugglingHabits.length > 0) {
    improvements.push('Try habit stacking for: ' + stats.strugglingHabits[0].title);
  }
  
  if (stats.worstDay !== 'Unknown') {
    improvements.push(stats.worstDay + ' was tough - plan ahead for that day');
  }
  
  // Summary
  let summary = `You completed ${completionRate}% of your habits this week`;
  if (completionRate >= 80) {
    summary += ' - exceptional consistency! Keep this momentum going.';
  } else if (completionRate >= 60) {
    summary += ' - you\'re building solid routines. Small improvements will compound.';
  } else {
    summary += ' - every habit counts. Focus on one keystone habit to build momentum.';
  }
  
  // Next week focus
  let nextWeekFocus = 'Pick one habit to never miss';
  if (stats.strugglingHabits.length > 0) {
    nextWeekFocus = 'Focus on improving: ' + stats.strugglingHabits[0].title;
  }
  
  // Motivational message
  let motivationalMessage = 'Progress over perfection - you\'re building the life you want, one habit at a time! 🚀';
  if (completionRate >= 80) {
    motivationalMessage = 'You\'re crushing it! This discipline will transform your life. 💪';
  }
  
  return {
    success: true,
    summary,
    wins: wins.slice(0, 3),
    improvements: improvements.slice(0, 2),
    nextWeekFocus,
    motivationalMessage,
  };
}
