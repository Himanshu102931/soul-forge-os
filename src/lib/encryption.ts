// Simple encryption for API keys in localStorage
// Note: This is basic obfuscation. For production, consider more robust solutions.

const ENCRYPTION_KEY = 'life-os-ai-key-v1';

export function encryptAPIKey(apiKey: string): string {
  try {
    // Simple XOR-based encryption (good enough for client-side storage)
    const key = ENCRYPTION_KEY;
    let encrypted = '';
    
    for (let i = 0; i < apiKey.length; i++) {
      const charCode = apiKey.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    return btoa(encrypted); // Base64 encode
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

export function decryptAPIKey(encryptedKey: string): string {
  try {
    const encrypted = atob(encryptedKey); // Base64 decode
    const key = ENCRYPTION_KEY;
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// AI Provider configuration
export interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'local';
  apiKey?: string;
  enabled: boolean;
}

const AI_CONFIG_KEY = 'life-os-ai-config';

export function saveAIConfig(config: AIConfig): void {
  try {
    const configToSave = {
      ...config,
      apiKey: config.apiKey ? encryptAPIKey(config.apiKey) : undefined,
    };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(configToSave));
  } catch (error) {
    console.error('Failed to save AI config:', error);
  }
}

export function loadAIConfig(): AIConfig {
  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (!saved) {
      return { provider: 'local', enabled: false };
    }
    
    const config = JSON.parse(saved);
    return {
      ...config,
      apiKey: config.apiKey ? decryptAPIKey(config.apiKey) : undefined,
    };
  } catch (error) {
    console.error('Failed to load AI config:', error);
    return { provider: 'local', enabled: false };
  }
}

export function clearAIConfig(): void {
  try {
    localStorage.removeItem(AI_CONFIG_KEY);
  } catch (error) {
    console.error('Failed to clear AI config:', error);
  }
}
