import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  Key, 
  Mail, 
  RefreshCw, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Activity,
  Globe
} from 'lucide-react';
import { ApiKeyData, UsageStats } from '@/lib/api-key-manager';

interface ApiKeyCardProps {
  apiKey: ApiKeyData;
  usageStats?: UsageStats;
  onRegenerate?: (email: string) => Promise<void>;
  onDeactivate?: (keyId: string) => Promise<void>;
  onCopy?: (key: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
}

export const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  usageStats,
  onRegenerate,
  onDeactivate,
  onCopy,
  isLoading = false,
  showActions = true
}) => {
  const [showKey, setShowKey] = useState(false);
  const [email, setEmail] = useState(apiKey.email || '');

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '*'.repeat(key.length - 12) + key.substring(key.length - 4);
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(apiKey.api_key);
    } else {
      navigator.clipboard.writeText(apiKey.api_key);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate && email) {
      await onRegenerate(email);
    }
  };

  const handleDeactivate = async () => {
    if (onDeactivate) {
      await onDeactivate(apiKey.id);
    }
  };

  const getStatusColor = () => {
    return apiKey.is_active ? 'default' : 'secondary';
  };

  const getStatusText = () => {
    return apiKey.is_active ? 'Active' : 'Inactive';
  };

  const getUsagePercentage = () => {
    if (!usageStats) return 0;
    return Math.round((usageStats.total_requests / usageStats.monthly_limit) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'secondary';
    return 'default';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            API Key
          </CardTitle>
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Your Signal Guard API key for accessing signal processing services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key Display */}
        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                value={showKey ? apiKey.api_key : maskKey(apiKey.api_key)}
                readOnly
                className="font-mono pr-10"
                type={showKey ? 'text' : 'password'}
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
              onClick={handleCopy}
              title="Copy API key"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Created:</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(apiKey.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span className="font-medium">Last Used:</span>
            <div className="flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" />
              <span>
                {apiKey.last_used 
                  ? new Date(apiKey.last_used).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
          <div>
            <span className="font-medium">Total Usage:</span>
            <div className="mt-1">
              <span>{apiKey.usage_count.toLocaleString()} requests</span>
            </div>
          </div>
          <div>
            <span className="font-medium">IP Address:</span>
            <div className="flex items-center mt-1">
              <Globe className="h-3 w-3 mr-1" />
              <span className="font-mono text-xs">{apiKey.ip_address || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        {usageStats && (
          <div className="space-y-2">
            <Label>Usage Statistics</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Today:</span>
                <div className="mt-1">
                  <span>{usageStats.requests_today} / {usageStats.daily_limit}</span>
                </div>
              </div>
              <div>
                <span className="font-medium">This Month:</span>
                <div className="mt-1">
                  <span>{usageStats.requests_this_month} / {usageStats.monthly_limit}</span>
                </div>
              </div>
            </div>
            
            {/* Usage Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Monthly Usage</span>
                <span>{getUsagePercentage()}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getUsagePercentage() >= 90 ? 'bg-destructive' :
                    getUsagePercentage() >= 75 ? 'bg-secondary' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Information */}
        {apiKey.email && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Usage alerts are sent to {apiKey.email}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        {showActions && apiKey.is_active && (
          <div className="space-y-3">
            {onRegenerate && (
              <div className="space-y-2">
                <Label htmlFor="regenerate-email">Email for notifications</Label>
                <div className="flex space-x-2">
                  <Input
                    id="regenerate-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerate}
                    disabled={!email || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Regenerating will invalidate your current key and create a new one
                </p>
              </div>
            )}

            {onDeactivate && (
              <Button 
                variant="destructive" 
                onClick={handleDeactivate}
                disabled={isLoading}
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Deactivate Key
              </Button>
            )}
          </div>
        )}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Keep your API key secret and never share it publicly. 
            If you suspect your key has been compromised, regenerate it immediately.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
