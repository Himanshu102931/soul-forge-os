// Secure encryption for sensitive data using Web Crypto API
// Note: Even with AES-GCM, client-side key storage has inherent risks.
// For production AI features, use a backend proxy (Supabase Edge Functions).

// Derive encryption key from user session (changes per user, not hardcoded)
async function deriveKey(salt: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(salt),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('life-os-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAPIKey(apiKey: string, userSalt: string): Promise<string> {
  try {
    const key = await deriveKey(userSalt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(apiKey);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt API key');
  }
}

export async function decryptAPIKey(encryptedKey: string, userSalt: string): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const key = await deriveKey(userSalt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key');
  }
}

// AI Provider configuration
export interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'local';
  apiKey?: string;
  enabled: boolean;
}

const AI_CONFIG_KEY = 'life-os-ai-config';

// Get user-specific salt from Supabase user ID (or generate if not authenticated)
function getUserSalt(): string {
  // In production, derive from user.id after auth
  // For now, use a session-based salt (cleared on logout)
  let salt = sessionStorage.getItem('life-os-salt');
  if (!salt) {
    salt = crypto.randomUUID();
    sessionStorage.setItem('life-os-salt', salt);
  }
  return salt;
}

export async function saveAIConfig(config: AIConfig): Promise<void> {
  try {
    const salt = getUserSalt();
    const configToSave = {
      ...config,
      apiKey: config.apiKey ? await encryptAPIKey(config.apiKey, salt) : undefined,
    };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.error('Failed to save AI config:', error);
    throw error;
  }
}

export async function loadAIConfig(): Promise<AIConfig> {
  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (!saved) {
      return { provider: 'local', enabled: false };
    }
    
    const config = JSON.parse(saved);
    const salt = getUserSalt();
    
    return {
      ...config,
      apiKey: config.apiKey ? await decryptAPIKey(config.apiKey, salt) : undefined,
    };
  } catch (error) {
    console.error('Failed to load AI config:', error);
    return { provider: 'local', enabled: false };
  }
}

export function clearAIConfig(): void {
  try {
    localStorage.removeItem(AI_CONFIG_KEY);
    sessionStorage.removeItem('life-os-salt');
  } catch (error) {
    console.error('Failed to clear AI config:', error);
  }
}
