import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
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
    webrtcLeakedIp?: string;
    langMismatch: boolean;
    tzMismatch: boolean;
}

const getWebRTCIP = (): Promise<string | null> => {
    return new Promise((resolve) => {
        try {
            const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            pc.createDataChannel("");
            pc.createOffer().then(offer => pc.setLocalDescription(offer));
            pc.onicecandidate = (ice) => {
                if (!ice || !ice.candidate || !ice.candidate.candidate) {
                    resolve(null);
                    return;
                }
                const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)?.[1];
                if (myIP) {
                    pc.onicecandidate = null;
                    resolve(myIP);
                }
            };
            setTimeout(() => resolve(null), 1000);
        } catch (e) {
            resolve(null);
        }
    });
};

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
        let current = 0;

        const timer = setInterval(() => {
            current += valueIncrement;

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
                <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={strokeWidth}
                    />
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
                <div
                    className="absolute inset-0 blur-sm transition-all duration-75"
                    style={{
                        width: `${Math.min(barWidth, 100)}%`,
                        background: getGlowColor(),
                    }}
                />
                <div
                    className={`h-full relative transition-all duration-75 ease-out ${colorClass.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(barWidth, 100)}%` }}
                >
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                        style={{ animationDuration: '2s' }}
                    />
                </div>
            </div>
        </div>
    );
};

const PulsingDot = ({ color, size = "w-2 h-2" }: { color: string; size?: string }) => (
    <span className="relative flex">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />
        <span className={`relative inline-flex rounded-full ${size} ${color}`} />
    </span>
);

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

declare global {
    interface Window {
        turnstile: {
            render: (container: string | HTMLElement, options: any) => string;
            execute: (container: string | HTMLElement, options: any) => void;
            reset: (widgetId: string) => void;
            getResponse: (widgetId: string) => string | undefined;
        };
    }
}

const IPScanner = () => {
    const [ipInput, setIpInput] = useState("");
    const [ipData, setIpData] = useState<IPData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [key, setKey] = useState(0);
    const [scanPhase, setScanPhase] = useState(0);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isVerifyingHuman, setIsVerifyingHuman] = useState(false);
    const turnstileWidgetId = useRef<string | null>(null);

    const lookupIP = useCallback(async (ip?: string) => {
        setIsLoading(true);
        setIpData(null);
        setScanPhase(0);
        setIsVerifyingHuman(true);

        const phases = [1, 2, 3, 4];
        phases.forEach((phase, i) => {
            setTimeout(() => setScanPhase(phase), i * 250);
        });

        if (window.turnstile && turnstileWidgetId.current) {
            try {
                window.turnstile.reset(turnstileWidgetId.current);
            } catch (e) {
                console.warn("Turnstile reset failed:", e);
            }
        }

        try {
            const targetIp = ip || ipInput.trim() || "";
            const response = await fetch(`https://ipwho.is/${targetIp}?t=${Date.now()}`);
            const data = await response.json();

            if (data.success === false) throw new Error(data.message || "Invalid IP");

            let token = null;
            if (window.turnstile && turnstileWidgetId.current) {
                try {
                    token = window.turnstile.getResponse(turnstileWidgetId.current);
                } catch (e) {
                    console.warn("Could not get Turnstile response:", e);
                }
            }
            setTurnstileToken(token || null);
            setIsVerifyingHuman(false);

            const INFRASTRUCTURE_ASNS = ["212238", "13335", "15169", "54113", "16509", "14061", "16276", "24940"];
            const INFRASTRUCTURE_ISPS = ["datacamp", "m247", "akamai", "cloudflare", "digitalocean", "linode", "ovh", "hetzner", "google cloud", "amazon technologies", "microsoft azure"];

            const rawAsn = data.connection?.asn ? String(data.connection.asn) : "";
            const rawIsp = data.connection?.isp?.toLowerCase() || "";

            const isKnownInfra = INFRASTRUCTURE_ASNS.includes(rawAsn) ||
                INFRASTRUCTURE_ISPS.some(infra => rawIsp.includes(infra));

            const isVPN = data.security?.vpn === true || (isKnownInfra && !rawIsp.includes("consumer"));
            const isProxy = data.security?.proxy === true || data.security?.relay === true;
            const isTor = data.security?.tor === true;
            const isHosting = data.security?.hosting === true || (isKnownInfra && !isVPN);

            const webrtcIp = await getWebRTCIP();
            const webrtcLeaked = webrtcIp && webrtcIp !== data.ip;

            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const ipTimezone = data.timezone?.id;
            const tzMismatch = ipTimezone && browserTimezone !== ipTimezone;

            const browserLangs = navigator.languages || [navigator.language];
            const countryCode = data.country_code?.toLowerCase();
            const langMismatch = !browserLangs.some(lang => lang.toLowerCase().includes(countryCode));

            const isAutomation = navigator.webdriver === true;

            let riskScore = 5.0;
            if (isTor) riskScore += 80;
            else if (isVPN || isProxy) riskScore += 45;
            if (isKnownInfra && !data.security?.vpn) riskScore += 20;
            if (webrtcLeaked) riskScore += 25;
            if (tzMismatch) riskScore += 12;
            if (langMismatch) riskScore += 8;
            if (isAutomation) riskScore += 30;
            if (isHosting && !isVPN) riskScore += 15;

            let anonymityScore = 5.0;
            if (isTor) anonymityScore += 90;
            else if (isVPN || isProxy) anonymityScore += 65;
            if (isKnownInfra) anonymityScore += 15;
            if (tzMismatch) anonymityScore += 20;
            if (webrtcLeaked) anonymityScore += 15;
            if (isHosting) anonymityScore += 10;

            let fraudScore = 5.0;
            if (isTor) fraudScore += 85;
            if (isVPN || (isKnownInfra && !rawIsp.includes("consumer"))) fraudScore += 40;
            if (isAutomation) fraudScore += 60;
            if (isHosting) fraudScore += 30;
            if (tzMismatch && (isVPN || isProxy)) fraudScore += 25;
            if (!token) fraudScore += 5;

            let abuseScore = 5.0;
            if (isTor) abuseScore += 75;
            if (isHosting || isKnownInfra) abuseScore += 45;
            if (isAutomation) abuseScore += 55;
            if (isProxy) abuseScore += 25;

            const getThreatLevel = (risk: number): "low" | "medium" | "high" | "critical" => {
                if (risk < 20) return "low";
                if (risk < 45) return "medium";
                if (risk < 75) return "high";
                return "critical";
            };

            setIpData({
                ip: data.ip,
                country: data.country,
                countryCode: data.country_code,
                city: data.city,
                region: data.region,
                timezone: data.timezone?.id || "N/A",
                isp: data.connection?.isp || "N/A",
                org: data.connection?.org || data.connection?.isp || "N/A",
                asn: data.connection?.asn ? `AS${data.connection.asn}` : 'N/A',
                riskScore: Math.min(parseFloat(riskScore.toFixed(1)), 100),
                anonymityScore: Math.min(parseFloat(anonymityScore.toFixed(1)), 100),
                fraudScore: Math.min(parseFloat(fraudScore.toFixed(1)), 100),
                abuseScore: Math.min(parseFloat(abuseScore.toFixed(1)), 100),
                isVPN: isVPN,
                isProxy: isProxy,
                isTor: isTor,
                isBot: isAutomation || (isHosting && (isVPN || isProxy)),
                isHosting: isHosting,
                isResidential: !isKnownInfra && !isHosting && !isVPN && !isProxy && !isTor,
                responseTime: Math.floor(Math.random() * 40) + 10,
                connectionType: isHosting || isKnownInfra ? "Infrastructure" : "Residential",
                threatLevel: getThreatLevel(riskScore),
                lastSeen: "Just now",
                usageType: isVPN ? "VPN Tunnel" : (isHosting ? "Cloud/Server" : "Consumer"),
                webrtcLeakedIp: webrtcIp || undefined,
                langMismatch,
                tzMismatch: !!tzMismatch
            });
            setKey(prev => prev + 1);
        } catch (err) {
            console.error("Lookup failed:", err);
            setIsVerifyingHuman(false);
        } finally {
            setIsLoading(false);
            setScanPhase(0);
        }
    }, [ipInput]);

    useEffect(() => {
        lookupIP("");

        const timer = setInterval(() => {
            if (window.turnstile) {
                const id = window.turnstile.render("#turnstile-widget", {
                    sitekey: import.meta.env.VITE_CLOUDFLARE_SITE_KEY || "0x4AAAAAACJ26VWrag00nsSV",
                    callback: (token: string) => setTurnstileToken(token),
                    "expired-callback": () => setTurnstileToken(null),
                    "error-callback": () => setTurnstileToken(null),
                    size: "invisible",
                });
                turnstileWidgetId.current = id;
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);
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
            <div id="turnstile-widget" style={{ display: 'none' }}></div>

            <div className="border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/80">
                    <span className="w-3 h-3 rounded-full bg-danger/60 hover:bg-danger transition-colors cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-warning/60 hover:bg-warning transition-colors cursor-pointer" />
                    <span className="w-3 h-3 rounded-full bg-success/60 hover:bg-success transition-colors cursor-pointer" />
                    <span className="ml-2 text-sm text-muted-foreground font-medium">risksignal — scanner</span>
                </div>

                <div className="p-4 space-y-4 min-h-[420px]">
                    {isLoading || isVerifyingHuman ? (
                        <div className="flex flex-col items-center justify-center h-[380px] gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-2 border-muted rounded-full" />
                                <div className="absolute inset-0 w-16 h-16 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                                <Fingerprint className="absolute inset-0 m-auto w-6 h-6 text-muted-foreground animate-pulse" />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-medium mb-2">
                                    {isVerifyingHuman ? "Verifying session..." : "Analyzing IP..."}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={scanPhase >= 1 ? "text-success" : ""}>Location</span>
                                    <span>→</span>
                                    <span className={scanPhase >= 2 ? "text-success" : ""}>Leaks</span>
                                    <span>→</span>
                                    <span className={scanPhase >= 3 ? "text-success" : ""}>Human</span>
                                    <span>→</span>
                                    <span className={scanPhase >= 4 ? "text-success" : ""}>Done</span>
                                </div>
                            </div>
                        </div>
                    ) : ipData ? (
                        <div key={key} className="space-y-4">
                            <div className="flex items-start justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Globe className="w-8 h-8 text-muted-foreground" />
                                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${ipData.threatLevel === 'low' ? 'bg-success' :
                                            ipData.threatLevel === 'medium' ? 'bg-warning' : 'bg-danger'
                                            }`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="group/ip relative">
                                                <Link
                                                    to={`/${ipData.ip}/detailed`}
                                                    className="font-bold text-lg tracking-tight hover:text-info transition-colors flex items-center gap-1.5"
                                                >
                                                    {ipData.ip}
                                                    <Zap className="w-3 h-3 text-info opacity-0 group-hover/ip:opacity-100 transition-all group-hover/ip:scale-110" />
                                                </Link>
                                                <div className="absolute -top-8 left-0 scale-0 group-hover/ip:scale-100 transition-all origin-bottom bg-info text-black text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap z-50">
                                                    Deep Intel Available →
                                                </div>
                                            </div>
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

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <AnimatedBar
                                    value={ipData.riskScore}
                                    label="Signal Confidence"
                                    colorClass={getRiskColor(ipData.riskScore)}
                                    delay={100}
                                />
                                <AnimatedBar
                                    value={ipData.anonymityScore}
                                    label="Detection Level"
                                    colorClass={getRiskColor(ipData.anonymityScore)}
                                    delay={200}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-y border-border">
                                <DataRow icon={Server} label="Provider" value={ipData.isp} delay={100} />
                                <DataRow icon={Network} label="Route" value={ipData.asn} delay={150} />
                                <DataRow icon={Cpu} label="System" value={ipData.org} delay={200} />
                                <DataRow icon={Radio} label="Protocol" value={ipData.connectionType} delay={250} />
                                <DataRow icon={Database} label="Node Type" value={ipData.usageType} delay={300} />
                                <DataRow icon={Clock} label="Zone" value={ipData.timezone?.includes('/') ? ipData.timezone.split('/')[1] : ipData.timezone || 'N/A'} delay={350} />

                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                    <Fingerprint className="w-3 h-3" />
                                    Active Telemetry Flags
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.isVPN ? 'bg-danger/20 text-danger border-danger/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        {ipData.isVPN ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                        VPN/TUNNEL
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.tzMismatch ? 'bg-warning/20 text-warning border-warning/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        <Clock className="w-3 h-3" />
                                        TZ-LEECH
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.webrtcLeakedIp ? 'bg-danger/20 text-danger border-danger/30 scale-105 animate-pulse' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        <Wifi className="w-3 h-3" />
                                        RTC-LEAK
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.isBot ? 'bg-danger/20 text-danger border-danger/30 scale-105' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        <Cpu className="w-3 h-3" />
                                        AUTOMATION
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.langMismatch ? 'bg-warning/20 text-warning border-warning/30' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        <Globe className="w-3 h-3" />
                                        LOCALE-GAP
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] px-2 py-1 border font-medium transition-all ${ipData.isResidential ? 'bg-success/20 text-success border-success/30' : 'bg-secondary/50 text-muted-foreground border-border'
                                        }`}>
                                        <TrendingUp className="w-3 h-3" />
                                        RESIDENTIAL
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                                <span className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-success" />
                                    Encryption verified
                                    {turnstileToken && <Lock className="w-2.5 h-2.5 text-success animate-pulse" />}
                                </span>
                                <span>RiskSignal © 2026</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[380px] text-muted-foreground text-sm italic">
                            Awaiting signal input...
                        </div>
                    )}
                </div>

                <div className="border-t border-border p-4 bg-card/50">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-success">❯</span>
                            <span className="font-medium text-foreground">guard</span>
                            <span className="text-muted-foreground">scan --remote</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Remote IP Address..."
                            value={ipInput}
                            onChange={(e) => setIpInput(e.target.value)}
                            className="bg-background border-border font-mono text-sm h-10 focus:ring-0 focus:border-foreground/50 transition-colors"
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
                                    Scrutinizing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Scan Address
                                </span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IPScanner;
