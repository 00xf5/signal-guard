import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  BookOpen,
  Terminal,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  example: {
    curl: string;
    javascript: string;
    python: string;
  };
  response?: {
    success: any;
    error: any;
  };
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/signals',
    description: 'Retrieve all signal data with optional filtering',
    parameters: [
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of results to return (default: 50, max: 100)'
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Number of results to skip (for pagination)'
      },
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by signal type (e.g., "anomaly", "threat", "normal")'
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Filter signals from this date (ISO 8601 format)'
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'Filter signals until this date (ISO 8601 format)'
      }
    ],
    example: {
      curl: `curl -H 'Authorization: Bearer YOUR_API_KEY' \\
'https://api.signalguard.ai/api/v1/signals?limit=10&type=threat'`,
      javascript: `const response = await fetch(
  'https://api.signalguard.ai/api/v1/signals?limit=10&type=threat',
  {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();`,
      python: `import requests

response = requests.get(
    'https://api.signalguard.ai/api/v1/signals',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    },
    params={
        'limit': 10,
        'type': 'threat'
    }
)
data = response.json()`
    },
    response: {
      success: {
        "signals": [
          {
            "id": "sig_123456",
            "type": "threat",
            "severity": "high",
            "timestamp": "2024-01-15T10:30:00Z",
            "source": "network_monitor",
            "data": { /* signal data */ }
          }
        ],
        "total": 1,
        "limit": 10,
        "offset": 0
      },
      error: {
        "error": "Invalid parameter",
        "message": "Invalid signal type specified"
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/signals/analyze',
    description: 'Analyze signal data for threats and anomalies',
    parameters: [
      {
        name: 'signal_data',
        type: 'object',
        required: true,
        description: 'The signal data to analyze'
      },
      {
        name: 'analysis_type',
        type: 'string',
        required: false,
        description: 'Type of analysis (threat, anomaly, pattern)'
      },
      {
        name: 'confidence_threshold',
        type: 'float',
        required: false,
        description: 'Minimum confidence score for results (0.0-1.0)'
      }
    ],
    example: {
      curl: `curl -X POST \\
-H 'Authorization: Bearer YOUR_API_KEY' \\
-H 'Content-Type: application/json' \\
-d '{
  "signal_data": {
    "source": "network_traffic",
    "timestamp": "2024-01-15T10:30:00Z",
    "metrics": {"bytes": 1024, "packets": 10}
  },
  "analysis_type": "threat"
}' \\
'https://api.signalguard.ai/api/v1/signals/analyze'`,
      javascript: `const response = await fetch(
  'https://api.signalguard.ai/api/v1/signals/analyze',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      signal_data: {
        source: 'network_traffic',
        timestamp: '2024-01-15T10:30:00Z',
        metrics: { bytes: 1024, packets: 10 }
      },
      analysis_type: 'threat'
    })
  }
);
const result = await response.json();`,
      python: `import requests

response = requests.post(
    'https://api.signalguard.ai/api/v1/signals/analyze',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    },
    json={
        'signal_data': {
            'source': 'network_traffic',
            'timestamp': '2024-01-15T10:30:00Z',
            'metrics': {'bytes': 1024, 'packets': 10}
        },
        'analysis_type': 'threat'
    }
)
result = response.json()`
    },
    response: {
      success: {
        "analysis_id": "analysis_789",
        "results": {
          "threat_detected": true,
          "confidence": 0.92,
          "threat_type": "ddos_pattern",
          "recommendations": ["block_source_ip", "monitor_closely"]
        },
        "processing_time_ms": 150
      },
      error: {
        "error": "Invalid input",
        "message": "signal_data is required"
      }
    }
  },
  {
    method: 'GET',
    path: '/api/v1/threats',
    description: 'Get current threat intelligence and alerts',
    parameters: [
      {
        name: 'severity',
        type: 'string',
        required: false,
        description: 'Filter by severity level (low, medium, high, critical)'
      },
      {
        name: 'active_only',
        type: 'boolean',
        required: false,
        description: 'Only return active threats (default: true)'
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum number of threats to return'
      }
    ],
    example: {
      curl: `curl -H 'Authorization: Bearer YOUR_API_KEY' \\
'https://api.signalguard.ai/api/v1/threats?severity=high&active_only=true'`,
      javascript: `const response = await fetch(
  'https://api.signalguard.ai/api/v1/threats?severity=high&active_only=true',
  {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  }
);
const threats = await response.json();`,
      python: `import requests

response = requests.get(
    'https://api.signalguard.ai/api/v1/threats',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    },
    params={
        'severity': 'high',
        'active_only': True
    }
)
threats = response.json()`
    },
    response: {
      success: {
        "threats": [
          {
            "id": "threat_456",
            "type": "malware",
            "severity": "high",
            "status": "active",
            "first_seen": "2024-01-15T09:00:00Z",
            "description": "Suspicious malware activity detected",
            "affected_systems": ["server_1", "server_2"]
          }
        ],
        "total": 1
      },
      error: {
        "error": "Invalid severity",
        "message": "Severity must be one of: low, medium, high, critical"
      }
    }
  },
  {
    method: 'POST',
    path: '/api/v1/monitor',
    description: 'Start monitoring a target for signal analysis',
    parameters: [
      {
        name: 'target',
        type: 'string',
        required: true,
        description: 'Target to monitor (IP address, domain, or resource ID)'
      },
      {
        name: 'monitoring_type',
        type: 'string',
        required: true,
        description: 'Type of monitoring (network, application, infrastructure)'
      },
      {
        name: 'duration',
        type: 'integer',
        required: false,
        description: 'Monitoring duration in minutes (default: 60)'
      },
      {
        name: 'alert_threshold',
        type: 'object',
        required: false,
        description: 'Thresholds for triggering alerts'
      }
    ],
    example: {
      curl: `curl -X POST \\
-H 'Authorization: Bearer YOUR_API_KEY' \\
-H 'Content-Type: application/json' \\
-d '{
  "target": "192.168.1.100",
  "monitoring_type": "network",
  "duration": 120,
  "alert_threshold": {
    "cpu_usage": 80,
    "memory_usage": 90
  }
}' \\
'https://api.signalguard.ai/api/v1/monitor'`,
      javascript: `const response = await fetch(
  'https://api.signalguard.ai/api/v1/monitor',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      target: '192.168.1.100',
      monitoring_type: 'network',
      duration: 120,
      alert_threshold: {
        cpu_usage: 80,
        memory_usage: 90
      }
    })
  }
);
const monitor = await response.json();`,
      python: `import requests

response = requests.post(
    'https://api.signalguard.ai/api/v1/monitor',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    },
    json={
        'target': '192.168.1.100',
        'monitoring_type': 'network',
        'duration': 120,
        'alert_threshold': {
            'cpu_usage': 80,
            'memory_usage': 90
        }
    }
)
monitor = response.json()`
    },
    response: {
      success: {
        "monitor_id": "monitor_123",
        "status": "started",
        "target": "192.168.1.100",
        "monitoring_type": "network",
        "duration_minutes": 120,
        "started_at": "2024-01-15T10:30:00Z",
        "estimated_end": "2024-01-15T12:30:00Z"
      },
      error: {
        "error": "Invalid target",
        "message": "Target IP address is not reachable"
      }
    }
  }
];

export const ApiDocs: React.FC = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(identifier);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'default';
      case 'POST': return 'secondary';
      case 'PUT': return 'outline';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            API Documentation
          </CardTitle>
          <CardDescription>
            Complete reference for the Signal Guard API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Base URL</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  https://api.signalguard.ai
                </code>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Authentication</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  Bearer Token
                </code>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium">Rate Limits</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  100/day, 1000/month
                </code>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the Authorization header:
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">API Endpoints</h3>
        
        {apiEndpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={getMethodColor(endpoint.method) as any}>
                    {endpoint.method}
                  </Badge>
                  <code className="font-mono text-sm">{endpoint.path}</code>
                </div>
              </div>
              <CardDescription>{endpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="parameters" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="try">Try It</TabsTrigger>
                </TabsList>

                <TabsContent value="parameters" className="space-y-4">
                  {endpoint.parameters && endpoint.parameters.length > 0 ? (
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, paramIndex) => (
                        <div key={paramIndex} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <code className="font-mono text-sm">{param.name}</code>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{param.type}</Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No parameters required</p>
                  )}
                </TabsContent>

                <TabsContent value="examples" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center">
                          <Terminal className="h-4 w-4 mr-1" />
                          cURL
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example.curl, `curl-${index}`)}
                        >
                          {copiedCode === `curl-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {endpoint.example.curl}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center">
                          <Code className="h-4 w-4 mr-1" />
                          JavaScript
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example.javascript, `js-${index}`)}
                        >
                          {copiedCode === `js-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {endpoint.example.javascript}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium flex items-center">
                          <Code className="h-4 w-4 mr-1" />
                          Python
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example.python, `py-${index}`)}
                        >
                          {copiedCode === `py-${index}` ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                          {endpoint.example.python}
                        </pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="response" className="space-y-4">
                  {endpoint.response && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Success Response
                        </h4>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-xs font-mono overflow-x-auto">
                            {JSON.stringify(endpoint.response.success, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                          Error Response
                        </h4>
                        <div className="bg-muted p-3 rounded-md">
                          <pre className="text-xs font-mono overflow-x-auto">
                            {JSON.stringify(endpoint.response.error, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="try" className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Interactive API testing will be available in the next version. 
                      For now, use the examples above to test the endpoints.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits & Usage</CardTitle>
          <CardDescription>
            Understanding API rate limits and best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Free Tier Limits</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  100 requests per day
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  1,000 requests per month
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Full access to all endpoints
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Headers</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Rate limit information is included in response headers:
              </p>
              <div className="space-y-1 text-xs font-mono bg-muted p-2 rounded">
                <div>X-RateLimit-Limit: 100</div>
                <div>X-RateLimit-Remaining: 95</div>
                <div>X-RateLimit-Reset: 1642248000</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Best Practices</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>• Implement exponential backoff for failed requests</li>
              <li>• Cache responses when appropriate</li>
              <li>• Monitor rate limit headers</li>
              <li>• Use batch requests when possible</li>
              <li>• Handle 429 responses gracefully</li>
              <li>• Set up usage alerts for your account</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
