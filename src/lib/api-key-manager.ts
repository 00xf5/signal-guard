import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ApiKeyData {
  id: string;
  api_key: string;
  email?: string;
  ip_address?: string;
  created_at: string;
  last_used?: string;
  usage_count: number;
  is_active: boolean;
  rate_limit_used: number;
  monthly_usage: number;
  remaining_daily: number;
  remaining_monthly: number;
  requests_today: number;
  requests_this_month: number;
}

export interface UsageStats {
  total_requests: number;
  requests_today: number;
  requests_this_month: number;
  rate_limit_remaining: number;
  daily_limit: number;
  monthly_limit: number;
}

export interface CreateKeyRequest {
  email?: string;
  ipAddress?: string;
}

export interface RateLimitResponse {
  allowed: boolean;
  error?: string;
  remaining_daily?: number;
  remaining_monthly?: number;
  key_id?: string;
}

class ApiKeyManager {
  private static instance: ApiKeyManager;

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  /**
   * Generate a secure API key
   */
  generateApiKey(): string {
    const prefix = 'sg_';
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return prefix + randomBytes;
  }

  /**
   * Get client IP address
   */
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      return 'unknown';
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(request: CreateKeyRequest): Promise<ApiKeyData> {
    const apiKey = this.generateApiKey();
    const ipAddress = request.ipAddress || await this.getClientIP();

    const { data, error } = await supabase
      .from('free_api_keys')
      .insert({
        api_key: apiKey,
        email: request.email || null,
        ip_address: ipAddress,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    return this.transformApiKeyData(data);
  }

  /**
   * Get API key by key value
   */
  async getApiKey(key: string): Promise<ApiKeyData | null> {
    const { data, error } = await supabase
      .from('api_key_stats')
      .select('*')
      .eq('api_key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get API key: ${error.message}`);
    }

    return this.transformApiKeyData(data);
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(id: string): Promise<ApiKeyData | null> {
    const { data, error } = await supabase
      .from('api_key_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get API key: ${error.message}`);
    }

    return this.transformApiKeyData(data);
  }

  /**
   * Invalidate all keys for a user and create a new one
   */
  async regenerateApiKey(email: string, ipAddress?: string): Promise<ApiKeyData> {
    // First invalidate existing keys
    const { error: invalidateError } = await supabase.rpc('invalidate_user_keys', {
      p_email: email
    });

    if (invalidateError) {
      throw new Error(`Failed to invalidate old keys: ${invalidateError.message}`);
    }

    // Create new key
    return this.createApiKey({ email, ipAddress });
  }

  /**
   * Deactivate an API key
   */
  async deactivateApiKey(keyId: string): Promise<void> {
    const { error } = await supabase
      .from('free_api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) {
      throw new Error(`Failed to deactivate API key: ${error.message}`);
    }
  }

  /**
   * Check rate limits for an API key
   */
  async checkRateLimit(apiKey: string, endpoint: string, ipAddress?: string): Promise<RateLimitResponse> {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_api_key: apiKey,
      p_endpoint: endpoint,
      p_ip_address: ipAddress
    });

    if (error) {
      throw new Error(`Failed to check rate limit: ${error.message}`);
    }

    return data as RateLimitResponse;
  }

  /**
   * Log API usage
   */
  async logUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    responseStatus: number,
    responseTime?: number,
    requestSize?: number,
    responseSize?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const { error } = await supabase.rpc('log_api_usage', {
      p_api_key_id: apiKeyId,
      p_endpoint: endpoint,
      p_method: method,
      p_response_status: responseStatus,
      p_response_time_ms: responseTime,
      p_request_size_bytes: requestSize,
      p_response_size_bytes: responseSize,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    });

    if (error) {
      console.error('Failed to log usage:', error);
    }
  }

  /**
   * Get usage statistics for an API key
   */
  async getUsageStats(apiKey: string): Promise<UsageStats> {
    const keyData = await this.getApiKey(apiKey);
    
    if (!keyData) {
      throw new Error('API key not found');
    }

    return {
      total_requests: keyData.usage_count,
      requests_today: keyData.requests_today,
      requests_this_month: keyData.requests_this_month,
      rate_limit_remaining: Math.min(keyData.remaining_daily, keyData.remaining_monthly),
      daily_limit: 100,
      monthly_limit: 1000
    };
  }

  /**
   * Get all API keys for a user (by email)
   */
  async getUserApiKeys(email: string): Promise<ApiKeyData[]> {
    const { data, error } = await supabase
      .from('api_key_stats')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user API keys: ${error.message}`);
    }

    return data.map(this.transformApiKeyData);
  }

  /**
   * Validate API key format
   */
  validateApiKeyFormat(key: string): boolean {
    // Pattern: sg_ followed by 48 hex characters (24 bytes)
    const pattern = /^sg_[a-f0-9]{48}$/;
    return pattern.test(key);
  }

  /**
   * Transform database data to ApiKeyData format
   */
  private transformApiKeyData(data: any): ApiKeyData {
    return {
      id: data.id,
      api_key: data.api_key,
      email: data.email,
      ip_address: data.ip_address,
      created_at: data.created_at,
      last_used: data.last_used,
      usage_count: data.usage_count || 0,
      is_active: data.is_active,
      rate_limit_used: data.rate_limit_used || 0,
      monthly_usage: data.monthly_usage || 0,
      remaining_daily: data.remaining_daily || 100,
      remaining_monthly: data.remaining_monthly || 1000,
      requests_today: data.requests_today || 0,
      requests_this_month: data.requests_this_month || 0
    };
  }

  /**
   * Store API key in local storage
   */
  storeApiKeyLocally(keyData: ApiKeyData): void {
    try {
      localStorage.setItem('signal_guard_api_key', JSON.stringify(keyData));
    } catch (error) {
      console.error('Failed to store API key locally:', error);
    }
  }

  /**
   * Get API key from local storage
   */
  getStoredApiKey(): ApiKeyData | null {
    try {
      const stored = localStorage.getItem('signal_guard_api_key');
      if (!stored) return null;
      
      const keyData = JSON.parse(stored);
      return this.validateApiKeyFormat(keyData.api_key) ? keyData : null;
    } catch (error) {
      console.error('Failed to retrieve stored API key:', error);
      localStorage.removeItem('signal_guard_api_key');
      return null;
    }
  }

  /**
   * Clear stored API key
   */
  clearStoredApiKey(): void {
    localStorage.removeItem('signal_guard_api_key');
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();
