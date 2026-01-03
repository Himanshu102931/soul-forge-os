// Server-side AI configuration management
// Stores encrypted API keys in Supabase database (never in localStorage)
import { supabase } from '@/integrations/supabase/client';

export interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude';
  enabled: boolean;
}

// Server-side encryption using user's ID as salt
async function encryptAPIKey(apiKey: string, userId: string): Promise<string> {
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
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(apiKey);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Save AI configuration to Supabase (server-side storage)
export async function saveAIConfigToDatabase(
  provider: 'gemini' | 'openai' | 'claude',
  apiKey: string,
  enabled: boolean
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const encryptedKey = await encryptAPIKey(apiKey, user.id);

  // Type assertion needed until database types are regenerated
  interface UserAIConfig {
    user_id: string;
    provider: string;
    encrypted_key: string;
    enabled: boolean;
  }
  
  const { error } = await (supabase as any)
    .from('user_ai_config')
    .upsert({
      user_id: user.id,
      provider,
      encrypted_key: encryptedKey,
      enabled,
    } as UserAIConfig, {
      onConflict: 'user_id,provider'
    });

  if (error) throw error;
}

// Load AI configuration from Supabase
export async function loadAIConfigFromDatabase(): Promise<AIConfig | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  interface ConfigData {
    provider: string;
    enabled: boolean;
  }

  // Type assertion needed until database types are regenerated
  const { data, error } = await (supabase as any)
    .from('user_ai_config')
    .select('provider, enabled')
    .eq('user_id', user.id)
    .eq('enabled', true)
    .single() as Promise<{ data: ConfigData | null; error: any }>;

  if (error || !data) return null;

  return {
    provider: data.provider as 'gemini' | 'openai' | 'claude',
    enabled: data.enabled,
  };
}

// Delete AI configuration from Supabase
export async function deleteAIConfigFromDatabase(
  provider: 'gemini' | 'openai' | 'claude'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Type assertion needed until database types are regenerated
  const { error } = await (supabase as any)
    .from('user_ai_config')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider) as Promise<{ error: any }>;

  if (error) throw error;
}

// Get all configured AI providers for user
export async function getConfiguredAIProviders(): Promise<AIConfig[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  interface ConfigData {
    provider: string;
    enabled: boolean;
  }

  // Type assertion needed until database types are regenerated
  const { data, error } = await (supabase as any)
    .from('user_ai_config')
    .select('provider, enabled')
    .eq('user_id', user.id) as Promise<{ data: ConfigData[] | null; error: any }>;

  if (error || !data) return [];

  return data.map((d: ConfigData) => ({
    provider: d.provider as 'gemini' | 'openai' | 'claude',
    enabled: d.enabled,
  }));
}
