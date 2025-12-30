import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  avatar_url?: string;
  timezone?: string;
  language?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  nowpayments_customer_id?: string;
  nowpayments_subscription_id?: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyEnhanced {
  id: string;
  user_id: string;
  api_key: string;
  name: string;
  description?: string;
  tier: 'free' | 'pro' | 'enterprise';
  daily_limit: number;
  monthly_limit: number;
  requests_today: number;
  requests_this_month: number;
  last_reset: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used?: string;
  usage_count: number;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: User | null;
  session: UserSession | null;
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private currentSession: UserSession | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Hash password for storage
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password against hash
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure session token
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Register new user
  async signUp(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    try {
      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email.toLowerCase(),
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          company: userData.company,
          phone: userData.phone,
        })
        .select()
        .single();

      if (userError) {
        return {
          user: null,
          session: null,
          error: userError.message
        };
      }

      // Create free subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: 'free',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

      if (subError) {
        console.error('Failed to create subscription:', subError);
      }

      // Create session
      const session = await this.createSession(user.id);

      // Log audit
      await this.logAudit(user.id, 'user_registered', 'user', user.id, {
        email: userData.email
      });

      this.currentUser = user;
      this.currentSession = session;

      return {
        user,
        session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  // Login user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        return {
          user: null,
          session: null,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return {
          user: null,
          session: null,
          error: 'Invalid email or password'
        };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Create session
      const session = await this.createSession(user.id);

      // Log audit
      await this.logAudit(user.id, 'user_login', 'user', user.id, {
        email: email
      });

      this.currentUser = user;
      this.currentSession = session;

      return {
        user,
        session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  // Create user session
  private async createSession(userId: string): Promise<UserSession | null> {
    try {
      const sessionToken = this.generateSessionToken();
      const refreshToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data: session, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          refresh_token: refreshToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      // Store in localStorage
      localStorage.setItem('risksignal_session', JSON.stringify({
        sessionToken: session.session_token,
        refreshToken: session.refresh_token,
        expiresAt: expiresAt.toISOString()
      }));

      return session;
    } catch (error) {
      console.error('Session creation error:', error);
      return null;
    }
  }

  // Logout user
  async signOut(): Promise<void> {
    try {
      if (this.currentSession) {
        // Deactivate session in database
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('session_token', this.currentSession.session_token);

        // Log audit
        if (this.currentUser) {
          await this.logAudit(this.currentUser.id, 'user_logout', 'user', this.currentUser.id);
        }
      }

      // Clear local storage
      localStorage.removeItem('risksignal_session');

      this.currentUser = null;
      this.currentSession = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get current user from session
  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      // Check localStorage for session
      const sessionData = localStorage.getItem('risksignal_session');
      if (!sessionData) {
        return null;
      }

      const { sessionToken, expiresAt } = JSON.parse(sessionData);

      // Check if session is expired
      if (new Date() > new Date(expiresAt)) {
        localStorage.removeItem('risksignal_session');
        return null;
      }

      // Get session from database
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users: user_id (
            id,
            email,
            first_name,
            last_name,
            company,
            phone,
            avatar_url,
            timezone,
            language,
            is_active,
            email_verified,
            last_login,
            created_at,
            updated_at
          )
        `)
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .eq('users.is_active', true)
        .single();

      if (sessionError || !session || !session.users) {
        localStorage.removeItem('risksignal_session');
        return null;
      }

      // Update last accessed
      await supabase
        .from('user_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', session.id);

      this.currentUser = session.users;
      this.currentSession = session;

      return session.users;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get user subscription
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Failed to get subscription:', error);
        return null;
      }

      return subscription;
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  // Log audit events
  private async logAudit(
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Get client IP address
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  // Get current user
  getUser(): User | null {
    return this.currentUser;
  }

  // Get current session
  getSession(): UserSession | null {
    return this.currentSession;
  }

  // Initialize auth on app load
  async initializeAuth(): Promise<void> {
    await this.getCurrentUser();
  }
}

export const authService = AuthService.getInstance();
export default authService;
