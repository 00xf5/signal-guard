import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { 
  Shield, 
  Mail, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Globe,
  Calendar,
  Zap,
  Lock,
  BarChart3,
  Terminal,
  ArrowRight,
  Server,
  Database,
  Cpu,
  Network
} from 'lucide-react';
import { apiKeyManager, ApiKeyData, UsageStats } from '@/lib/api-key-manager';
import { ApiKeyCard } from '@/components/api-key-card';

const ApiKeyPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<ApiKeyData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadStoredApiKey();
  }, []);

  const loadStoredApiKey = async () => {
    try {
      const storedKey = apiKeyManager.getStoredApiKey();
      if (storedKey) {
        setApiKey(storedKey);
        const stats = await apiKeyManager.getUsageStats(storedKey.api_key);
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Failed to load stored API key:', error);
    }
  };

  const createApiKey = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsCreating(true);
    try {
      const newKey = await apiKeyManager.createApiKey({ 
        email,
        ipAddress: await apiKeyManager.getClientIP()
      });
      
      apiKeyManager.storeApiKeyLocally(newKey);
      setApiKey(newKey);
      
      const stats = await apiKeyManager.getUsageStats(newKey.api_key);
      setUsageStats(stats);
      
      toast.success('API key created successfully!');
      setEmail('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRegenerate = async (userEmail: string) => {
    setIsLoading(true);
    try {
      const newKey = await apiKeyManager.regenerateApiKey(userEmail);
      apiKeyManager.storeApiKeyLocally(newKey);
      setApiKey(newKey);
      
      const stats = await apiKeyManager.getUsageStats(newKey.api_key);
      setUsageStats(stats);
      
      toast.success('API key regenerated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to regenerate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (keyId: string) => {
    setIsLoading(true);
    try {
      await apiKeyManager.deactivateApiKey(keyId);
      apiKeyManager.clearStoredApiKey();
      setApiKey(null);
      setUsageStats(null);
      toast.success('API key deactivated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard!');
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '*'.repeat(key.length - 12) + key.substring(key.length - 4);
  };

  const getUsagePercentage = () => {
    if (!usageStats) return 0;
    return Math.round((usageStats.total_requests / usageStats.monthly_limit) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-[0.02] z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="py-20 px-4 pt-32">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <Badge variant="outline" className="text-sm">Developer Portal</Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                API Key
                <span className="text-muted-foreground"> Management</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Access RiskSignal's powerful risk intelligence and anonymity detection APIs. 
                Generate your key to start analyzing IPs, domains, and detecting malicious activity.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">100</div>
                  <div className="text-sm text-muted-foreground">Daily Requests</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">1K</div>
                  <div className="text-sm text-muted-foreground">Monthly Limit</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">&lt;100ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - API Key Management */}
              <div className="lg:col-span-2 space-y-6">
                {!apiKey ? (
                  <Card className="border-2 border-dashed border-primary/20">
                    <CardHeader className="text-center pb-8">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Key className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Generate Your API Key</CardTitle>
                      <CardDescription className="text-base">
                        Get instant access to RiskSignal's risk intelligence APIs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isCreating}
                          className="h-12 text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          We'll send usage alerts and important notifications to this email
                        </p>
                      </div>

                      <Button 
                        onClick={createApiKey}
                        disabled={!email || isCreating}
                        className="w-full h-12 text-base font-medium"
                        size="lg"
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                            Generating Key...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            Generate API Key
                          </>
                        )}
                      </Button>

                      <Alert>
                        <Lock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Security First:</strong> Your API key will be stored locally in your browser. 
                          Never share it publicly or commit it to version control.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Your API Key
                          </CardTitle>
                          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>
                          Your key for accessing RiskSignal's intelligence APIs
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* API Key Display */}
                        <div className="space-y-2">
                          <Label className="text-base font-medium">API Key</Label>
                          <div className="flex space-x-2">
                            <div className="relative flex-1">
                              <Input
                                value={showKey ? apiKey.api_key : maskKey(apiKey.api_key)}
                                readOnly
                                className="font-mono pr-12 h-12 text-sm"
                                type={showKey ? "text" : "password"}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowKey(!showKey)}
                              >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleCopy(apiKey.api_key)}
                              title="Copy API key"
                              className="h-12 w-12"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Key Information */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <span className="font-medium">Created</span>
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(apiKey.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-medium">Last Used</span>
                            <div className="flex items-center text-muted-foreground">
                              <Activity className="h-3 w-3 mr-1" />
                              {apiKey.last_used 
                                ? new Date(apiKey.last_used).toLocaleDateString()
                                : 'Never'
                              }
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-medium">Total Usage</span>
                            <div className="text-muted-foreground">
                              {apiKey.usage_count.toLocaleString()} requests
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="font-medium">IP Address</span>
                            <div className="flex items-center text-muted-foreground">
                              <Globe className="h-3 w-3 mr-1" />
                              <span className="font-mono text-xs">{apiKey.ip_address || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Usage Statistics */}
                        {usageStats && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Usage Statistics</Label>
                              <Badge variant="outline">{getUsagePercentage()}% used</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <span className="font-medium">Today</span>
                                <div className="text-muted-foreground">
                                  {usageStats.requests_today} / {usageStats.daily_limit}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="font-medium">This Month</span>
                                <div className="text-muted-foreground">
                                  {usageStats.requests_this_month} / {usageStats.monthly_limit}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Monthly Usage</span>
                                <span>{getUsagePercentage()}%</span>
                              </div>
                              <Progress 
                                value={getUsagePercentage()} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => handleRegenerate(apiKey.email || '')}
                            disabled={isLoading || !apiKey.email}
                            className="flex-1"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeactivate(apiKey.id)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Deactivate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Right Column - Info & Docs */}
              <div className="space-y-6">
                {/* Quick Start */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm">
                        <div className="text-muted-foreground mb-2"># Test your API key</div>
                        <div>curl -X GET "https://api.risksignal.com/v1/ip/8.8.8.8" \</div>
                        <div className="pl-4">-H "Authorization: Bearer YOUR_API_KEY"</div>
                      </code>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      View Documentation
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      API Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>IP Risk Scoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Domain Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Anonymity Detection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Threat Intelligence</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Real-time Data</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Rate Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Daily Requests</span>
                        <span className="font-medium">100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Monthly Requests</span>
                        <span className="font-medium">1,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rate Limit</span>
                        <span className="font-medium">10 req/min</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Reset Time</span>
                        <span className="font-medium">00:00 UTC</span>
                      </div>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Need higher limits? Contact us for enterprise plans.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Security Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Store keys in environment variables</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Never commit keys to version control</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Use HTTPS for all API calls</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Regenerate keys if compromised</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApiKeyPage;
