// AI Proxy Edge Function - Server-side API key management
// This removes API keys from client storage entirely
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProxyRequest {
  provider: 'gemini' | 'openai' | 'claude';
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const { provider, prompt, model, maxTokens = 200, temperature = 0.9 } = 
      await req.json() as AIProxyRequest;

    // Fetch user's encrypted API key from database
    const { data: configData, error: configError } = await supabaseClient
      .from('user_ai_config')
      .select('encrypted_key, provider')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single();

    if (configError || !configData) {
      throw new Error(`No API key configured for ${provider}`);
    }

    // Decrypt API key (server-side only)
    const apiKey = await decryptAPIKey(configData.encrypted_key, user.id);

    // Call the appropriate AI provider
    let result;
    switch (provider) {
      case 'gemini':
        result = await callGeminiAPI(prompt, apiKey, maxTokens, temperature);
        break;
      case 'openai':
        result = await callOpenAIAPI(prompt, apiKey, model || 'gpt-3.5-turbo', maxTokens, temperature);
        break;
      case 'claude':
        result = await callClaudeAPI(prompt, apiKey, model || 'claude-3-sonnet-20240229', maxTokens, temperature);
        break;
      default:
        throw new Error('Unsupported AI provider');
    }

    // Record usage in database
    await supabaseClient.from('ai_usage_log').insert({
      user_id: user.id,
      provider,
      tokens_used: result.tokensUsed,
      cost: result.cost,
      request_type: 'completion',
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Server-side decryption using user's ID as salt
async function decryptAPIKey(encryptedKey: string, userId: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userId),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('soul-forge-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Gemini API
async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  maxTokens: number,
  temperature: number
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API failed');
  }

  const data = await response.json();
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    tokensUsed: data.usageMetadata?.totalTokenCount || 0,
    cost: ((data.usageMetadata?.totalTokenCount || 0) / 1000) * 0.0005,
    provider: 'Gemini',
  };
}

// OpenAI API
async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  model: string,
  maxTokens: number,
  temperature: number
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API failed');
  }

  const data = await response.json();
  const costPerToken = model.includes('gpt-4') ? 0.03 : 0.0015;
  
  return {
    text: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
    cost: ((data.usage?.total_tokens || 0) / 1000) * costPerToken,
    provider: `OpenAI ${model}`,
  };
}

// Claude API
async function callClaudeAPI(
  prompt: string,
  apiKey: string,
  model: string,
  maxTokens: number,
  temperature: number
) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API failed');
  }

  const data = await response.json();
  const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  
  return {
    text: data.content?.[0]?.text || '',
    tokensUsed,
    cost: (tokensUsed / 1000) * 0.008,
    provider: `Claude ${model}`,
  };
}
