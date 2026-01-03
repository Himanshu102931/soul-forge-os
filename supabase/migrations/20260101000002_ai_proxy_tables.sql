-- AI Configuration: Server-side encrypted API key storage
-- This migration adds tables for secure AI API key management

-- User AI configuration table (stores encrypted keys)
CREATE TABLE IF NOT EXISTS user_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'claude')),
  encrypted_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, provider)
);

-- AI usage logging for cost tracking and rate limiting
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  request_type TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for rate limit queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_time ON ai_usage_log (user_id, created_at DESC);

-- RLS Policies: Users can only access their own AI config
ALTER TABLE user_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- User can read/write their own AI config
CREATE POLICY "Users can view own AI config"
  ON user_ai_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI config"
  ON user_ai_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI config"
  ON user_ai_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI config"
  ON user_ai_config FOR DELETE
  USING (auth.uid() = user_id);

-- User can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON ai_usage_log FOR SELECT
  USING (auth.uid() = user_id);

-- Only Edge Functions can insert usage logs (via service_role key)
CREATE POLICY "Service role can insert usage logs"
  ON ai_usage_log FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger for user_ai_config
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_ai_config_updated_at
  BEFORE UPDATE ON user_ai_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_ai_config IS 'Stores encrypted AI API keys server-side (never exposed to client)';
COMMENT ON COLUMN user_ai_config.encrypted_key IS 'AES-GCM encrypted API key using user_id as salt';
COMMENT ON TABLE ai_usage_log IS 'Tracks AI API usage for cost monitoring and rate limiting';
