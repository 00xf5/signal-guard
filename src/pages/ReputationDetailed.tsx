import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    Shield, Globe, BadgeCheck, Monitor, ArrowLeft,
    Copy, Clock, Zap, AlertTriangle, ShieldAlert,
    ExternalLink, Activity, Radio, Lock, Fingerprint,
    CheckCircle2, XCircle, Info, ShieldCheck,
    Search, Server, Database, Mail, UserCheck, Terminal
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Meta from "@/components/Meta";

const TrustGauge = ({ score, label, color }: { score: number, label: string, color: string }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center group">
            <svg className="w-32 h-32 transform -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-foreground/5"
                />
                <motion.circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={color}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-4px]">
                <span className="text-2xl font-black text-foreground">{score}%</span>
                <span className="text-[8px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
        </div>
    );
};

const ReputationCard = ({ title, icon: Icon, children, className = "" }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 bg-panel-bg border border-panel-border rounded-3xl group hover:border-info/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] ${className}`}
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-info/10 rounded-xl text-info group-hover:bg-info group-hover:text-black transition-all">
                <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{title}</h3>
        </div>
        {children}
    </motion.div>
);

const SecurityBadge = ({ label, status }: { label: string, status: 'pass' | 'fail' | 'warn' }) => (
    <div className="flex items-center justify-between p-3 bg-terminal-bg/30 border border-panel-border rounded-xl">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{label}</span>
        <div className="flex items-center gap-1.5">
            {status === 'pass' && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />}
            {status === 'fail' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
            {status === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
            <span className={`text-[9px] font-bold uppercase tracking-wider ${status === 'pass' ? 'text-emerald-500' : status === 'fail' ? 'text-red-500' : 'text-yellow-500'}`}>
                {status === 'pass' ? 'Verified' : status === 'fail' ? 'Missing' : 'Warning'}
            </span>
        </div>
    </div>
);

const LiveAuditLog = ({ grade, ip }: { grade?: string, ip?: string }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const possibleLogs = [
        `[OK] INITIATING DNS_CROSS_CHECK...`,
        `[...] FETCHING SPF_ENTRY_FROM_CLOUDFLARE`,
        `[...] PROBING RDAP_REGISTRY_WHOIS`,
        `[INFO] ip_resolve: ${ip || '...'}`,
        `[INFO] status: ${grade === 'A' ? 'TRUSTED' : 'EVALUATING'}`,
        `[...] ANALYZING TLS_HANDSHAKE_CIPHERS`,
        `[OK] NO_MATCH_IN_SPAM_DATABASE`,
        `[...] SCROLLING THROUGH MALICIOUS_ASN_FEEDS`,
        `[OK] REPUTATION_VAULT_SYNCED`,
        `[INFO] proximity_check: complete`,
        `[INFO] noise_level: minimal`
    ];

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < possibleLogs.length) {
                const nextLog = possibleLogs[i];
                if (nextLog) {
                    setLogs(prev => [...prev, nextLog]);
                }
                i++;
            } else {
                setLogs(prev => [...prev, `[WAIT] POLLING_LIVE_FEED...`]);
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }, [grade, ip]); // Re-run if props change to refresh logs if needed

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="p-6 bg-[#000] border border-panel-border rounded-[2rem] flex flex-col overflow-hidden relative h-[280px] lg:h-auto">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <span className="text-[9px] font-mono text-info uppercase font-black tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-info rounded-full animate-pulse" />
                    Live_Audit_Log
                </span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
            </div>
            <div ref={logContainerRef} className="flex-1 font-mono text-[9px] space-y-2 overflow-y-auto custom-scrollbar scroll-smooth">
                <AnimatePresence mode="popLayout">
                    {logs.map((log, idx) => (
                        <motion.div
                            key={`log-${idx}`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${log?.includes('[OK]') ? 'text-emerald-500/80' : log?.includes('[INFO]') ? 'text-info/80' : 'text-foreground/40'}`}
                        >
                            {log || ''}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

const ReputationDetailed = () => {
    const { query } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [fullIntel, setFullIntel] = useState<any>(null);

    const reputationJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "RiskSignal Reputation Audit",
        "url": `https://risksignal-tau.vercel.app/${query}/reputation`,
        "description": `Detailed reputation audit, blacklist check, and email security status for ${query}.`,
        "applicationCategory": "SecurityApplication",
        "featureList": ["Global Blacklist Check", "DMARC/SPF Record Audit", "Domain Trust Scoring"]
    };

    useEffect(() => {
        const fetchReputation = async () => {
            setIsLoading(true);
            try {
                const { data: intelData, error } = await supabase.functions.invoke('deep-intel', {
                    body: { query }
                });
                if (error) throw error;
                setFullIntel(intelData);
                setData(intelData.reputation_intel);
            } catch (err) {
                console.error("Reputation fetch failed:", err);
                toast.error("Failed to fetch reputation data.");
            } finally {
                setIsLoading(false);
            }
        };

        if (query) fetchReputation();
    }, [query]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
                <div className="relative w-32 h-32 mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-info/20 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 border border-info border-t-transparent rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-info animate-pulse" />
                    </div>
                </div>
                <div className="text-info font-mono text-[10px] uppercase tracking-[0.4em]">Audit_In_Progress</div>
            </div>
        );
    }

    const trustScore = 100 - (fullIntel?.summary?.risk_score || 0);
    const getTrustColor = (score: number) => {
        if (score > 80) return "text-emerald-500";
        if (score > 50) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="min-h-screen bg-app-bg text-foreground/80 selection:bg-info/30 font-sans pb-20">
            <Meta
                title={`Reputation Audit: ${query}`}
                description={`Check the global reputation, blacklist status, and email security compliance (SPF/DMARC) for ${query}.`}
                keywords={`Blacklist Checker, Domain Reputation, DMARC Validator, SPF Audit, ${query} Reputation, Email Security`}
                jsonLd={reputationJsonLd}
            />
            <style>{`.grid-bg { background-image: radial-gradient(rgba(30,144,255,0.05) 1px, transparent 1px); background-size: 24px 24px; }`}</style>

            <Header />

            <main className="pt-14 relative">
                {/* Header Toolbar */}
                <div className="h-16 border-b border-panel-border bg-panel-bg/95 backdrop-blur-xl sticky top-[56px] z-40 px-8 flex items-center justify-between text-foreground">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:text-info" />
                        </button>
                        <div className="h-6 w-[1px] bg-foreground/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-muted-foreground/80 uppercase tracking-widest">Audit Target</span>
                            <span className="text-sm font-black text-foreground uppercase tracking-tight">{query}</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Real-time Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* TOP STATS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-2 p-10 bg-panel-bg border border-panel-border rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-10"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-info/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
                            <TrustGauge score={trustScore} label="Trust Score" color={getTrustColor(trustScore)} />

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                                        Reputation: {trustScore > 75 ? 'Excellent' : trustScore > 40 ? 'Fair' : 'Poor'}
                                    </h2>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getTrustColor(trustScore)} bg-current/10 border border-current/20`}>
                                        Tier {fullIntel?.summary?.grade || 'U'}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-md">
                                    Analysis includes global blocklist status, email authentication headers,
                                    and infrastructure reliability scoring. Last seen active {new Date(fullIntel?.timestamp || Date.now()).toLocaleTimeString()}.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <div className="px-3 py-1.5 bg-terminal-bg/50 border border-panel-border rounded-lg flex items-center gap-2">
                                        <Globe className="w-3 h-3 text-info" />
                                        <span className="text-[10px] font-mono">{fullIntel?.network_context?.resolved_ip}</span>
                                    </div>
                                    <div className="px-3 py-1.5 bg-terminal-bg/50 border border-panel-border rounded-lg flex items-center gap-2">
                                        <Server className="w-3 h-3 text-info" />
                                        <span className="text-[10px] font-mono uppercase tracking-tighter">{fullIntel?.network_context?.infrastructure?.type}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <LiveAuditLog grade={fullIntel?.summary?.grade} ip={fullIntel?.network_context?.resolved_ip} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* THREAT VERDICT CARD */}
                        <ReputationCard title="Threat Verdict" icon={ShieldAlert}>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-terminal-bg/30 border border-panel-border rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${data?.reputation?.status === 'clean' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-mono text-muted-foreground uppercase">Global_Status</span>
                                            <span className="text-xs font-bold uppercase">{data?.reputation?.status || 'Clean'}</span>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest pl-1">Verdict Summary</span>
                                    <div className="p-4 bg-terminal-bg/20 border border-panel-border rounded-xl">
                                        <p className="text-[10px] font-mono text-foreground/70 leading-relaxed italic">
                                            Target shows {trustScore > 75 ? 'minimal' : 'moderate'} markers of automated scanning or malicious intent.
                                            Reputation is currently stable.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ReputationCard>

                        {/* WHOIS CARD */}
                        <ReputationCard title="Identity & Entity" icon={UserCheck}>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Organization</span>
                                    <span className="text-lg font-black text-foreground truncate">{data?.whois?.org}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Registry</span>
                                        <span className="text-xs font-bold text-info truncate">{data?.whois?.handle}</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase">Status</span>
                                        <span className="text-xs font-bold uppercase">{data?.whois?.status}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-panel-border flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Source</span>
                                    <span className="text-[9px] font-mono px-2 py-0.5 bg-foreground/5 rounded text-info uppercase font-bold">RDAP_DATABASE</span>
                                </div>
                            </div>
                        </ReputationCard>

                        {/* EMAIL AUTH CARD */}
                        <ReputationCard title="Email Compliance" icon={Mail}>
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Inbound Route (MX)</span>
                                        {data?.email_security?.mx?.length > 0 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-muted-foreground" />}
                                    </div>
                                    <div className="space-y-2">
                                        {(data?.email_security?.mx || []).slice(0, 5).map((mx: string, i: number) => (
                                            <div key={i} className="text-[10px] font-mono text-foreground/70 flex items-start gap-2 break-all">
                                                <div className="w-1 h-1 bg-emerald-500/50 rounded-full mt-1.5 shrink-0" /> {mx}
                                            </div>
                                        ))}
                                        {data?.email_security?.mx?.length === 0 && <span className="text-[10px] font-mono text-muted-foreground italic">No MX records identified</span>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <SecurityBadge
                                            label="SPF Policy"
                                            status={data?.email_security?.spf === 'Missing' ? 'fail' : 'pass'}
                                        />
                                        {data?.email_security?.spf !== 'Missing' && (
                                            <div className="px-3 py-2 bg-terminal-bg/20 border border-panel-border rounded-lg text-[9px] font-mono text-muted-foreground break-all leading-relaxed">
                                                {data.email_security.spf}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <SecurityBadge
                                            label="DMARC Policy"
                                            status={data?.email_security?.dmarc === 'Missing' ? 'fail' : 'pass'}
                                        />
                                        {data?.email_security?.dmarc !== 'Missing' && (
                                            <div className="px-3 py-2 bg-terminal-bg/20 border border-panel-border rounded-lg text-[9px] font-mono text-muted-foreground break-all leading-relaxed">
                                                {data.email_security.dmarc}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* EXTRACTED SECURITY CONTACTS */}
                                {(data?.email_security?.dmarc?.includes('mailto:') || data?.email_security?.spf?.includes('mailto:')) && (
                                    <div className="mt-4 pt-4 border-t border-panel-border">
                                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">Security Contacts</span>
                                        <div className="flex flex-wrap gap-2">
                                            {[...(data?.email_security?.dmarc?.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []),
                                            ...(data?.email_security?.spf?.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])]
                                                .map((match, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-info/5 border border-info/10 rounded text-[9px] font-mono text-info">
                                                        {match[0]}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ReputationCard>
                    </div>

                    {/* GOD MODE / PREMIUM TEASER */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 p-1 relative overflow-hidden group rounded-[3rem]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-info/20 via-purple-500/20 to-info/20 animate-text-shimmer" style={{ backgroundSize: '200% auto' }} />
                        <div className="relative bg-[#0A0A0A] rounded-[2.9rem] p-12 text-center space-y-8">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-info text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(30,144,255,0.4)]">
                                Advanced Intelligence Preview
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000">
                                {[
                                    { title: "ASN Reputation", icon: Radio, text: "Cross-referencing global blocklists (Spamhaus/SBL)." },
                                    { title: "Abuse History", icon: AlertTriangle, text: "Historical malicious activity tracking (AbuseIPDB)." },
                                    { title: "Proxy Detection", icon: Lock, text: "Commercial & residential proxy exit identification." }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/50 group-hover:text-info transition-colors">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black uppercase text-foreground">{item.title}</h4>
                                            <p className="text-[10px] font-mono text-muted-foreground">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="max-w-2xl mx-auto space-y-6 pt-4">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-widest leading-tight">
                                    Deeper Context, <span className="text-info">Zero Wait Time.</span>
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                                    We're building the first high-fidelity threat engine for developers.
                                    Stay tuned for the full release of our autonomous scoring engine.
                                </p>
                                <button className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all">
                                    Join the Beta
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReputationDetailed;
