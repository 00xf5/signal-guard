import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UsageStats } from '@/lib/api-key-manager';
import { 
  Database, 
  Activity, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface UsageStatsCardProps {
  usageStats: UsageStats;
  className?: string;
}

export const UsageStatsCard: React.FC<UsageStatsCardProps> = ({ 
  usageStats, 
  className = '' 
}) => {
  const dailyPercentage = Math.round((usageStats.requests_today / usageStats.daily_limit) * 100);
  const monthlyPercentage = Math.round((usageStats.requests_this_month / usageStats.monthly_limit) * 100);
  
  const getDailyStatus = () => {
    if (dailyPercentage >= 90) return { color: 'destructive', icon: AlertTriangle, text: 'Critical' };
    if (dailyPercentage >= 75) return { color: 'secondary', icon: TrendingUp, text: 'Warning' };
    return { color: 'default', icon: CheckCircle, text: 'Good' };
  };

  const getMonthlyStatus = () => {
    if (monthlyPercentage >= 90) return { color: 'destructive', icon: AlertTriangle, text: 'Critical' };
    if (monthlyPercentage >= 75) return { color: 'secondary', icon: TrendingUp, text: 'Warning' };
    return { color: 'default', icon: CheckCircle, text: 'Good' };
  };

  const dailyStatus = getDailyStatus();
  const monthlyStatus = getMonthlyStatus();

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={usageStats.total_requests.toLocaleString()}
          subtitle="All time"
          icon={Database}
        />
        
        <StatCard
          title="Today"
          value={usageStats.requests_today}
          subtitle={`of ${usageStats.daily_limit} daily`}
          icon={Activity}
        />
        
        <StatCard
          title="This Month"
          value={usageStats.requests_this_month}
          subtitle={`of ${usageStats.monthly_limit} monthly`}
          icon={Calendar}
        />
        
        <StatCard
          title="Remaining"
          value={usageStats.rate_limit_remaining}
          subtitle="requests left"
          icon={Zap}
        />
      </div>

      {/* Detailed Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Daily Usage
              </CardTitle>
              <Badge variant={dailyStatus.color as any}>
                <dailyStatus.icon className="h-3 w-3 mr-1" />
                {dailyStatus.text}
              </Badge>
            </div>
            <CardDescription>
              Your API usage for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usageStats.requests_today} of {usageStats.daily_limit} requests</span>
                <span>{dailyPercentage}%</span>
              </div>
              <Progress 
                value={dailyPercentage} 
                className="h-2"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {dailyPercentage >= 90 && (
                <p className="flex items-center text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  You're approaching your daily limit. Consider optimizing your requests.
                </p>
              )}
              {dailyPercentage >= 75 && dailyPercentage < 90 && (
                <p className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  You've used {dailyPercentage}% of your daily limit.
                </p>
              )}
              {dailyPercentage < 75 && (
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  You have plenty of daily requests remaining.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Monthly Usage
              </CardTitle>
              <Badge variant={monthlyStatus.color as any}>
                <monthlyStatus.icon className="h-3 w-3 mr-1" />
                {monthlyStatus.text}
              </Badge>
            </div>
            <CardDescription>
              Your API usage for this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{usageStats.requests_this_month} of {usageStats.monthly_limit} requests</span>
                <span>{monthlyPercentage}%</span>
              </div>
              <Progress 
                value={monthlyPercentage} 
                className="h-2"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {monthlyPercentage >= 90 && (
                <p className="flex items-center text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  You're approaching your monthly limit. Consider upgrading your plan.
                </p>
              )}
              {monthlyPercentage >= 75 && monthlyPercentage < 90 && (
                <p className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  You've used {monthlyPercentage}% of your monthly limit.
                </p>
              )}
              {monthlyPercentage < 75 && (
                <p className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  You have plenty of monthly requests remaining.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Optimization Tips</CardTitle>
          <CardDescription>
            How to make the most of your API quota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Efficiency</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implement response caching</li>
                <li>• Use batch requests when possible</li>
                <li>• Optimize request frequency</li>
                <li>• Filter data at the API level</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Handle rate limits gracefully</li>
                <li>• Monitor your usage regularly</li>
                <li>• Set up usage alerts</li>
                <li>• Consider upgrading for higher limits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
