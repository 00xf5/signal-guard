import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Header from '@/components/Header';
import { 
  Key, 
  Mail, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Code, 
  Database, 
  Globe, 
  Zap, 
  BookOpen,
  Terminal,
  ArrowRight,
  Lock,
  BarChart3,
  Activity,
  Calendar,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";
import { ApiKeyCard } from "@/components/api-key-card";
import { UsageStatsCard } from "@/components/usage-stats-card";
import { ApiDocs } from "@/components/api-docs";

const Basic = () => {
  const [email, setEmail] = useState("");
  const [showKey, setShowKey] = useState(false);
  
  // Use modular API key hook
  const {
    apiKey,
    isLoading,
    error,
    usageStats,
    createApiKey,
    regenerateKey,
    refreshUsageStats,
    clearError
  } = useApiKey();

  // Handle API key creation
  const handleCreateApiKey = async () => {
    try {
      await createApiKey({ email: email || undefined });
      setEmail(""); // Clear email after successful creation
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Handle key regeneration
  const handleRegenerateKey = async (userEmail: string) => {
    try {
      await regenerateKey(userEmail);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API key copied to clipboard!");
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
                <Badge variant="outline" className="text-sm">Free Tier</Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                RiskSignal
                <span className="text-muted-foreground"> Free API</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                Get instant access to powerful risk intelligence and anonymity detection APIs. 
                Start analyzing IPs, domains, and detecting malicious activity with our free tier.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">1K</div>
                  <div className="text-sm text-muted-foreground">Monthly Requests</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Uptime SLA</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">&lt;100ms</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center p-4 rounded-lg border bg-card">
                  <div className="text-2xl font-bold text-primary">256-bit</div>
                  <div className="text-sm text-muted-foreground">Encryption</div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex justify-between items-center">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={clearError}>
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="key" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="key">API Key</TabsTrigger>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
                <TabsTrigger value="examples">Code Examples</TabsTrigger>
                <TabsTrigger value="usage">Usage Stats</TabsTrigger>
              </TabsList>

              <TabsContent value="key" className="space-y-6">
                {!apiKey ? (
                  <Card className="border-2 border-dashed border-primary/20">
                    <CardHeader className="text-center pb-8">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Key className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Generate Your Free API Key</CardTitle>
                      <CardDescription className="text-base">
                        Get instant access to RiskSignal's risk intelligence APIs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">Email Address (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="h-12 text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          Add your email to receive usage alerts and important notifications
                        </p>
                      </div>

                      <Button 
                        onClick={handleCreateApiKey} 
                        disabled={isLoading}
                        className="w-full h-12 text-base font-medium"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                            Generating Key...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-5 w-5" />
                            Generate Free API Key
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
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
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
                                onClick={() => copyToClipboard(apiKey.api_key)}
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
                              onClick={() => handleRegenerateKey(apiKey.email || '')}
                              disabled={isLoading || !apiKey.email}
                              className="flex-1"
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Quick Info */}
                    <div className="space-y-6">
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
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="docs" className="space-y-6">
                <ApiDocs />
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Code Examples
                    </CardTitle>
                    <CardDescription>
                      Ready-to-use code examples for common use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Badge variant="outline">JavaScript</Badge>
                          Node.js
                        </h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm font-mono overflow-x-auto">
{`const apiKey = '${apiKey?.api_key || 'YOUR_API_KEY'}';

const response = await fetch('https://api.risksignal.com/v1/ip/8.8.8.8', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Badge variant="outline">Python</Badge>
                        </h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm font-mono overflow-x-auto">
{`import requests

api_key = '${apiKey?.api_key || 'YOUR_API_KEY'}'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.risksignal.com/v1/ip/8.8.8.8', headers=headers)
data = response.json()
print(data)`}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Badge variant="outline">cURL</Badge>
                        </h3>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm font-mono overflow-x-auto">
{`curl -X GET "https://api.risksignal.com/v1/ip/8.8.8.8" \\
-H "Authorization: Bearer ${apiKey?.api_key || 'YOUR_API_KEY'}" \\
-H "Content-Type: application/json"`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage" className="space-y-6">
                {usageStats ? (
                  <UsageStatsCard usageStats={usageStats} />
                ) : (
                  <Card>
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <CardTitle>Usage Statistics</CardTitle>
                      <CardDescription>
                        Monitor your API usage and remaining quota
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Generate an API key to start tracking your usage statistics
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Basic;
