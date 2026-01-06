import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Globe, ShieldAlert, Cpu, Activity, Map, Lock, Server, AlertTriangle, ExternalLink, Clock, Terminal } from "lucide-react";
import { toast } from "sonner";
import SEOContent from "@/components/SEOContent";

import { supabase } from "@/lib/supabase";
import ThreatMap from "@/components/ThreatMap";
import { useThreatFeed } from "@/hooks/useThreatFeed";
import Meta from "@/components/Meta";
import { motion, AnimatePresence } from "framer-motion";
import { AsmService } from "@/lib/asm-service";
import { classifyExposure } from "@/lib/taxonomy";
import DiscoveryTimeline from "@/components/DiscoveryTimeline";
import DiscoveryTacticalSidebar from "@/components/DiscoveryTacticalSidebar";
import ThreatIntelligenceFeed from "@/components/ThreatIntelligenceFeed";

const Discovery = () => {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [isRiskyUser, setIsRiskyUser] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isVerifyingHuman, setIsVerifyingHuman] = useState(false);
    const [needsHumanVerification, setNeedsHumanVerification] = useState(false);
    const turnstileWidgetId = useRef<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAggressive, setIsAggressive] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
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
        const savedHistory = localStorage.getItem('discovery_search_history');

        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
                if (savedQuery) setQuery(savedQuery);
            } catch (e) { console.error("Restore state failed", e); }
        }

        if (savedHistory) {
            try { setSearchHistory(JSON.parse(savedHistory)); }
            catch (e) { console.error("Failed to load history", e); }
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

            const { data, error } = await supabase.functions.invoke('deep-intel', {
                body: {
                    query: query.trim(),
                    type,
                    is_aggressive: isAggressive
                }
            });

            if (error) throw error;
            setResult(data);

            const rootDomain = type === 'domain' ? query.trim().split('.').slice(-2).join('.') : null;

            if (rootDomain) {
                const org = await AsmService.getOrCreateOrganization(rootDomain);
                if (org) {
                    const assetId = await AsmService.trackAsset({
                        org_id: org.id,
                        asset_type: type,
                        value: query.trim(),
                        ownership_confidence: 100,
                        metadata_json: { target: query.trim() }
                    });

                    if (assetId && data.network_context?.resolved_ip) {
                        const ipAssetId = await AsmService.trackAsset({
                            org_id: org.id,
                            asset_type: 'ip',
                            value: data.network_context.resolved_ip,
                            ownership_confidence: 90,
                            metadata_json: { ip: data.network_context.resolved_ip }
                        });

                        if (ipAssetId) {
                            await AsmService.linkAssets(assetId, ipAssetId, 'hosted_on');
                        }
                    }

                    if (assetId) {
                        await AsmService.discoverRelatedArtifacts(org.id, data, assetId);
                    }

                    // 5. Use Taxonomy to classify exposures (General & Taxonomy-based)
                    if (assetId) {
                        (data.technical?.ports || []).forEach(async (p: any) => {
                            const taxonomy = classifyExposure(p.port, p.banner, data.technical);
                            if (taxonomy) {
                                await AsmService.recordExposure({
                                    asset_id: assetId,
                                    taxonomy_id: taxonomy.id,
                                    severity: taxonomy.severity,
                                    confidence: 100,
                                    status: 'detected',
                                    description: taxonomy.description,
                                    remediation_steps: taxonomy.remediation
                                });
                            }
                        });

                        if (data.summary?.risk_score > 60) {
                            await AsmService.recordExposure({
                                asset_id: assetId,
                                taxonomy_id: 'EXP-GEN-RISK',
                                severity: data.summary.risk_level,
                                confidence: 80,
                                status: 'detected'
                            });
                        }
                    }
                }
            }

            const cleanQuery = query.trim();
            const updatedHistory = [cleanQuery, ...searchHistory.filter(h => h !== cleanQuery)].slice(0, 10);
            setSearchHistory(updatedHistory);
            localStorage.setItem('discovery_search_history', JSON.stringify(updatedHistory));
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Failed to analyze target. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySearch = (query: string) => {
        setQuery(query);
        // We'll trigger the search in a brief timeout to ensure state has updated if needed, 
        // though handleSearch will use the local query if we call it directly with an event.
        // Actually, let's just make a refined search function or call a version of it.
        const mockEvent = { preventDefault: () => { } } as React.FormEvent;
        // Small delay to ensure state setQuery is visible if we were to use the state query
        setTimeout(() => {
            const formElement = document.querySelector('form');
            if (formElement) formElement.requestSubmit();
        }, 100);
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
                title="Discovery Hub | Real-time Global Threat Intelligence"
                description="Live threat visualization and real-time IP telemetry tracker. Analyze global botnet activity, malicious IP signatures, and infrastructure reputation in a high-fidelity tactical interface."
                keywords="threat discovery, botnet tracker, real-time cyber threats, malicious ip map, internet telemetry, attack visualization, reputation intelligence"
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
                            <div className="mt-4 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Real-time DNS</span>
                                    <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Threat Feeds</span>
                                    <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> Behavioral Analysis</span>
                                </div>

                                <div className="flex flex-col items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl max-w-sm w-full transition-all hover:bg-orange-500/10">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={`w-4 h-4 ${isAggressive ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Aggressive Discovery</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAggressive(!isAggressive)}
                                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isAggressive ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/10'}`}
                                        >
                                            <motion.div
                                                animate={{ x: isAggressive ? 20 : 2 }}
                                                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>
                                    {isAggressive && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="text-[9px] text-orange-500/80 font-mono text-center leading-tight uppercase"
                                        >
                                            ⚠️ Warning: Aggressive discovery may trigger IDS systems.
                                            Use with explicit owner consent.
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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

                {result && !needsHumanVerification && (
                    <section className="container max-w-5xl px-4 mb-20 relative z-10">
                        <div className="border border-panel-border rounded-2xl overflow-hidden shadow-2xl bg-app-bg relative z-[1]">
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

                            {/* Analysis Body: Timeline-First Architecture */}
                            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border bg-black/20">
                                {/* MAIN TIMELINE (2/3) */}
                                <div className="lg:col-span-2 p-6 md:p-8 space-y-6 overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="flex items-center gap-2 text-sm font-black text-foreground uppercase tracking-widest">
                                            <Clock className="w-4 h-4 text-info" />
                                            Target Timeline
                                        </h3>
                                        <div className="px-2 py-0.5 rounded bg-info/10 border border-info/20 text-[10px] font-mono text-info">
                                            REAL-TIME FORENSICS
                                        </div>
                                    </div>

                                    <DiscoveryTimeline
                                        version={result?.snapshot_version || 1}
                                        changes={result?.changes || []}
                                        findings={result?.risk_findings || []}
                                    />
                                </div>

                                {/* CONTEXTUAL DATA (1/3) */}
                                <div className="p-6 md:p-8 space-y-8 bg-black/40">
                                    {/* Tech Stack */}
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest opacity-60">
                                            <Cpu className="w-4 h-4" />
                                            Technology Stack
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(result?.technical?.tech_stack || []).map((tech: any, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-foreground hover:bg-info/10 transition-colors">
                                                    {typeof tech === 'string' ? tech : tech.name}
                                                </span>
                                            ))}
                                            {(!result?.technical?.tech_stack || result.technical.tech_stack.length === 0) && (
                                                <span className="text-xs italic text-muted-foreground">None detected</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Network Context */}
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest opacity-60">
                                            <Activity className="w-4 h-4" />
                                            Live Network
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                                                <span className="text-muted-foreground uppercase tracking-tighter">Resolved IP</span>
                                                <span className="font-mono text-foreground font-bold">{result?.network_context?.resolved_ip || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                                                <span className="text-muted-foreground uppercase tracking-tighter">WAF Profile</span>
                                                <span className={`font-mono px-2 py-0.5 rounded text-[9px] font-black ${result?.technical?.waf?.detected ? 'bg-success/20 text-success border border-success/30' : 'bg-muted text-muted-foreground'}`}>
                                                    {result?.technical?.waf?.detected ? result.technical.waf.provider : "DIRECT ORIGIN"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-2">
                                                <span className="text-muted-foreground uppercase tracking-tighter">Anonymity</span>
                                                <span className={`font-mono text-[9px] font-black uppercase ${result?.network_context?.anonymity_detectors?.is_tor || result?.network_context?.anonymity_detectors?.is_vpn ? 'text-warning' : 'text-success'}`}>
                                                    {result?.network_context?.anonymity_detectors?.is_tor ? 'TOR_EXIT' :
                                                        result?.network_context?.anonymity_detectors?.is_vpn ? 'VPN_PROXY' : 'CLEAN_RESIDENTIAL'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reputation Sources */}
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest opacity-60">
                                            <Lock className="w-4 h-4" />
                                            Trust Nodes
                                        </h3>
                                        <div className="space-y-2">
                                            {(result?.reputation_intel?.reputation_sources || []).map((src: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/10">
                                                    <span className="text-[10px] font-bold text-foreground truncate max-w-[100px]">{src.source}</span>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${src.status === 'clean' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                                        {src.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
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

                                <ThreatIntelligenceFeed events={events.map(ev => ({
                                    id: ev.id,
                                    target: ev.target,
                                    type: ev.type as any,
                                    source: ev.source,
                                    timestamp: new Date().toISOString(), // Fallback if missing
                                    label: `Observed ${ev.type} activity from ${ev.target}`
                                }))} />
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

            <DiscoveryTacticalSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                history={searchHistory}
                onHistoryClick={handleHistorySearch}
                stats={stats}
            />

            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 left-6 lg:hidden w-14 h-14 bg-success text-black rounded-full shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center z-[90] active:scale-95 transition-transform border-4 border-background"
            >
                <Terminal className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-info rounded-full border-2 border-background animate-pulse" />
            </button>
        </div>
    );
};

export default Discovery;
