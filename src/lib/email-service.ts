import { supabase } from './api-key-manager';

export interface EmailAlert {
  id: string;
  api_key_id: string;
  alert_type: 'usage_warning' | 'key_expiring' | 'rate_limit' | 'monthly_limit';
  email: string;
  sent_at: string;
  message: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send usage warning email
   */
  async sendUsageWarning(email: string, usagePercent: number, apiKeyId: string): Promise<void> {
    const template = this.getUsageWarningTemplate(usagePercent);
    await this.sendEmail(email, template.subject, template.html, template.text);
    await this.logEmailAlert(apiKeyId, 'usage_warning', email, template.text);
  }

  /**
   * Send rate limit exceeded email
   */
  async sendRateLimitAlert(email: string, limitType: 'daily' | 'monthly', apiKeyId: string): Promise<void> {
    const template = this.getRateLimitTemplate(limitType);
    await this.sendEmail(email, template.subject, template.html, template.text);
    await this.logEmailAlert(apiKeyId, 'rate_limit', email, template.text);
  }

  /**
   * Send monthly limit warning
   */
  async sendMonthlyLimitWarning(email: string, remainingDays: number, apiKeyId: string): Promise<void> {
    const template = this.getMonthlyLimitWarningTemplate(remainingDays);
    await this.sendEmail(email, template.subject, template.html, template.text);
    await this.logEmailAlert(apiKeyId, 'monthly_limit', email, template.text);
  }

  /**
   * Send key regeneration notification
   */
  async sendKeyRegenerationNotification(email: string, newKeyLast4: string, apiKeyId: string): Promise<void> {
    const template = this.getKeyRegenerationTemplate(newKeyLast4);
    await this.sendEmail(email, template.subject, template.html, template.text);
    await this.logEmailAlert(apiKeyId, 'key_expiring', email, template.text);
  }

  /**
   * Send welcome email for new API key
   */
  async sendWelcomeEmail(email: string, apiKey: string, apiKeyId: string): Promise<void> {
    const template = this.getWelcomeTemplate(apiKey);
    await this.sendEmail(email, template.subject, template.html, template.text);
    await this.logEmailAlert(apiKeyId, 'usage_warning', email, template.text); // Using existing type
  }

  /**
   * Send email using Supabase Auth or external service
   */
  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      // For now, we'll use a simple approach with console.log
      // In production, you'd integrate with a real email service like:
      // - Supabase Auth emails
      // - SendGrid
      // - Resend
      // - AWS SES
      // - Postmark
      
      console.log('=== EMAIL SENT ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('HTML:', html);
      console.log('Text:', text);
      console.log('================');

      // Example integration with Resend (uncomment and configure):
      /*
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@signalguard.ai',
          to: [to],
          subject: subject,
          html: html,
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }
      */

      // Example integration with Supabase Edge Function:
      /*
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, text }
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      */
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Log email alert to database
   */
  private async logEmailAlert(
    apiKeyId: string,
    alertType: string,
    email: string,
    message: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_alerts')
        .insert({
          api_key_id: apiKeyId,
          alert_type: alertType,
          email: email,
          message: message,
        });

      if (error) {
        console.error('Failed to log email alert:', error);
      }
    } catch (error) {
      console.error('Failed to log email alert:', error);
    }
  }

  /**
   * Get email templates
   */
  private getUsageWarningTemplate(usagePercent: number): EmailTemplate {
    const subject = `Signal Guard API Usage Alert: ${usagePercent}% Used`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Signal Guard Usage Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Signal Guard API</h1>
            <p>Usage Alert</p>
          </div>
          <div class="content">
            <h2>⚠️ Usage Warning</h2>
            <p>Your Signal Guard API usage has reached <strong>${usagePercent}%</strong> of your monthly limit.</p>
            
            <div class="alert">
              <strong>Important:</strong> You have used ${usagePercent}% of your 1,000 free requests this month.
            </div>
            
            <p>What you can do:</p>
            <ul>
              <li>Monitor your usage in the dashboard</li>
              <li>Optimize your API calls</li>
              <li>Consider upgrading to a paid plan for higher limits</li>
            </ul>
            
            <a href="https://signalguard.ai/basic" class="button">View Dashboard</a>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Signal Guard. You received this because you signed up for API access.</p>
            <p>© 2024 Signal Guard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Signal Guard API Usage Alert

Your API usage has reached ${usagePercent}% of your monthly limit.

Important: You have used ${usagePercent}% of your 1,000 free requests this month.

What you can do:
- Monitor your usage in the dashboard
- Optimize your API calls  
- Consider upgrading to a paid plan for higher limits

View your dashboard: https://signalguard.ai/basic

If you have any questions, please contact our support team.

© 2024 Signal Guard. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getRateLimitTemplate(limitType: 'daily' | 'monthly'): EmailTemplate {
    const isDaily = limitType === 'daily';
    const subject = isDaily 
      ? 'Signal Guard API: Daily Rate Limit Exceeded'
      : 'Signal Guard API: Monthly Rate Limit Exceeded';

    const resetTime = isDaily ? 'tomorrow' : 'next month';
    const limit = isDaily ? '100' : '1,000';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rate Limit Exceeded</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .alert { background: #fee2e2; border: 1px solid #dc2626; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Signal Guard API</h1>
            <p>Rate Limit Exceeded</p>
          </div>
          <div class="content">
            <h2>🚫 Rate Limit Reached</h2>
            <p>Your Signal Guard API has reached the ${isDaily ? 'daily' : 'monthly'} rate limit of <strong>${limit}</strong> requests.</p>
            
            <div class="alert">
              <strong>Important:</strong> Your API requests will be rejected until the limit resets ${resetTime}.
            </div>
            
            <p><strong>When will it reset?</strong></p>
            <p>Your limit will reset ${resetTime} and you'll be able to make API requests again.</p>
            
            <p><strong>Need more requests?</strong></p>
            <ul>
              <li>Upgrade to a paid plan for higher limits</li>
              <li>Optimize your API calls</li>
              <li>Implement request caching</li>
            </ul>
            
            <a href="https://signalguard.ai/basic" class="button">View Dashboard</a>
            <a href="https://signalguard.ai/pricing" class="button">Upgrade Plan</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Signal Guard. You received this because you signed up for API access.</p>
            <p>© 2024 Signal Guard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Signal Guard API: Rate Limit Exceeded

Your API has reached the ${isDaily ? 'daily' : 'monthly'} rate limit of ${limit} requests.

Important: Your API requests will be rejected until the limit resets ${resetTime}.

When will it reset?
Your limit will reset ${resetTime} and you'll be able to make API requests again.

Need more requests?
- Upgrade to a paid plan for higher limits
- Optimize your API calls
- Implement request caching

View your dashboard: https://signalguard.ai/basic
Upgrade your plan: https://signalguard.ai/pricing

© 2024 Signal Guard. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getMonthlyLimitWarningTemplate(remainingDays: number): EmailTemplate {
    const subject = `Signal Guard API: ${remainingDays} Days Left in Monthly Cycle`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Cycle Warning</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { background: #dbeafe; border: 1px solid #2563eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Signal Guard API</h1>
            <p>Monthly Cycle Reminder</p>
          </div>
          <div class="content">
            <h2>📅 Monthly Cycle Update</h2>
            <p>You have <strong>${remainingDays} days</strong> left in your current monthly billing cycle.</p>
            
            <div class="info">
              <strong>Reminder:</strong> Your monthly request limit will reset in ${remainingDays} days.
            </div>
            
            <p>What this means:</p>
            <ul>
              <li>Your current usage will be tracked until the end of the month</li>
              <li>Your limit will reset to 1,000 free requests on the first of next month</li>
              <li>Any unused requests do not roll over to the next month</li>
            </ul>
            
            <a href="https://signalguard.ai/basic" class="button">View Usage</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Signal Guard. You received this because you signed up for API access.</p>
            <p>© 2024 Signal Guard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Signal Guard API: Monthly Cycle Reminder

You have ${remainingDays} days left in your current monthly billing cycle.

Reminder: Your monthly request limit will reset in ${remainingDays} days.

What this means:
- Your current usage will be tracked until the end of the month
- Your limit will reset to 1,000 free requests on the first of next month
- Any unused requests do not roll over to the next month

View your usage: https://signalguard.ai/basic

© 2024 Signal Guard. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getKeyRegenerationTemplate(newKeyLast4: string): EmailTemplate {
    const subject = 'Signal Guard API: Key Regenerated';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Key Regenerated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Signal Guard API</h1>
            <p>Key Regenerated</p>
          </div>
          <div class="content">
            <h2>🔄 API Key Updated</h2>
            <p>Your Signal Guard API key has been successfully regenerated.</p>
            
            <div class="warning">
              <strong>Important:</strong> Your old API key has been invalidated and will no longer work.
            </div>
            
            <p><strong>New Key Details:</strong></p>
            <ul>
              <li>New API Key ends with: <code>...${newKeyLast4}</code></li>
              <li>Old key has been permanently invalidated</li>
              <li>All usage limits have been reset</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Update your applications with the new API key</li>
              <li>Remove the old key from any stored configurations</li>
              <li>Test your applications to ensure they work with the new key</li>
            </ul>
            
            <a href="https://signalguard.ai/basic" class="button">View New Key</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Signal Guard. You received this because you regenerated your API key.</p>
            <p>© 2024 Signal Guard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Signal Guard API: Key Regenerated

Your Signal Guard API key has been successfully regenerated.

Important: Your old API key has been invalidated and will no longer work.

New Key Details:
- New API Key ends with: ...${newKeyLast4}
- Old key has been permanently invalidated
- All usage limits have been reset

Next Steps:
- Update your applications with the new API key
- Remove the old key from any stored configurations
- Test your applications to ensure they work with the new key

View your new key: https://signalguard.ai/basic

© 2024 Signal Guard. All rights reserved.
    `;

    return { subject, html, text };
  }

  private getWelcomeTemplate(apiKey: string): EmailTemplate {
    const subject = 'Welcome to Signal Guard API';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Signal Guard</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .api-key { background: #f3f4f6; border: 1px solid #d1d5db; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Signal Guard</h1>
            <p>Your API Key is Ready</p>
          </div>
          <div class="content">
            <h2>Getting Started</h2>
            <p>Thank you for signing up for Signal Guard API! Your free API key is ready to use.</p>
            
            <h3>Your API Key:</h3>
            <div class="api-key">${apiKey}</div>
            
            <p><strong>What you get with your free account:</strong></p>
            <ul>
              <li>1,000 API requests per month</li>
              <li>100 requests per day</li>
              <li>Access to all signal processing endpoints</li>
              <li>Real-time threat detection</li>
              <li>Comprehensive documentation</li>
            </ul>
            
            <p><strong>Quick Start:</strong></p>
            <ol>
              <li>Copy your API key above</li>
              <li>Visit our documentation at https://signalguard.ai/basic</li>
              <li>Make your first API request</li>
            </ol>
            
            <a href="https://signalguard.ai/basic" class="button">View Documentation</a>
            <a href="https://signalguard.ai/docs" class="button">API Reference</a>
            
            <p>If you have any questions, our documentation and support team are here to help!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Signal Guard. You received this because you signed up for API access.</p>
            <p>© 2024 Signal Guard. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Signal Guard API

Thank you for signing up for Signal Guard API! Your free API key is ready to use.

Your API Key:
${apiKey}

What you get with your free account:
- 1,000 API requests per month
- 100 requests per day
- Access to all signal processing endpoints
- Real-time threat detection
- Comprehensive documentation

Quick Start:
1. Copy your API key above
2. Visit our documentation at https://signalguard.ai/basic
3. Make your first API request

View documentation: https://signalguard.ai/basic
API reference: https://signalguard.ai/docs

If you have any questions, our documentation and support team are here to help!

© 2024 Signal Guard. All rights reserved.
    `;

    return { subject, html, text };
  }
}

export const emailService = EmailService.getInstance();
