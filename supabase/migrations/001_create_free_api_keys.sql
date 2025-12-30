-- Create free_api_keys table
CREATE TABLE IF NOT EXISTS free_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  rate_limit_used INTEGER DEFAULT 0 NOT NULL,
  rate_limit_reset TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day') NOT NULL,
  monthly_usage INTEGER DEFAULT 0 NOT NULL,
  monthly_reset TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW() + INTERVAL '1 month')) NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
  CONSTRAINT positive_usage CHECK (usage_count >= 0),
  CONSTRAINT positive_rate_limit CHECK (rate_limit_used >= 0),
  CONSTRAINT positive_monthly_usage CHECK (monthly_usage >= 0)
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES free_api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (response_status >= 100 AND response_status < 600),
  CONSTRAINT positive_response_time CHECK (response_time_ms IS NULL OR response_time_ms >= 0),
  CONSTRAINT positive_request_size CHECK (request_size_bytes IS NULL OR request_size_bytes >= 0),
  CONSTRAINT positive_response_size CHECK (response_size_bytes IS NULL OR response_size_bytes >= 0)
);

-- Create email_alerts table for tracking sent alerts
CREATE TABLE IF NOT EXISTS email_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES free_api_keys(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'usage_warning', 'key_expiring', 'rate_limit'
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  message TEXT NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('usage_warning', 'key_expiring', 'rate_limit', 'monthly_limit'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_free_api_keys_key ON free_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_free_api_keys_email ON free_api_keys(email);
CREATE INDEX IF NOT EXISTS idx_free_api_keys_active ON free_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_free_api_keys_created ON free_api_keys(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_api_key ON usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_endpoint ON usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_email_alerts_api_key ON email_alerts(api_key_id);
CREATE INDEX IF NOT EXISTS idx_email_alerts_type ON email_alerts(alert_type);

-- Create Row Level Security (RLS) policies
ALTER TABLE free_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own API keys (based on email)
CREATE POLICY "Users can view own API keys" ON free_api_keys
  FOR SELECT USING (email = auth.email());

CREATE POLICY "Users can insert own API keys" ON free_api_keys
  FOR INSERT WITH CHECK (email = auth.email());

CREATE POLICY "Users can update own API keys" ON free_api_keys
  FOR UPDATE USING (email = auth.email());

-- Policy: Users can only access their own usage logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM free_api_keys 
      WHERE free_api_keys.id = usage_logs.api_key_id 
      AND free_api_keys.email = auth.email()
    )
  );

-- Policy: Service role can insert usage logs (for API middleware)
CREATE POLICY "Service can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can view their own email alerts
CREATE POLICY "Users can view own email alerts" ON email_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM free_api_keys 
      WHERE free_api_keys.id = email_alerts.api_key_id 
      AND free_api_keys.email = auth.email()
    )
  );

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_api_key VARCHAR(64),
  p_endpoint VARCHAR(255),
  p_ip_address INET DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  key_record free_api_keys%ROWTYPE;
  remaining_limit INTEGER;
  is_allowed BOOLEAN;
BEGIN
  -- Get the API key record
  SELECT * INTO key_record 
  FROM free_api_keys 
  WHERE api_key = p_api_key AND is_active = true;
  
  -- Check if key exists and is active
  IF NOT FOUND THEN
    RETURN json_build_object('allowed', false, 'error', 'Invalid or inactive API key');
  END IF;
  
  -- Check if rate limit needs reset (daily)
  IF NOW() >= key_record.rate_limit_reset THEN
    UPDATE free_api_keys 
    SET rate_limit_used = 0, 
        rate_limit_reset = NOW() + INTERVAL '1 day'
    WHERE id = key_record.id;
    key_record.rate_limit_used = 0;
  END IF;
  
  -- Check if monthly limit needs reset
  IF NOW() >= key_record.monthly_reset THEN
    UPDATE free_api_keys 
    SET monthly_usage = 0, 
        monthly_reset = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
    WHERE id = key_record.id;
    key_record.monthly_usage = 0;
  END IF;
  
  -- Check rate limits (100 per day, 1000 per month for free tier)
  IF key_record.rate_limit_used >= 100 THEN
    RETURN json_build_object('allowed', false, 'error', 'Daily rate limit exceeded');
  END IF;
  
  IF key_record.monthly_usage >= 1000 THEN
    RETURN json_build_object('allowed', false, 'error', 'Monthly rate limit exceeded');
  END IF;
  
  -- Update usage counters
  UPDATE free_api_keys 
  SET 
    usage_count = usage_count + 1,
    last_used = NOW(),
    rate_limit_used = rate_limit_used + 1,
    monthly_usage = monthly_usage + 1,
    ip_address = COALESCE(p_ip_address, ip_address)
  WHERE id = key_record.id;
  
  -- Calculate remaining limits
  remaining_limit := LEAST(
    100 - key_record.rate_limit_used - 1,
    1000 - key_record.monthly_usage - 1
  );
  
  RETURN json_build_object(
    'allowed', true,
    'remaining_daily', 100 - key_record.rate_limit_used - 1,
    'remaining_monthly', 1000 - key_record.monthly_usage - 1,
    'key_id', key_record.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_api_key_id UUID,
  p_endpoint VARCHAR(255),
  p_method VARCHAR(10),
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_response_status INTEGER,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_request_size_bytes INTEGER DEFAULT NULL,
  p_response_size_bytes INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_logs (
    api_key_id,
    endpoint,
    method,
    ip_address,
    user_agent,
    response_status,
    response_time_ms,
    request_size_bytes,
    response_size_bytes
  ) VALUES (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_ip_address,
    p_user_agent,
    p_response_status,
    p_response_time_ms,
    p_request_size_bytes,
    p_response_size_bytes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invalidate old keys when generating new ones
CREATE OR REPLACE FUNCTION invalidate_user_keys(
  p_email VARCHAR(255)
) RETURNS INTEGER AS $$
DECLARE
  invalidated_count INTEGER;
BEGIN
  UPDATE free_api_keys 
  SET is_active = false 
  WHERE email = p_email AND is_active = true;
  
  GET DIAGNOSTICS invalidated_count = ROW_COUNT;
  RETURN invalidated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for API key statistics
CREATE OR REPLACE VIEW api_key_stats AS
SELECT 
  fak.id,
  fak.api_key,
  fak.email,
  fak.created_at,
  fak.last_used,
  fak.usage_count,
  fak.is_active,
  fak.rate_limit_used,
  fak.monthly_usage,
  fak.rate_limit_reset,
  fak.monthly_reset,
  -- Calculate remaining limits
  (100 - fak.rate_limit_used) as remaining_daily,
  (1000 - fak.monthly_usage) as remaining_monthly,
  -- Get today's usage
  (SELECT COUNT(*) FROM usage_logs ul 
   WHERE ul.api_key_id = fak.id 
   AND DATE(ul.created_at) = CURRENT_DATE) as requests_today,
  -- Get this month's usage (should match monthly_usage but for verification)
  (SELECT COUNT(*) FROM usage_logs ul 
   WHERE ul.api_key_id = fak.id 
   AND DATE_TRUNC('month', ul.created_at) = DATE_TRUNC('month', CURRENT_DATE)) as requests_this_month
FROM free_api_keys fak;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON free_api_keys TO authenticated;
GRANT SELECT ON usage_logs TO authenticated;
GRANT SELECT ON email_alerts TO authenticated;
GRANT SELECT ON api_key_stats TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION log_api_usage TO service_role;
GRANT EXECUTE ON FUNCTION invalidate_user_keys TO authenticated;
