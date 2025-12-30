import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Globe, Server, MapPin, Clock, Wifi, AlertTriangle, CheckCircle } from "lucide-react";

interface IPData {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  org: string;
  riskScore: number;
  anonymityScore: number;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isBot: boolean;
  responseTime: number;
}

const mockIPDatabase: Record<string, IPData> = {
  "8.8.8.8": {
    ip: "8.8.8.8",
    country: "United States",
    countryCode: "US",
    city: "Mountain View",
    isp: "Google LLC",
    org: "Google Public DNS",
    riskScore: 12,
    anonymityScore: 5.2,
    isVPN: false,
    isProxy: false,
    isTor: false,
    isBot: false,
    responseTime: 23,
  },
  "1.1.1.1": {
    ip: "1.1.1.1",
    country: "Australia",
    countryCode: "AU",
    city: "Sydney",
    isp: "Cloudflare, Inc.",
    org: "APNIC and Cloudflare DNS",
    riskScore: 8,
    anonymityScore: 3.7,
    isVPN: false,
    isProxy: false,
    isTor: false,
    isBot: false,
    responseTime: 31,
  },
  "185.220.101.1": {
    ip: "185.220.101.1",
    country: "Germany",
    countryCode: "DE",
    city: "Frankfurt",
    isp: "Tor Exit Node",
    org: "Tor Project",
    riskScore: 94,
    anonymityScore: 98.6,
    isVPN: false,
    isProxy: false,
    isTor: true,
    isBot: false,
    responseTime: 67,
  },
};

const generateRandomIP = (): IPData => {
  const isHighRisk = Math.random() > 0.6;
  const riskScore = isHighRisk ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 35) + 5;
  const anonymityScore = isHighRisk ? Math.random() * 50 + 45 : Math.random() * 30 + 2;
  
  const countries = [
    { name: "United States", code: "US", city: "New York" },
    { name: "United Kingdom", code: "GB", city: "London" },
    { name: "Germany", code: "DE", city: "Berlin" },
    { name: "Japan", code: "JP", city: "Tokyo" },
    { name: "Canada", code: "CA", city: "Toronto" },
    { name: "France", code: "FR", city: "Paris" },
    { name: "Netherlands", code: "NL", city: "Amsterdam" },
  ];
  
  const isps = ["Comcast", "AT&T", "Verizon", "Deutsche Telekom", "BT Group", "NTT"];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const randomIsp = isps[Math.floor(Math.random() * isps.length)];
  
  return {
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: randomCountry.name,
    countryCode: randomCountry.code,
    city: randomCountry.city,
    isp: randomIsp,
    org: `${randomIsp} Services`,
    riskScore,
    anonymityScore: parseFloat(anonymityScore.toFixed(1)),
    isVPN: isHighRisk && Math.random() > 0.5,
    isProxy: isHighRisk && Math.random() > 0.7,
    isTor: isHighRisk && Math.random() > 0.85,
    isBot: Math.random() > 0.9,
    responseTime: Math.floor(Math.random() * 50) + 15,
  };
};

const AnimatedGauge = ({ 
  value, 
  label, 
  isPercentage = false,
  colorClass 
}: { 
  value: number; 
  label: string; 
  isPercentage?: boolean;
  colorClass: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    setDisplayValue(0);
    setBarWidth(0);
    
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
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold tabular-nums ${colorClass}`}>
          {isPercentage ? `${displayValue.toFixed(1)}%` : displayValue.toFixed(0)}
        </span>
      </div>
      <div className="h-2 bg-secondary overflow-hidden">
        <div 
          className={`h-full transition-all duration-75 ease-out ${colorClass.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>
    </div>
  );
};

const IPLookupDemo = () => {
  const [ipInput, setIpInput] = useState("");
  const [ipData, setIpData] = useState<IPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);

  const lookupIP = useCallback((ip?: string) => {
    setIsLoading(true);
    setIpData(null);
    
    setTimeout(() => {
      const lookupIp = ip || ipInput.trim();
      const data = mockIPDatabase[lookupIp] || generateRandomIP();
      if (lookupIp && !mockIPDatabase[lookupIp]) {
        data.ip = lookupIp;
      }
      setIpData(data);
      setKey(prev => prev + 1);
      setIsLoading(false);
    }, 800);
  }, [ipInput]);

  useEffect(() => {
    lookupIP("8.8.8.8");
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-success";
    if (score < 60) return "text-warning";
    return "text-danger";
  };

  const getAnonymityColor = (score: number) => {
    if (score < 20) return "text-success";
    if (score < 50) return "text-warning";
    return "text-danger";
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
      <div className="border border-border bg-card">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <span className="w-3 h-3 rounded-full bg-danger/60" />
          <span className="w-3 h-3 rounded-full bg-warning/60" />
          <span className="w-3 h-3 rounded-full bg-success/60" />
          <span className="ml-2 text-sm text-muted-foreground">risksignal — live demo</span>
          <div className="ml-auto flex items-center gap-2">
            <Wifi className="w-3 h-3 text-success" />
            <span className="text-xs text-success">LIVE</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="p-4 space-y-4 min-h-[280px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[240px]">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Analyzing IP address...</span>
              </div>
            </div>
          ) : ipData ? (
            <div key={key} className="space-y-4 animate-fade-in">
              {/* IP Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-bold text-lg">{ipData.ip}</div>
                    <div className="text-xs text-muted-foreground">{ipData.city}, {ipData.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{ipData.responseTime}ms</span>
                  </div>
                </div>
              </div>

              {/* Risk & Anonymity Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <AnimatedGauge 
                    value={ipData.riskScore} 
                    label="Risk Score"
                    colorClass={getRiskColor(ipData.riskScore)}
                  />
                </div>
                <div className="space-y-1">
                  <AnimatedGauge 
                    value={ipData.anonymityScore} 
                    label="Anonymity"
                    isPercentage
                    colorClass={getAnonymityColor(ipData.anonymityScore)}
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">ISP</div>
                    <div className="truncate max-w-[120px]">{ipData.isp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div>{ipData.countryCode}</div>
                  </div>
                </div>
              </div>

              {/* Threat Indicators */}
              <div className="flex flex-wrap gap-2 pt-2">
                {ipData.isVPN && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-warning/20 text-warning border border-warning/30">
                    <Shield className="w-3 h-3" /> VPN
                  </span>
                )}
                {ipData.isProxy && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-warning/20 text-warning border border-warning/30">
                    <AlertTriangle className="w-3 h-3" /> Proxy
                  </span>
                )}
                {ipData.isTor && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-danger/20 text-danger border border-danger/30">
                    <AlertTriangle className="w-3 h-3" /> Tor Exit
                  </span>
                )}
                {ipData.isBot && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-danger/20 text-danger border border-danger/30">
                    <AlertTriangle className="w-3 h-3" /> Bot
                  </span>
                )}
                {!ipData.isVPN && !ipData.isProxy && !ipData.isTor && !ipData.isBot && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-success/20 text-success border border-success/30">
                    <CheckCircle className="w-3 h-3" /> Clean
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Input Section */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-foreground">$</span>
              <span>risksignal check</span>
            </div>
            <Input
              type="text"
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="bg-background border-border font-mono text-sm"
            />
            <Button 
              type="submit" 
              variant="hero" 
              size="sm" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Check IP"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IPLookupDemo;
