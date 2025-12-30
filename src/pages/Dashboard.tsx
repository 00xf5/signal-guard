import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  BarChart3, 
  Activity, 
  Globe, 
  Zap, 
  Users, 
  Settings, 
  CreditCard, 
  FileText, 
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  Download,
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import authService, { User, Subscription, ApiKeyEnhanced } from '@/lib/auth';
import Header from '@/components/Header';

interface DashboardStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  activeApiKeys: number;
  threatDetections: number;
  uptime: number;
  avgResponseTime: number;
}

interface RecentActivity {
  id: string;
  type: 'api_call' | 'threat_detected' | 'key_created' | 'login';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyEnhanced[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    requestsToday: 0,
    requestsThisMonth: 0,
    activeApiKeys: 0,
    threatDetections: 0,
    uptime: 99.9,
    avgResponseTime: 85
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // Get subscription
      const userSubscription = await authService.getUserSubscription(currentUser.id);
      setSubscription(userSubscription);

      // Load dashboard data
      await Promise.all([
        loadApiKeys(currentUser.id),
        loadStats(currentUser.id),
        loadRecentActivity(currentUser.id)
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApiKeys = async (userId: string) => {
    // Mock data - replace with actual API call
    const mockApiKeys: ApiKeyEnhanced[] = [
      {
        id: '1',
        user_id: userId,
        api_key: 'sg_1234567890abcdef1234567890abcdef1234567890',
        name: 'Production API Key',
        description: 'Main production API key',
        tier: 'free',
        daily_limit: 100,
        monthly_limit: 1000,
        requests_today: 45,
        requests_this_month: 234,
        last_reset: new Date().toISOString(),
        is_active: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        usage_count: 1234
      }
    ];
    setApiKeys(mockApiKeys);
  };

  const loadStats = async (userId: string) => {
    // Mock data - replace with actual API call
    const mockStats: DashboardStats = {
      totalRequests: 15420,
      requestsToday: 45,
      requestsThisMonth: 234,
      activeApiKeys: 1,
      threatDetections: 12,
      uptime: 99.9,
      avgResponseTime: 85
    };
    setStats(mockStats);
  };

  const loadRecentActivity = async (userId: string) => {
    // Mock data - replace with actual API call
    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'api_call',
        description: 'IP analysis completed for 192.168.1.1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'threat_detected',
        description: 'High-risk IP detected: 185.220.101.182',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'warning'
      },
      {
        id: '3',
        type: 'api_call',
        description: 'Domain analysis completed for example.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '4',
        type: 'login',
        description: 'New login from 192.168.1.100',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const getUsagePercentage = () => {
    if (!subscription) return 0;
    const percentage: number = (stats.requestsThisMonth / (subscription.tier === 'pro' ? 10000 : 1000)) * 100;
    return Math.min(percentage, 100);
  };

  const getTierColor = () => {
    if (!subscription) return 'secondary';
    switch (subscription.tier) {
      case 'free': return 'secondary';
      case 'pro': return 'default';
      case 'enterprise': return 'destructive';
      default: return 'secondary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'api_call': return <Activity className="w-4 h-4" />;
      case 'threat_detected': return <AlertTriangle className="w-4 h-4" />;
      case 'key_created': return <Key className="w-4 h-4" />;
      case 'login': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-[0.02] z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10">
        <section className="py-20 px-4 pt-32">
          <div className="container mx-auto max-w-7xl">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.first_name || user?.email}!
                  </h1>
                  <p className="text-muted-foreground">
                    Here's your risk intelligence overview for today
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={getTierColor()} className="text-sm">
                    {subscription?.tier?.toUpperCase() || 'FREE'} TIER
                  </Badge>
                  
                  {subscription?.tier === 'free' && (
                    <Button 
                      onClick={() => navigate('/billing')}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.requestsToday}</div>
                  <p className="text-xs text-muted-foreground">
                    of {subscription?.tier === 'pro' ? '10,000' : '100'} daily limit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Threat Detections</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{stats.threatDetections}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Performance</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">Avg response time</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="bulk-analysis">Bulk Analysis</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Usage Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Usage Trends
                      </CardTitle>
                      <CardDescription>
                        Your API usage over the last 30 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Usage chart coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common tasks and shortcuts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/api-key')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create API Key
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('bulk-analysis')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Bulk Analysis
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/billing')}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Account Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest events and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className={getStatusColor(activity.status)}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Keys Tab */}
              <TabsContent value="api-keys" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">API Keys</h2>
                    <p className="text-muted-foreground">
                      Manage your API keys and access tokens
                    </p>
                  </div>
                  <Button onClick={() => navigate('/api-key')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Key
                  </Button>
                </div>

                <div className="grid gap-6">
                  {apiKeys.map((key) => (
                    <Card key={key.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              {key.name}
                            </CardTitle>
                            <CardDescription>{key.description}</CardDescription>
                          </div>
                          <Badge variant={key.is_active ? "default" : "secondary"}>
                            {key.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Daily Usage:</span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(key.requests_today / key.daily_limit) * 100} 
                                className="flex-1 h-2" 
                              />
                              <span>{key.requests_today}/{key.daily_limit}</span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Monthly Usage:</span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(key.requests_this_month / key.monthly_limit) * 100} 
                                className="flex-1 h-2" 
                              />
                              <span>{key.requests_this_month}/{key.monthly_limit}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                          <span>Last used: {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analytics Dashboard
                    </CardTitle>
                    <CardDescription>
                      Comprehensive usage and performance analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Advanced analytics coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bulk Analysis Tab */}
              <TabsContent value="bulk-analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Bulk Analysis
                    </CardTitle>
                    <CardDescription>
                      Upload CSV files for batch IP and domain analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center">
                        <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Bulk analysis feature coming soon</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Available in Pro and Enterprise tiers
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Manage your account details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <p className="text-sm text-muted-foreground">
                          {user?.first_name} {user?.last_name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company</label>
                        <p className="text-sm text-muted-foreground">
                          {user?.company || 'Not specified'}
                        </p>
                      </div>
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>
                        Current plan and billing information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Plan</p>
                          <p className="text-2xl font-bold capitalize">
                            {subscription?.tier || 'Free'}
                          </p>
                        </div>
                        <Badge variant={getTierColor()}>
                          {subscription?.tier?.toUpperCase() || 'FREE'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly Limit:</span>
                          <span>{subscription?.tier === 'pro' ? '10,000' : '1,000'} requests</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Used This Month:</span>
                          <span>{stats.requestsThisMonth} requests</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate('/billing')}
                        className="w-full"
                        disabled={subscription?.tier === 'enterprise'}
                      >
                        {subscription?.tier === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
