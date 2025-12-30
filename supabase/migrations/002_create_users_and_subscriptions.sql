-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT positive_name_length CHECK (LENGTH(COALESCE(first_name, '')) >= 0),
  CONSTRAINT positive_company_length CHECK (LENGTH(COALESCE(company, '')) >= 0)
);

-- Create subscriptions table for tier management
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  nowpayments_customer_id VARCHAR(255),
  nowpayments_subscription_id VARCHAR(255),
  tier VARCHAR(50) DEFAULT 'free' NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month') NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one active subscription per user
  CONSTRAINT unique_active_subscription UNIQUE (user_id) WHERE status = 'active'
);

-- Enhanced API keys table with user relationship and tier limits
CREATE TABLE IF NOT EXISTS api_keys_enhanced (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  api_key VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tier VARCHAR(50) DEFAULT 'free' NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  daily_limit INTEGER DEFAULT 100 NOT NULL CHECK (daily_limit > 0),
  monthly_limit INTEGER DEFAULT 1000 NOT NULL CHECK (monthly_limit > 0),
  requests_today INTEGER DEFAULT 0 NOT NULL CHECK (requests_today >= 0),
  requests_this_month INTEGER DEFAULT 0 NOT NULL CHECK (requests_this_month >= 0),
  last_reset TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
  
  -- Constraints
  CONSTRAINT valid_key_format CHECK (api_key ~* '^sg_[a-f0-9]{48}$'),
  CONSTRAINT positive_limits CHECK (daily_limit > 0 AND monthly_limit > 0)
);

-- Create user sessions table for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Constraints
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

-- Create audit logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_action CHECK (LENGTH(action) > 0)
);

-- Create webhooks table for real-time alerts
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  secret_key VARCHAR(255) DEFAULT gen_random_uuid()::text NOT NULL,
  events TEXT[] DEFAULT '{}' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL CHECK (retry_count >= 0),
  last_triggered TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~* '^https?://.+'),
  CONSTRAINT valid_events CHECK (array_length(events, 1) >= 0)
);

-- Create bulk_analyses table for CSV processing
CREATE TABLE IF NOT EXISTS bulk_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  total_items INTEGER DEFAULT 0 NOT NULL CHECK (total_items >= 0),
  processed_items INTEGER DEFAULT 0 NOT NULL CHECK (processed_items >= 0),
  status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  results JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys_enhanced(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys_enhanced(api_key);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_analyses_user_id ON bulk_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_analyses_status ON bulk_analyses(status);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Subscription policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (user_id = auth.uid());

-- API key policies
CREATE POLICY "Users can view own API keys" ON api_keys_enhanced FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own API keys" ON api_keys_enhanced FOR ALL USING (user_id = auth.uid());

-- Session policies
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (user_id = auth.uid());

-- Audit log policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (user_id = auth.uid());

-- Webhook policies
CREATE POLICY "Users can manage own webhooks" ON webhooks FOR ALL USING (user_id = auth.uid());

-- Bulk analysis policies
CREATE POLICY "Users can manage own bulk analyses" ON bulk_analyses FOR ALL USING (user_id = auth.uid());

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys_enhanced FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bulk_analyses_updated_at BEFORE UPDATE ON bulk_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily usage counters
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE api_keys_enhanced 
    SET requests_today = 0, last_reset = NOW()
    WHERE DATE(last_reset) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE api_keys_enhanced 
    SET requests_this_month = 0
    WHERE DATE_TRUNC('month', last_reset) < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;
