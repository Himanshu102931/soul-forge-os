/**
 * Settings - AI Integration Section
 * Configure AI provider and API key (server-side storage)
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Zap, Eye, EyeOff, Save, Trash2, Shield } from 'lucide-react';
import { AIConfig } from '@/lib/ai-config-db';

interface AIConfigSectionProps {
  aiConfig: AIConfig | null;
  apiKey: string;
  showApiKey: boolean;
  testingConnection: boolean;
  onConfigChange: (config: AIConfig) => void;
  onApiKeyChange: (key: string) => void;
  onToggleShowApiKey: () => void;
  onTestConnection: () => void;
  onSaveConfig: () => void;
  onClearConfig: () => void;
}

export function AIConfigSection({
  aiConfig,
  apiKey,
  showApiKey,
  testingConnection,
  onConfigChange,
  onApiKeyChange,
  onToggleShowApiKey,
  onTestConnection,
  onSaveConfig,
  onClearConfig,
}: AIConfigSectionProps): JSX.Element {
  return (
    <div className="space-y-4">
      {/* AI Info Banner */}
      <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 mt-0.5 text-green-500" />
          <p className="text-xs text-muted-foreground">
            🔒 <strong>Server-side encryption:</strong> Your API keys are encrypted and stored securely in the database using AES-GCM-256. Keys are never exposed to the client or stored in localStorage.
          </p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">AI Provider</label>
        <select
          value={aiConfig?.provider || 'gemini'}
          onChange={(e) => onConfigChange({ 
            provider: e.target.value as 'gemini' | 'openai' | 'claude',
            enabled: aiConfig?.enabled ?? true 
          })}
          className="w-full px-3 py-2 text-sm rounded-lg border bg-background"
        >
          <option value="gemini">Google Gemini Pro (~$0.0005/review)</option>
          <option value="openai">OpenAI GPT-3.5 (~$0.0015/review)</option>
          <option value="claude">Anthropic Claude (~$0.008/review)</option>
        </select>
      </div>

      {/* API Key Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">API Key</label>
        <div className="flex gap-2">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={aiConfig ? 'Key configured (enter new to update)' : 'Enter your API key'}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleShowApiKey}
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get your key from: {
            (aiConfig?.provider || 'gemini') === 'gemini' ? 'ai.google.dev' :
            (aiConfig?.provider || 'gemini') === 'openai' ? 'platform.openai.com' :
            'console.anthropic.com'
          }
        </p>
      </div>

      {/* Test Connection */}
      <Button
        onClick={onTestConnection}
        disabled={testingConnection || !apiKey}
        variant="outline"
        className="w-full"
      >
        {testingConnection ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Test Connection
          </>
        )}
      </Button>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div>
          <p className="text-sm font-medium">Enable AI Features</p>
          <p className="text-xs text-muted-foreground">
            Use AI for drill sergeant roasts and insights
          </p>
        </div>
        <input
          type="checkbox"
          checked={aiConfig?.enabled ?? true}
          onChange={(e) => onConfigChange({ 
            provider: aiConfig?.provider || 'gemini',
            enabled: e.target.checked 
          })}
          className="w-4 h-4"
        />
      </div>

      {/* Save Button */}
      <Button
        onClick={onSaveConfig}
        disabled={!apiKey}
        className="w-full"
      >
        <Save className="w-4 h-4 mr-2" />
        Save AI Configuration
      </Button>

      {/* Clear Config */}
      {aiConfig && (
        <Button
          onClick={onClearConfig}
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear AI Configuration
        </Button>
      )}

      {/* Cost Warning */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          💡 Cost estimates are approximate. Review {aiConfig?.provider || 'your provider'}'s pricing for accurate rates. Each nightly review uses ~500-1000 tokens.
        </p>
      </div>
    </div>
  );
}
