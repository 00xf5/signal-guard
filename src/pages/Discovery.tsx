import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, ShieldAlert, Cpu, Activity, Map, Lock, Server, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import SEOContent from "@/components/SEOContent";

import { supabase } from "@/lib/supabase";
import ThreatMap from "@/components/ThreatMap";
import { useThreatFeed } from "@/hooks/useThreatFeed";
import Meta from "@/components/Meta";
import { motion, AnimatePresence } from "framer-motion";

const Discovery = () => {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isRiskyUser, setIsRiskyUser] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isVerifyingHuman, setIsVerifyingHuman] = useState(false);
    const [needsHumanVerification, setNeedsHumanVerification] = useState(false);
    const turnstileWidgetId = useRef<string | null>(null);
    const { events, stats } = useThreatFeed();

    const discoveryJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "RiskSignal Discovery",
        "url": "https://risksignal-tau.vercel.app/discovery",
        "description": "Real-time global threat visualization and botnet telemetry tracker.",
        "applicationCategory": "SecurityApplication",
        "featureList": ["Live Threat Map", "Real-time Attack Visualizer", "Global IP Traffic Analysis"]
    };

    useEffect(() => {
        const savedResult = sessionStorage.getItem('last_scan_result');
        const savedQuery = sessionStorage.getItem('last_scan_query');
        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
                if (savedQuery) setQuery(savedQuery);
            } catch (e) { console.error("Restore state failed", e); }
        }
    }, []);

    useEffect(() => {
        if (result) {
            sessionStorage.setItem('last_scan_result', JSON.stringify(result));
            sessionStorage.setItem('last_scan_query', query);
        }
    }, [result, query]);

    // Check user risk level on mount
    useEffect(() => {
        const checkUserIP = async () => {
            try {
                const res = await fetch('https://ipwho.is/');
                const data = await res.json();

                // Risk criteria: VPN, Proxy, Tor, or Data Center
                const isRisky = data.security?.vpn || data.security?.proxy ||
                    data.security?.tor || data.security?.hosting;

                if (isRisky) {
                    console.warn("High-risk factor detected for visitor. Human verification required.");
                    setIsRiskyUser(true);
                }
            } catch (e) {
                console.error("User risk check failed", e);
            }
        };
        checkUserIP();
    }, []);

    // Initialize Turnstile if risky
    useEffect(() => {
        if (!isRiskyUser) return;

        const timer = setInterval(() => {
            if (window.turnstile) {
                const id = window.turnstile.render("#turnstile-visible-widget", {
                    sitekey: import.meta.env.VITE_CLOUDFLARE_SITE_KEY_2 || "0x4AAAAAACKHfIlCc4MrgFty",
                    callback: (token: string) => {
                        setTurnstileToken(token);
                        setNeedsHumanVerification(false);
                    },
                    "expired-callback": () => setTurnstileToken(null),
                    "error-callback": () => setTurnstileToken(null),
                    theme: "dark",
                });
                turnstileWidgetId.current = id;
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);
    }, [isRiskyUser]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        // Reset verification state if we're scanning a new target
        if (isRiskyUser && !turnstileToken) {
            setNeedsHumanVerification(true);
            toast.info("Human verification required to proceed.");
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query.trim());
            const type = isIp ? 'ip' : 'domain';

            const { data, error } = await supabase.functions.invoke('analy', {
                body: { query: query.trim(), type }
            });

            if (error) throw error;
            setResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Failed to analyze target. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'safe': return 'text-success border-success/30 bg-success/10';
            case 'suspicious': return 'text-warning border-warning/30 bg-warning/10';
            case 'high': return 'text-danger border-danger/30 bg-danger/10';
            case 'critical': return 'text-danger border-danger/50 bg-danger/20';
            default: return 'text-muted-foreground border-border bg-muted/10';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Meta
                title="Live Threat Discovery Map"
                description="Monitor global cyber threats in real-time. Track botnet activity, IP reputation spikes, and infrastructure attacks across the globe."
                keywords="Live Cyber Attack Map, Threat Intelligence, Global Botnet Tracker, Real-time Attack Visualizer, IP Reputation Live"
                jsonLd={discoveryJsonLd}
            />
            <Header />

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="relative pt-32 pb-20 px-4 overflow-hidden" style={{ position: 'relative' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-success/5 via-background to-background opacity-50" style={{ pointerEvents: 'none', zIndex: 0 }} />

                    <div className="container max-w-4xl relative z-10 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                                Scan the <span className="text-gradient">Web.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Look up IP reputation, domain intelligence, and botnet telemetry.
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-success/20 to-info/20 blur-xl opacity-20" />
                            <form onSubmit={handleSearch} className="relative flex items-center">
                                <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter IP address (e.g. 1.1.1.1) or Domain (e.g. google.com)"
                                    className="h-14 pl-12 pr-32 rounded-full border-white/10 bg-black/40 backdrop-blur-md text-lg focus:ring-success/50 transition-all shadow-2xl"
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-1.5 h-11 rounded-full px-8 bg-foreground text-background hover:bg-white/90 font-bold transition-all"
                                >
                                    {isLoading ? "Scanning..." : "Analyze"}
                                </Button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Real-time DNS</span>
                                <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Threat Feeds</span>
                                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Behavioral Analysis</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HUMAN VERIFICATION MODAL/SECTION */}
                <AnimatePresence>
                    {needsHumanVerification && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="container max-w-xl px-4 mb-20 relative z-50 mt-12"
                        >
                            <div className="bg-card border-2 border-warning/30 rounded-3xl p-10 text-center shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] backdrop-blur-3xl bg-black/40">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 border border-warning/20 mb-6">
                                    <ShieldAlert className="w-10 h-10 text-warning" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase">Verification Required</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                    Our system has flagged your connection as potentially automated. To prevent API abuse and maintain forensic integrity, please solve the challenge below to view the scan results.
                                </p>
                                <div className="flex justify-center mb-8">
                                    <div id="turnstile-visible-widget" className="min-h-[65px]"></div>
                                </div>
                                <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">
                                    RiskSignal Security Protocol v2.4
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* RESULT SECTION */}
                {result && !needsHumanVerification && (
                    <section className="container max-w-5xl px-4 mb-20 relative z-10">
                        <div className="border border-panel-border rounded-2xl overflow-hidden shadow-2xl bg-app-bg relative z-[1]">
                            {/* Summary Header */}
                            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-center border-b border-panel-border bg-panel-bg relative z-[2]">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xs font-mono text-muted-foreground bg-background border border-border px-2 py-0.5 rounded">
                                            REQ: {result?.meta?.request_id?.slice(0, 8) || 'N/A'}
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground">
                                            {result?.meta?.execution_time_ms || 0}ms
                                        </div>
                                        {result?.cached && (
                                            <div className="text-[10px] font-bold bg-info/20 text-info border border-info/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                Cached
                                            </div>
                                        )}
                                    </div>
                                    <Link to={`/${result?.meta?.target}/detailed`} className="group flex items-center gap-3">
                                        <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-foreground break-all group-hover:text-info transition-colors">
                                            {result?.meta?.target || 'Unknown'}
                                        </h2>
                                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-info opacity-0 group-hover:opacity-100 transition-all" />
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        {result?.geo_location && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground">
                                                <Map className="w-3.5 h-3.5 text-info" />
                                                {result.geo_location.city}, {result.geo_location.country_name}
                                            </span>
                                        )}
                                        {result?.network_context?.asn && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground">
                                                <Server className="w-3.5 h-3.5 text-warning" />
                                                {result.network_context.asn.organization}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground">
                                            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                                            {result?.network_context?.infrastructure_type || 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start md:items-end text-left md:text-right">
                                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
                                        Verdict
                                    </div>
                                    <div className={`flex items-center gap-4 px-6 py-3 rounded-full border bg-background ${getRiskColor(result?.summary?.risk_level || 'safe')}`}>
                                        <span className="text-2xl font-black tracking-tighter">
                                            {result?.summary?.risk_score || 0}/100
                                        </span>
                                        <div className="h-8 w-px bg-current opacity-20" />
                                        <div className="flex flex-col items-start md:items-end leading-none">
                                            <span className="font-bold text-sm uppercase">{result?.summary?.verdict_label || 'UNKNOWN'}</span>
                                            <span className="text-[10px] opacity-80 font-mono">CONFIDENCE: {result?.summary?.confidence_score || 'N/A'}</span>
                                        </div>
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            {/* Intelligence Body */}
                            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Column 1: Signals */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <ShieldAlert className="w-4 h-4 text-primary" />
                                        Signals
                                    </h3>
                                    <div className="space-y-3">
                                        {(result?.intelligence?.signals_detected || []).map((signal: string, i: number) => (
                                            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${signal.includes('CLEAN') || signal.includes('No Anomaly')
                                                ? 'bg-success/5 border-success/20 text-foreground'
                                                : 'bg-danger/5 border-danger/20 text-foreground'
                                                }`}>
                                                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${signal.includes('CLEAN') ? 'bg-success' : 'bg-danger animate-pulse'
                                                    }`} />
                                                <span className="font-mono leading-tight">{signal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Column 2: Network Context */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <Activity className="w-4 h-4 text-primary" />
                                        Network
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                            <span className="text-muted-foreground">Resolved IP</span>
                                            <span className="font-mono text-foreground">{result?.network_context?.resolved_ip || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                            <span className="text-muted-foreground">Tor Exit Node</span>
                                            <span className={`font-mono ${result?.network_context?.anonymity_detectors?.is_tor ? 'text-danger font-bold' : 'text-success'}`}>
                                                {result?.network_context?.anonymity_detectors?.is_tor ? "DETECTED" : "CLEAN"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                            <span className="text-muted-foreground">VPN / Proxy</span>
                                            <span className={`font-mono ${result?.network_context?.anonymity_detectors?.is_vpn ? 'text-warning font-bold' : 'text-success'}`}>
                                                {result?.network_context?.anonymity_detectors?.is_vpn ? "DETECTED" : "CLEAN"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                            <span className="text-muted-foreground">Timezone</span>
                                            <span className="font-mono text-foreground">{result?.geo_location?.timezone || "UTC"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 3: Reputation Sources */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                                        <Lock className="w-4 h-4 text-primary" />
                                        Reputation
                                    </h3>
                                    <div className="space-y-3">
                                        {(result?.intelligence?.reputation_sources || []).map((src: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-xs text-foreground">{src.source}</span>
                                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${src.status === 'clean' ? 'bg-success/10 text-success border-success/20' :
                                                        src.status === 'flagged' ? 'bg-danger/10 text-danger border-danger/20' :
                                                            'bg-muted text-muted-foreground border-border'
                                                        }`}>
                                                        {src.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400">{src.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* LIVE THREAT MAP SECTION */}
                <section className="py-20 border-y border-white/5 bg-black/20">
                    <div className="container px-4">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20 text-xs font-bold animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
                                LIVE GLOBAL ACTIVITY
                            </div>
                            <h2 className="text-3xl font-bold">Real-time Threat Telemetry</h2>
                        </div>

                        <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                            {/* Stats Panel */}
                            <div className="lg:col-span-1 space-y-4">
                                <div className="p-6 bg-[#09090b] rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">Network Status</div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-success">SAFE</span>
                                                <span className="text-xs font-mono text-white">{stats.safe.toLocaleString()} pts</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-success w-[85%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-warning">SUSPICIOUS</span>
                                                <span className="text-xs font-mono text-white">{stats.suspicious.toLocaleString()} pts</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-warning w-[12%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-danger">CRITICAL</span>
                                                <span className="text-xs font-mono text-white">{stats.critical.toLocaleString()} pts</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-danger w-[3%]" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 p-3 rounded-lg bg-white/5 border border-white/10">
                                        <div className="text-[10px] text-muted-foreground mb-1 uppercase">Global Heat Index</div>
                                        <div className="text-2xl font-black text-white">42.8<span className="text-sm opacity-50 ml-1">TR/s</span></div>
                                    </div>
                                </div>

                                <div className="p-4 bg-muted/20 border border-white/5 rounded-xl">
                                    <div className="text-[10px] font-mono text-muted-foreground mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" />
                                        RECENT INTELLIGENCE
                                    </div>
                                    <div className="space-y-2 h-[200px] overflow-hidden relative">
                                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                                        {events.slice(0, 10).map((ev) => (
                                            <Link
                                                key={ev.id}
                                                to={`/${ev.target}/detailed`}
                                                className="flex justify-between items-center text-[10px] py-1.5 border-b border-white/5 last:border-0 group hover:bg-white/5 transition-colors px-1"
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className={`w-1 h-1 rounded-full ${ev.source === 'local' ? 'bg-info animate-pulse' : 'bg-muted-foreground'}`} />
                                                    <span className="font-mono text-white truncate max-w-[80px]">{ev.target}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className={`text-[8px] font-bold px-1 rounded-sm border ${ev.source === 'local' ? 'border-info/30 text-info' : 'border-white/10 text-muted-foreground'
                                                        }`}>
                                                        {ev.source.toUpperCase()}
                                                    </span>
                                                    <span className={`font-bold px-1.2 rounded-sm ${ev.type === 'critical' ? 'bg-danger/20 text-danger' :
                                                        ev.type === 'suspicious' ? 'bg-warning/20 text-warning' :
                                                            'bg-success/20 text-success'
                                                        }`}>
                                                        {ev.type.toUpperCase()}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Map Container */}
                            <div className="lg:col-span-3 relative h-[500px] bg-[#09090b] rounded-3xl border border-white/10 overflow-hidden shadow-2xl group">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#09090b_90%)]" />

                                <ThreatMap events={events} />

                                <div className="absolute bottom-6 left-6 flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#09090b] bg-muted/50" />
                                            ))}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            <span className="text-white font-bold">1,824</span> analysts online
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEO CONTENT BLOCKS */}
                <section className="py-24 container px-4 max-w-4xl space-y-24">
                    {/* Block 1 */}
                    <article className="prose prose-invert max-w-none">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <Cpu className="w-8 h-8 text-success" />
                            How Our Threat Detection Works
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            RiskSignal utilizes a hybrid detection engine that combines <strong>heuristic analysis</strong> with real-time threat feeds. Unlike traditional static blocklists, our system actively interrogates the connection characteristics, including <strong>TLS fingerprinting</strong>, <strong>packet timing analysis</strong>, and <strong>autonomous system (ASN) reputation</strong>.
                        </p>
                        <div className="grid md:grid-cols-2 gap-6 mt-8 not-prose">
                            <div className="p-6 bg-card border border-border rounded-xl">
                                <h3 className="font-bold text-foreground mb-2">Behavioral Biometrics</h3>
                                <p className="text-sm text-muted-foreground">We analyze interaction patterns to distinguish between human users and automated scripts (bots), even those using stealth plugins.</p>
                            </div>
                            <div className="p-6 bg-card border border-border rounded-xl">
                                <h3 className="font-bold text-foreground mb-2">Infrastructure Fingerprinting</h3>
                                <p className="text-sm text-muted-foreground">Our engine instantly identifies datacenter IPs (AWS, DigitalOcean) attempting to mask themselves as residential users.</p>
                            </div>
                        </div>
                    </article>

                    {/* Block 2 */}
                    <article className="prose prose-invert max-w-none">
                        <h2 className="text-3xl font-bold mb-6">Why Residential Proxies Are Dangerous</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Cybercriminals increasingly use <strong>Residential Proxies</strong>—infected home devices that route malicious traffic. Because these IPs belong to legitimate ISPs like Comcast or Verizon, they often bypass standard firewalls. RiskSignal specializes in detecting these "wolf in sheep's clothing" attacks by analyzing the <strong>TCP/IP stack consistency</strong> and correlation with known botnet command-and-control (C2) servers.
                        </p>
                    </article>

                    {/* FAQ / Schema Section (Hidden from visual clutter but visible to bots/users) */}
                    <div className="border-t border-border pt-12">
                        <SEOContent />
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default Discovery;
