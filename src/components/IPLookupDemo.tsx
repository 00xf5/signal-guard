import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Globe, 
  Server, 
  MapPin, 
  Clock, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  Fingerprint,
  Radio,
  Activity,
  Cpu,
  Network,
  Eye,
  Lock,
  Unlock,
  Zap,
  TrendingUp,
  Database
} from "lucide-react";

interface IPData {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  riskScore: number;
  anonymityScore: number;
  fraudScore: number;
  abuseScore: number;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isBot: boolean;
  isHosting: boolean;
  isResidential: boolean;
  responseTime: number;
  connectionType: string;
  threatLevel: "low" | "medium" | "high" | "critical";
  lastSeen: string;
  usageType: string;
}

const mockIPDatabase: Record<string, IPData> = {
  "8.8.8.8": {
    ip: "8.8.8.8",
    country: "United States",
    countryCode: "US",
    city: "Mountain View",
    region: "California",
    timezone: "America/Los_Angeles",
    isp: "Google LLC",
    org: "Google Public DNS",
    asn: "AS15169",
    riskScore: 12.4,
    anonymityScore: 5.2,
    fraudScore: 8.1,
    abuseScore: 3.2,
    isVPN: false,
    isProxy: false,
    isTor: false,
    isBot: false,
    isHosting: true,
    isResidential: false,
    responseTime: 23,
    connectionType: "Corporate",
    threatLevel: "low",
    lastSeen: "2 minutes ago",
    usageType: "Content Delivery Network",
  },
  "1.1.1.1": {
    ip: "1.1.1.1",
    country: "Australia",
    countryCode: "AU",
    city: "Sydney",
    region: "New South Wales",
    timezone: "Australia/Sydney",
    isp: "Cloudflare, Inc.",
    org: "APNIC and Cloudflare DNS",
    asn: "AS13335",
    riskScore: 8.7,
    anonymityScore: 3.7,
    fraudScore: 5.4,
    abuseScore: 2.1,
    isVPN: false,
    isProxy: false,
    isTor: false,
    isBot: false,
    isHosting: true,
    isResidential: false,
    responseTime: 31,
    connectionType: "Corporate",
    threatLevel: "low",
    lastSeen: "Just now",
    usageType: "DNS Resolver",
  },
  "185.220.101.1": {
    ip: "185.220.101.1",
    country: "Germany",
    countryCode: "DE",
    city: "Frankfurt",
    region: "Hesse",
    timezone: "Europe/Berlin",
    isp: "Tor Exit Node",
    org: "Tor Project",
    asn: "AS205100",
    riskScore: 94.2,
    anonymityScore: 98.6,
    fraudScore: 87.3,
    abuseScore: 91.5,
    isVPN: false,
    isProxy: false,
    isTor: true,
    isBot: false,
    isHosting: true,
    isResidential: false,
    responseTime: 67,
    connectionType: "Anonymizer",
    threatLevel: "critical",
    lastSeen: "Active now",
    usageType: "Tor Exit Node",
  },
};

const generateRandomIP = (): IPData => {
  const isHighRisk = Math.random() > 0.6;
  const riskScore = isHighRisk ? Math.random() * 40 + 55 : Math.random() * 35 + 5;
  const anonymityScore = isHighRisk ? Math.random() * 50 + 45 : Math.random() * 30 + 2;
  const fraudScore = isHighRisk ? Math.random() * 45 + 40 : Math.random() * 25 + 5;
  const abuseScore = isHighRisk ? Math.random() * 50 + 30 : Math.random() * 20 + 2;
  
  const countries = [
    { name: "United States", code: "US", city: "New York", region: "New York", tz: "America/New_York" },
    { name: "United Kingdom", code: "GB", city: "London", region: "England", tz: "Europe/London" },
    { name: "Germany", code: "DE", city: "Berlin", region: "Berlin", tz: "Europe/Berlin" },
    { name: "Japan", code: "JP", city: "Tokyo", region: "Tokyo", tz: "Asia/Tokyo" },
    { name: "Canada", code: "CA", city: "Toronto", region: "Ontario", tz: "America/Toronto" },
    { name: "France", code: "FR", city: "Paris", region: "Île-de-France", tz: "Europe/Paris" },
    { name: "Netherlands", code: "NL", city: "Amsterdam", region: "North Holland", tz: "Europe/Amsterdam" },
    { name: "Singapore", code: "SG", city: "Singapore", region: "Central", tz: "Asia/Singapore" },
  ];
  
  const isps = ["Comcast", "AT&T", "Verizon", "Deutsche Telekom", "BT Group", "NTT", "Orange SA", "Vodafone"];
  const usageTypes = ["ISP", "Business", "Education", "Government", "Military", "Data Center"];
  const connectionTypes = ["Residential", "Corporate", "Mobile", "Satellite"];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const randomIsp = isps[Math.floor(Math.random() * isps.length)];
  
  const getThreatLevel = (risk: number): "low" | "medium" | "high" | "critical" => {
    if (risk < 25) return "low";
    if (risk < 50) return "medium";
    if (risk < 75) return "high";
    return "critical";
  };
  
  return {
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: randomCountry.name,
    countryCode: randomCountry.code,
    city: randomCountry.city,
    region: randomCountry.region,
    timezone: randomCountry.tz,
    isp: randomIsp,
    org: `${randomIsp} Services`,
    asn: `AS${Math.floor(Math.random() * 50000) + 1000}`,
    riskScore: parseFloat(riskScore.toFixed(1)),
    anonymityScore: parseFloat(anonymityScore.toFixed(1)),
    fraudScore: parseFloat(fraudScore.toFixed(1)),
    abuseScore: parseFloat(abuseScore.toFixed(1)),
    isVPN: isHighRisk && Math.random() > 0.5,
    isProxy: isHighRisk && Math.random() > 0.7,
    isTor: isHighRisk && Math.random() > 0.85,
    isBot: Math.random() > 0.9,
    isHosting: Math.random() > 0.7,
    isResidential: !isHighRisk && Math.random() > 0.4,
    responseTime: Math.floor(Math.random() * 50) + 15,
    connectionType: connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
    threatLevel: getThreatLevel(riskScore),
    lastSeen: ["Just now", "2 minutes ago", "5 minutes ago", "1 hour ago"][Math.floor(Math.random() * 4)],
    usageType: usageTypes[Math.floor(Math.random() * usageTypes.length)],
  };
};

// Animated circular gauge component
const CircularGauge = ({ 
  value, 
  maxValue = 100,
  label, 
  size = 100,
  strokeWidth = 8,
  colorClass,
  icon: Icon,
}: { 
  value: number; 
  maxValue?: number;
  label: string; 
  size?: number;
  strokeWidth?: number;
  colorClass: string;
  icon?: React.ElementType;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    setDisplayValue(0);
    setStrokeDashoffset(circumference);
    
    const duration = 1500;
    const steps = 80;
    const valueIncrement = value / steps;
    const strokeIncrement = (circumference * (1 - value / maxValue)) / steps;
    let current = 0;
    let currentStroke = circumference;
    
    const timer = setInterval(() => {
      current += valueIncrement;
      currentStroke -= (circumference - circumference * (1 - value / maxValue)) / steps;
      
      if (current >= value) {
        setDisplayValue(value);
        setStrokeDashoffset(circumference * (1 - value / maxValue));
        clearInterval(timer);
      } else {
        setDisplayValue(parseFloat(current.toFixed(1)));
        setStrokeDashoffset(circumference - (circumference * current / maxValue));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, maxValue, circumference]);

  const getColorFromClass = (cls: string) => {
    if (cls.includes("success")) return "hsl(var(--success))";
    if (cls.includes("warning")) return "hsl(var(--warning))";
    if (cls.includes("danger")) return "hsl(var(--danger))";
    return "hsl(var(--foreground))";
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColorFromClass(colorClass)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-75 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${getColorFromClass(colorClass)})`,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className={`w-4 h-4 mb-1 ${colorClass}`} />}
          <span className={`text-lg font-bold tabular-nums ${colorClass}`}>
            {displayValue.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
};

// Animated horizontal bar with glow effect
const AnimatedBar = ({ 
  value, 
  label, 
  colorClass,
  showPercentage = true,
  delay = 0,
}: { 
  value: number; 
  label: string; 
  colorClass: string;
  showPercentage?: boolean;
  delay?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setDisplayValue(0);
    setBarWidth(0);
    
    const startDelay = setTimeout(() => {
      const duration = 1200;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          setBarWidth(value);
          clearInterval(timer);
        } else {
          setDisplayValue(parseFloat(current.toFixed(1)));
          setBarWidth(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }, delay);
    
    return () => clearTimeout(startDelay);
  }, [value, delay]);

  const getGlowColor = () => {
    if (colorClass.includes("success")) return "hsl(var(--success) / 0.5)";
    if (colorClass.includes("warning")) return "hsl(var(--warning) / 0.5)";
    if (colorClass.includes("danger")) return "hsl(var(--danger) / 0.5)";
    return "hsl(var(--foreground) / 0.3)";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold tabular-nums ${colorClass}`}>
          {showPercentage ? `${displayValue.toFixed(1)}%` : displayValue.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-secondary overflow-hidden relative">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 blur-sm transition-all duration-75"
          style={{ 
            width: `${Math.min(barWidth, 100)}%`,
            background: getGlowColor(),
          }}
        />
        {/* Main bar */}
        <div 
          className={`h-full relative transition-all duration-75 ease-out ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>
    </div>
  );
};

// Pulsing indicator dot
const PulsingDot = ({ color, size = "w-2 h-2" }: { color: string; size?: string }) => (
  <span className="relative flex">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
    <span className={`relative inline-flex rounded-full ${size} ${color}`} />
  </span>
);

// Data row component
const DataRow = ({ 
  icon: Icon, 
  label, 
  value, 
  highlight = false,
  delay = 0 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  highlight?: boolean;
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`flex items-center gap-2 text-xs transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${highlight ? 'text-foreground' : 'text-muted-foreground'}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className={`ml-auto font-medium truncate max-w-[140px] ${highlight ? 'text-foreground' : ''}`}>
        {value}
      </span>
    </div>
  );
};

const IPLookupDemo = () => {
  const [ipInput, setIpInput] = useState("");
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);
  const [scanPhase, setScanPhase] = useState(0);

  const lookupIP = useCallback((ip?: string) => {
    setIsLoading(true);
    setIpData(null);
    setScanPhase(0);
    
    // Simulate scanning phases
    const phases = [1, 2, 3, 4];
    phases.forEach((phase, i) => {
      setTimeout(() => setScanPhase(phase), i * 250);
    });
    
    setTimeout(() => {
      const lookupIp = ip || ipInput.trim();
      const data = mockIPDatabase[lookupIp] || generateRandomIP();
      if (lookupIp && !mockIPDatabase[lookupIp]) {
        data.ip = lookupIp;
      }
      setIpData(data);
      setKey(prev => prev + 1);
      setIsLoading(false);
      setScanPhase(0);
    }, 1200);
  }, [ipInput]);

  useEffect(() => {
    lookupIP("8.8.8.8");
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-success";
    if (score < 60) return "text-warning";
    return "text-danger";
  };

  const getThreatBadgeStyle = (level: string) => {
    switch (level) {
      case "low": return "bg-success/20 text-success border-success/30";
      case "medium": return "bg-warning/20 text-warning border-warning/30";
      case "high": return "bg-danger/20 text-danger border-danger/30";
      case "critical": return "bg-danger/30 text-danger border-danger/50";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ipInput.trim()) {
      lookupIP();
    }
  };

  return (
    <div className="w-full">
      {/* Terminal Header */}
      <div className="border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
          <span className="w-3 h-3 rounded-full bg-danger/60 hover:bg-danger transition-colors cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-warning/60 hover:bg-warning transition-colors cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-success/60 hover:bg-success transition-colors cursor-pointer" />
          <span className="ml-2 text-sm text-muted-foreground font-medium">risksignal — threat intelligence</span>
          <div className="ml-auto flex items-center gap-2">
            <PulsingDot color="bg-success" />
            <span className="text-xs text-success font-semibold tracking-wide">LIVE</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-4 space-y-4 min-h-[420px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[380px] gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-muted rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <Fingerprint className="absolute inset-0 m-auto w-6 h-6 text-muted-foreground animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium mb-2">Analyzing IP Address</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={scanPhase >= 1 ? "text-success" : ""}>Geolocation</span>
                  <span>→</span>
                  <span className={scanPhase >= 2 ? "text-success" : ""}>Threat Intel</span>
                  <span>→</span>
                  <span className={scanPhase >= 3 ? "text-success" : ""}>Anonymity</span>
                  <span>→</span>
                  <span className={scanPhase >= 4 ? "text-success" : ""}>Report</span>
                </div>
              </div>
            </div>
          ) : ipData ? (
            <div key={key} className="space-y-4">
              {/* IP Header with Threat Level */}
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Globe className="w-8 h-8 text-muted-foreground" />
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                      ipData.threatLevel === 'low' ? 'bg-success' :
                      ipData.threatLevel === 'medium' ? 'bg-warning' : 'bg-danger'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg tracking-tight">{ipData.ip}</span>
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 border font-semibold ${getThreatBadgeStyle(ipData.threatLevel)}`}>
                        {ipData.threatLevel} risk
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {ipData.city}, {ipData.region}, {ipData.country}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-success font-medium">{ipData.responseTime}ms</span>
                  </div>
                  <div className="text-muted-foreground mt-0.5">{ipData.lastSeen}</div>
                </div>
              </div>

              {/* Main Gauges - Risk & Anonymity */}
              <div className="grid grid-cols-4 gap-2 py-2">
                <CircularGauge 
                  value={ipData.riskScore} 
                  label="Risk Score"
                  size={80}
                  strokeWidth={6}
                  colorClass={getRiskColor(ipData.riskScore)}
                  icon={Shield}
                />
                <CircularGauge 
                  value={ipData.anonymityScore} 
                  label="Anonymity"
                  size={80}
                  strokeWidth={6}
                  colorClass={getRiskColor(ipData.anonymityScore)}
                  icon={Eye}
                />
                <CircularGauge 
                  value={ipData.fraudScore} 
                  label="Fraud Score"
                  size={80}
                  strokeWidth={6}
                  colorClass={getRiskColor(ipData.fraudScore)}
                  icon={AlertTriangle}
                />
                <CircularGauge 
                  value={ipData.abuseScore} 
                  label="Abuse Score"
                  size={80}
                  strokeWidth={6}
                  colorClass={getRiskColor(ipData.abuseScore)}
                  icon={Activity}
                />
              </div>

              {/* Additional Score Bars */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <AnimatedBar 
                  value={ipData.riskScore} 
                  label="Threat Level"
                  colorClass={getRiskColor(ipData.riskScore)}
                  delay={100}
                />
                <AnimatedBar 
                  value={ipData.anonymityScore} 
                  label="Privacy Score"
                  colorClass={getRiskColor(ipData.anonymityScore)}
                  delay={200}
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-y border-border">
                <DataRow icon={Server} label="ISP" value={ipData.isp} delay={100} />
                <DataRow icon={Network} label="ASN" value={ipData.asn} delay={150} />
                <DataRow icon={Cpu} label="Org" value={ipData.org} delay={200} />
                <DataRow icon={Radio} label="Type" value={ipData.connectionType} delay={250} />
                <DataRow icon={Database} label="Usage" value={ipData.usageType} delay={300} />
                <DataRow icon={Clock} label="Timezone" value={ipData.timezone.split('/')[1]} delay={350} />
              </div>

              {/* Detection Indicators */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <Fingerprint className="w-3 h-3" />
                  Detection Flags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isVPN ? 'bg-warning/20 text-warning border-warning/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    {ipData.isVPN ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    VPN
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isProxy ? 'bg-warning/20 text-warning border-warning/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    <Server className="w-3 h-3" />
                    Proxy
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isTor ? 'bg-danger/20 text-danger border-danger/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    <Globe className="w-3 h-3" />
                    Tor
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isBot ? 'bg-danger/20 text-danger border-danger/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    <Cpu className="w-3 h-3" />
                    Bot
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isHosting ? 'bg-info/20 text-info border-info/30' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    <Database className="w-3 h-3" />
                    Hosting
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${
                    ipData.isResidential ? 'bg-success/20 text-success border-success/30' : 'bg-secondary/50 text-muted-foreground border-border'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    Residential
                  </span>
                </div>
              </div>

              {/* Status Line */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-success" />
                  Analysis complete
                </span>
                <span>Powered by 5+ threat intel sources</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Input Section */}
        <div className="border-t border-border p-4 bg-card/50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-success">❯</span>
              <span className="font-medium">risksignal</span>
              <span className="text-muted-foreground">check --ip</span>
            </div>
            <Input
              type="text"
              placeholder="Enter IP address (e.g., 8.8.8.8, 1.1.1.1)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="bg-background border-border font-mono text-sm h-10 focus:border-foreground/50 transition-colors"
            />
            <Button 
              type="submit" 
              variant="hero" 
              size="sm" 
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Check IP Address
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IPLookupDemo;
