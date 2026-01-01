import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { habitsCompleted, habitsTotal, steps, sleep, date } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const habitPercentage = habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;
    const stepsTarget = 10000;
    const sleepTarget = 7;

    const systemPrompt = `You are a brutally honest drill sergeant reviewing someone's daily performance. 
You are harsh but fair. Your job is to roast them if they underperformed and grudgingly acknowledge if they did well.
Keep your response to 2-3 sentences max. Be creative and funny but pointed.
Use military jargon occasionally. Don't be cruel, just tough love.`;

    const userPrompt = `Here's today's performance for ${date}:
- Habits: ${habitsCompleted}/${habitsTotal} completed (${habitPercentage}%)
- Steps: ${steps?.toLocaleString() || 'Not tracked'} (target: ${stepsTarget.toLocaleString()})
- Sleep: ${sleep ? `${sleep.toFixed(1)} hours` : 'Not tracked'} (target: ${sleepTarget} hours)

Give me your honest assessment, drill sergeant.`;

    console.log("Calling Lovable AI for drill sergeant roast...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const roast = data.choices?.[0]?.message?.content || "Couldn't generate a response, soldier.";

    console.log("Drill sergeant roast generated successfully");

    return new Response(JSON.stringify({ roast }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in drill-sergeant function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
