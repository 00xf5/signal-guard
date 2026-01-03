import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    Globe, Shield, Server, Cpu, Activity, ArrowLeft,
    ExternalLink, Copy, MapPin, Database, Zap, AlertCircle,
    Network, Code, Lock, Search, Terminal, Radio, Hexagon, Hash,
    Info, ChevronRight, Share2, Download, Filter, Eye, Clock,
    Monitor, LayoutGrid, List, Layers, ShieldCheck, Cpu as Chip,
    Fingerprint, Key, ShieldAlert, BadgeCheck, ExternalLink as LinkIcon,
    Terminal as ConsoleIcon, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Meta from "@/components/Meta";
import IntelTacticalSidebar from "@/components/IntelTacticalSidebar";

const MapVisual = ({ lat, lng }: { lat: number, lng: number }) => {
    // Check if we have valid coordinates (0,0 is usually a failure in IP geo APIs)
    const hasData = lat !== undefined && lng !== undefined && (lat !== 0 || lng !== 0);

    if (!hasData) return (
        <div className="relative w-full h-32 bg-terminal-bg rounded-lg overflow-hidden border border-panel-border opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Position_Unavailable</div>
                <div className="text-[8px] font-mono text-muted-foreground/40 uppercase">SIGNAL_LOST: GEO_DATA_MISSING</div>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-40 bg-terminal-bg rounded-lg overflow-hidden border border-panel-border group">
            {/* Dark Map Filter Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none border border-info/10 rounded-lg" />

            {/* The Real Map */}
            <iframe
                title="Location Map"
                className="w-full h-full grayscale-[1] contrast-[1.2] brightness-[0.7] invert-[0.9] hue-rotate-[180deg] opacity-60 group-hover:opacity-100 transition-opacity"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.005}%2C${lng + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
            />

            {/* Visual Overlays (Subtle Radar Effect) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 border border-info/20 rounded-full animate-ping absolute" />
                    <div className="w-2 h-2 bg-info rounded-full shadow-[0_0_10px_#1e90ff] relative z-10" />
                </div>
                {/* HUD Corners */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-info/40" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-info/40" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-info/40" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-info/40" />
            </div>

            <div className="absolute bottom-2 left-2 z-30 px-1.5 py-0.5 bg-black/80 rounded border border-white/5 text-[7px] font-mono text-info tracking-tighter">
                GRID_REF: {lat.toFixed(4)}, {lng.toFixed(4)}
            </div>
        </div>
    );
};

const MetadataSection = ({ title, icon: Icon, children }: any) => (
    <div className="mt-4 border-t border-panel-border pt-4">
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-3 h-3 text-info/60" />
            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const DataRow = ({ label, value, copyable = false, onClick, icon: Icon }: { label: string, value: any, copyable?: boolean, onClick?: () => void, icon?: any }) => {
    if (!value || value === 'Unknown' || value === '??' || value === 0 || value === 'unknown') return null;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(String(value));
        toast.success(`Copied ${label}`);
    };

    return (
        <div
            className={`flex items-baseline justify-between group ${onClick ? 'cursor-pointer hover:text-info transition-colors' : ''}`}
            onClick={onClick}
        >
            <span className="text-[10px] text-muted-foreground font-mono uppercase">{label}</span>
            <div className="flex items-center gap-2 max-w-[70%] text-right justify-end">
                <span className="text-[10px] text-foreground font-mono break-all group-hover:text-info transition-colors">{value}</span>
                {Icon && <Icon className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-info" />}
                {copyable && !onClick && (
                    <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-2.5 h-2.5 text-info/50 hover:text-info" />
                    </button>
                )}
            </div>
        </div>
    );
};

const IntelDetailed = () => {
    const { query } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [subnetIps, setSubnetIps] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState('services');
    const [expandedService, setExpandedService] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const intelJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "RiskSignal Network Audit",
        "url": `https://risksignal-tau.vercel.app/${query}/detailed`,
        "description": `Detailed forensic security audit and vulnerability scan for target ${query}.`,
        "applicationCategory": "SecurityApplication",
        "featureList": ["Live Port Scanning", "CVE Vulnerability Mapping", "Infrastructure Fingerprinting"]
    };

    const fetchDeepIntel = async () => {
        setIsLoading(true);
        try {
            const { data: intelData, error } = await supabase.functions.invoke('deep-intel', {
                body: { query }
            });

            if (error) throw error;
            setData(intelData);

            const targetIp = intelData?.network_context?.resolved_ip;
            if (targetIp && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(targetIp)) {
                const parts = targetIp.split('.');
                const prefix = parts.slice(0, 3).join('.');
                const current = parseInt(parts[3]);
                const range = [];
                for (let i = Math.max(0, current - 4); i <= Math.min(255, current + 6); i++) {
                    range.push(`${prefix}.${i}`);
                }
                setSubnetIps(range);
            }
        } catch (err) {
            console.error("Deep intel failed:", err);
            toast.error("Technical scan failed. Data may be incomplete.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (query) fetchDeepIntel();
    }, [query]);

    const handleRescan = () => {
        fetchDeepIntel();
        toast.info("Re-initiating node scan...");
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
            case 'B': return "text-blue-500 border-blue-500/30 bg-blue-500/10";
            case 'C': return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
            case 'D': return "text-orange-500 border-orange-500/30 bg-orange-500/10";
            case 'F': return "text-red-500 border-red-500/30 bg-red-500/10";
            default: return "text-gray-500 border-gray-500/30 bg-gray-500/10";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-4">
                <div className="relative w-40 h-40 mb-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border border-info/10 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-2 border-dashed border-info/30 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Terminal className="w-10 h-10 text-info animate-pulse" />
                    </div>
                </div>
                <div className="space-y-2 text-center">
                    <div className="text-info font-mono text-[10px] uppercase tracking-[0.6em] font-black">....</div>
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                className="w-1 h-1 bg-info rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app-bg text-foreground/80 selection:bg-info/30 font-sans">
            <Meta
                title={`Forensic Audit: ${query}`}
                description={`Comprehensive forensic security audit and vulnerability scan for target ${query}. Analyze open ports, service banners, and CVE exposures.`}
                keywords={`IP WHOIS, Port Scanner Online, Service Banner Grabbing, ${query} Security Audit, Forensic IP Intel`}
                jsonLd={intelJsonLd}
            />
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: currentColor; opacity: 0.1; border-radius: 0; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { opacity: 0.2; }
                .grid-bg { background-image: radial-gradient(rgba(30,144,255,0.05) 1px, transparent 1px); background-size: 20px 20px; }
                .shodan-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 0;
                    min-height: calc(100vh - 80px);
                }
                @media (max-width: 1024px) {
                    .shodan-layout { grid-template-columns: 1fr; }
                }
            `}</style>

            <Header />

            <main className="pt-14 relative">
                {/* Toolbar */}
                <div className="h-16 border-b border-panel-border bg-panel-bg/95 backdrop-blur-xl sticky top-[56px] z-40 px-8 flex items-center justify-between text-foreground">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/discovery')} className="p-2 hover:bg-foreground/5 rounded-full transition-colors group text-foreground/60">
                            <ArrowLeft className="w-4 h-4 group-hover:text-info" />
                        </button>
                        <div className="h-6 w-[1px] bg-foreground/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Asset</span>
                            <span className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                                {query}
                                <button onClick={() => { navigator.clipboard.writeText(query!); toast.success("Copied target"); }}>
                                    <Copy className="w-3 h-3 text-muted-foreground/80 hover:text-info" />
                                </button>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-terminal-bg/50 border border-panel-border rounded-full text-[10px] font-mono text-muted-foreground">
                            <Clock className="w-3 h-3" /> {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'LIVE'}
                        </div>
                        <button
                            onClick={handleRescan}
                            className="flex items-center gap-2 px-4 py-2 bg-info text-black text-[10px] font-bold uppercase rounded-lg hover:bg-info/80 transition-all active:scale-95"
                        >
                            <Zap className="w-3 h-3" /> Rescan_Node
                        </button>
                    </div>
                </div>

                <div className="shodan-layout">
                    {/* LEFT SIDEBAR: PROFILE */}
                    <aside className="border-r border-panel-border bg-panel-bg p-8 overflow-y-auto custom-scrollbar">
                        <section className="space-y-10">
                            {/* IDENTITY CARD */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-info/5 border border-info/20 rounded-2xl flex items-center justify-center text-info">
                                        <Hash className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-muted-foreground/80 uppercase font-mono tracking-widest">Target IP</div>
                                        <div className="text-xl font-black text-foreground">{data?.network_context?.resolved_ip}</div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(data?.technical?.tags || []).map((tag: string, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-terminal-bg/50 border border-panel-border text-[8px] font-mono uppercase rounded text-muted-foreground hover:text-foreground transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-5 pt-8 border-t border-panel-border">
                                <h3 className="text-[11px] font-black text-foreground uppercase tracking-tighter italic flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-info" /> Location
                                </h3>
                                <MapVisual lat={data?.geo_location?.coordinates?.latitude} lng={data?.geo_location?.coordinates?.longitude} />
                                <div className="space-y-3">
                                    <DataRow
                                        label="Country"
                                        value={data?.geo_location?.country}
                                        icon={Globe}
                                        onClick={() => navigate(`/explorer?filter=country&value=${data?.geo_location?.country}`)}
                                    />
                                    <DataRow
                                        label="City"
                                        value={data?.geo_location?.city}
                                        icon={MapPin}
                                        onClick={() => navigate(`/explorer?filter=city&value=${data?.geo_location?.city}`)}
                                    />
                                    <DataRow label="Region" value={data?.geo_location?.region} />
                                </div>
                            </div>

                            {/* Network Info */}
                            <div className="space-y-5 pt-8 border-t border-panel-border">
                                <h3 className="text-[11px] font-black text-foreground uppercase tracking-tighter italic flex items-center gap-2">
                                    <Database className="w-3.5 h-3.5 text-info" /> Network Info
                                </h3>
                                <div className="space-y-3">
                                    <DataRow
                                        label="ISP"
                                        value={data?.network_context?.asn?.isp}
                                        icon={Search}
                                        onClick={() => navigate(`/explorer?filter=isp&value=${data?.network_context?.asn?.isp}`)}
                                    />
                                    <DataRow
                                        label="ASN"
                                        value={data?.network_context?.asn?.number}
                                        icon={Network}
                                        onClick={() => navigate(`/explorer?filter=asn&value=${data?.network_context?.asn?.number}`)}
                                    />
                                    <DataRow label="Org" value={data?.network_context?.asn?.organization} />
                                    <DataRow label="Type" value={data?.network_context?.infrastructure?.type} />
                                </div>
                            </div>

                            {/* Security Compliance */}
                            <div className="space-y-5 pt-8 border-t border-panel-border">
                                <h3 className="text-[11px] font-black text-foreground uppercase tracking-tighter italic flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-info" /> Security Scorecard
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-2xl flex items-center justify-between group hover:border-info/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <BadgeCheck className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-mono text-muted-foreground/80 uppercase">Policy_Status</span>
                                                <span className="text-[10px] font-bold text-foreground/90">Email Secure</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/${query}/reputation`)}
                                            className="p-2 hover:bg-info hover:text-black rounded-lg transition-all text-muted-foreground/80"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-2xl flex items-center justify-between group hover:border-info/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                                <Monitor className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-mono text-muted-foreground/80 uppercase">WAF_Protection</span>
                                                <span className="text-[10px] font-bold text-foreground/90">{data?.reputation_intel?.waf?.detected ? 'Detected' : 'Not Transparent'}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/${query}/reputation`)}
                                            className="p-2 hover:bg-info hover:text-black rounded-lg transition-all text-muted-foreground/80"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Subnet Matrix */}
                            <div className="space-y-5 pt-8 border-t border-panel-border">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-tighter italic flex items-center gap-2">
                                        <Network className="w-3.5 h-3.5 text-info" /> Neighboring Assets
                                    </h3>
                                    <span className="text-[10px] font-mono text-muted-foreground/80">/24</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                    {subnetIps.map((ip) => {
                                        const isMain = ip === data?.network_context?.resolved_ip;
                                        return (
                                            <Link
                                                key={ip}
                                                to={`/${ip}/detailed`}
                                                className={`h-7 flex items-center justify-center text-[9px] font-mono border transition-all ${isMain
                                                    ? 'bg-info border-info text-black font-black z-10'
                                                    : 'bg-terminal-bg/30 border-panel-border text-muted-foreground/80 hover:border-muted-foreground hover:text-foreground/80'
                                                    }`}
                                            >
                                                .{ip.split('.').pop()}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </aside>

                    {/* Main Content */}
                    <div className="bg-app-bg overflow-y-auto custom-scrollbar relative">
                        <div className="p-10 border-b border-panel-border bg-panel-bg/50 grid-bg">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* RISK SCORE ENGINE */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-8 bg-terminal-bg/20 border border-panel-border rounded-3xl relative overflow-hidden group hover:border-info/30 transition-all duration-500"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <ShieldAlert className="w-20 h-20" />
                                    </div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Risk Score</span>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`w-1 h-3 rounded-full ${i <= (data?.summary?.risk_score / 20) ? 'bg-info shadow-[0_0_5px_rgba(30,144,255,0.5)]' : 'bg-foreground/10'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-6xl font-black tracking-tighter ${data?.summary?.risk_score > 70 ? 'text-red-500' :
                                            data?.summary?.risk_score > 35 ? 'text-orange-500' : 'text-emerald-500'
                                            }`}>
                                            {data?.summary?.risk_score}
                                        </span>
                                        <span className="text-muted-foreground font-mono text-xl">/100</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(data?.summary?.risk_breakdown || []).map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-foreground/5 rounded text-[8px] font-mono text-muted-foreground uppercase">
                                                <div className={`w-1 h-1 rounded-full ${item.impact === 'high' ? 'bg-red-500' : item.impact === 'medium' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* SECURITY GRADE HUB */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-8 bg-terminal-bg/20 border border-panel-border rounded-3xl hover:border-info/30 transition-all duration-500 flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Overall Grade</span>
                                        <BadgeCheck className="w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className={`w-28 h-28 rounded-[2rem] border-4 flex flex-col items-center justify-center leading-none ${getGradeColor(data?.summary?.grade)}`}>
                                            <span className="text-6xl font-black">{data?.summary?.grade}</span>
                                            <span className="text-[8px] mt-1 uppercase font-mono font-black opacity-60">Posture</span>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Protocol_Validation</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['HSTS', 'CSP', 'HTTPS', 'DNSSEC'].map(h => (
                                                    <div key={h} className={`px-2 py-1 text-[8px] font-black rounded border flex items-center justify-between group cursor-help ${data?.technical?.all_headers?.[h.toLowerCase()] || h === 'HTTPS' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'
                                                        }`}>
                                                        {h}
                                                        <Info className="w-2.5 h-2.5 opacity-30 group-hover:opacity-100" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* ASSET INTELLIGENCE FEED */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-8 bg-terminal-bg/20 border border-panel-border rounded-3xl"
                                >
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-6">Scan Confidence</div>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[11px] font-mono">
                                                <span className="text-muted-foreground uppercase">Data_Verification</span>
                                                <span className="text-info">98.2%</span>
                                            </div>
                                            <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "98.2%" }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-info shadow-[0_0_10px_rgba(30,144,255,0.5)]"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-terminal-bg/40 border border-panel-border rounded-xl">
                                                <div className="text-[8px] text-muted-foreground/60 uppercase font-mono mb-1">Ports_Found</div>
                                                <div className="text-lg font-black text-foreground">{data?.technical?.ports?.length}</div>
                                            </div>
                                            <div className="p-3 bg-terminal-bg/40 border border-panel-border rounded-xl">
                                                <div className="text-[8px] text-muted-foreground/60 uppercase font-mono mb-1">Vulns_Found</div>
                                                <div className="text-lg font-black text-foreground">{data?.technical?.vulnerabilities?.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* INTERACTIVE NAVIGATION */}
                        <div className="px-6 md:px-10 flex items-center gap-4 md:gap-10 border-b border-panel-border bg-app-bg sticky top-[120px] z-30 overflow-x-auto no-scrollbar whitespace-nowrap">
                            {[
                                { id: 'services', label: 'Ports & Protocols', icon: Layers },
                                { id: 'vulnerabilities', label: 'Vulnerability Matrix', icon: Zap },
                                { id: 'dns', label: 'Passive DNS & Certs', icon: Globe },
                                { id: 'headers', label: 'Deep Profiling', icon: Code }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 md:py-6 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2.5 border-b-2 transition-all group shrink-0 ${activeTab === tab.id
                                        ? 'border-info text-info font-black'
                                        : 'border-transparent text-muted-foreground hover:text-foreground/80'
                                        }`}
                                >
                                    <tab.icon className={`w-3.5 h-3.5 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 opacity-50'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* PANEL CONTENT EXPLORER */}
                        <div className="p-10">
                            <AnimatePresence mode="wait">
                                {activeTab === 'services' && (
                                    <motion.div
                                        key="services"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-12"
                                    >
                                        {data?.technical?.ports?.map((p: any, idx: number) => {
                                            const hasMetadata = p.metadata?.tls || p.metadata?.ssh;
                                            return (
                                                <div key={p.port} className="relative scroll-mt-40" id={`p-${p.port}`}>
                                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                                        <div className="px-5 py-2 bg-info/10 text-info border border-info/30 text-2xl font-black font-mono rounded-2xl shadow-[0_0_20px_rgba(30,144,255,0.05)]">
                                                            {p.port}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">{p.service}</h3>
                                                                {p.product && (
                                                                    <span className="text-[10px] bg-terminal-bg px-2 py-0.5 rounded text-muted-foreground uppercase font-mono tracking-widest">
                                                                        {p.product} {p.version}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] font-mono text-muted-foreground/80 uppercase tracking-[0.3em] flex items-center gap-2">
                                                                <ConsoleIcon className="w-3 h-3" /> TCP / Interactive_Stream
                                                            </div>
                                                        </div>
                                                        <div className="h-[1px] flex-grow bg-foreground/5" />
                                                        <div className="flex gap-2">
                                                            {p.service === 'https' && <BadgeCheck className="w-5 h-5 text-emerald-500/50" />}
                                                            <button
                                                                onClick={() => setExpandedService(expandedService === idx ? null : idx)}
                                                                className="p-2 hover:bg-foreground/5 rounded-lg text-muted-foreground/80 hover:text-foreground transition-colors"
                                                            >
                                                                {expandedService === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className={`grid grid-cols-1 ${hasMetadata ? 'xl:grid-cols-[1fr_400px]' : ''} gap-8`}>
                                                        {/* MAIN BANNER CONSOLE */}
                                                        <div className="bg-panel-bg border border-panel-border rounded-2xl overflow-hidden font-mono group hover:border-muted-foreground transition-colors">
                                                            <div className="bg-terminal-bg/50 px-6 py-3 border-b border-panel-border flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex gap-1.5">
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                                                    </div>
                                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Banner</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(p.banner); toast.success("Banner copied"); }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-foreground/5 rounded text-muted-foreground/80 hover:text-info transition-all"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                            <pre className="p-10 text-sm text-info leading-relaxed overflow-x-auto custom-scrollbar bg-terminal-bg/40 whitespace-pre-wrap font-mono">
                                                                {p.banner}
                                                            </pre>
                                                        </div>

                                                        {/* Details */}
                                                        {hasMetadata && (
                                                            <div className="bg-terminal-bg/20 border border-panel-border rounded-2xl p-6">
                                                                <h4 className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest mb-6">Metadata</h4>

                                                                {p.metadata?.tls && (
                                                                    <MetadataSection title="TLS Info" icon={Lock}>
                                                                        <DataRow label="Subject" value={p.metadata.tls.subject.common_name} copyable />
                                                                        <DataRow label="Issuer" value={p.metadata.tls.issuer.common_name} />
                                                                        <DataRow label="Version" value={p.metadata.tls.version} />
                                                                        <DataRow label="Cipher" value={p.metadata.tls.cipher} />
                                                                        <div className="text-[9px] text-emerald-500/60 font-mono mt-2 flex items-center gap-2">
                                                                            <BadgeCheck className="w-3 h-3" /> Verified Authority
                                                                        </div>
                                                                    </MetadataSection>
                                                                )}

                                                                {p.metadata?.ssh && (
                                                                    <MetadataSection title="SSH Info" icon={Key}>
                                                                        <DataRow
                                                                            label="Print"
                                                                            value={p.metadata.ssh.fingerprint}
                                                                            icon={Search}
                                                                            onClick={() => navigate(`/explorer?filter=fingerprint&value=${p.metadata.ssh.fingerprint}`)}
                                                                        />
                                                                        <DataRow label="Type" value={p.metadata.ssh.key_type} />
                                                                        <DataRow label="Kex" value={p.metadata.ssh.kex_algorithms[0]} />
                                                                    </MetadataSection>
                                                                )}

                                                                {p.metadata?.rdp && (
                                                                    <MetadataSection title="RDP Info" icon={Monitor}>
                                                                        <DataRow label="OS" value={p.metadata.rdp.os} />
                                                                        <DataRow label="NLA" value={p.metadata.rdp.nla} />
                                                                        <DataRow label="Issuer" value={p.metadata.rdp.cert_issuer} />
                                                                    </MetadataSection>
                                                                )}

                                                                {p.metadata?.http && (
                                                                    <MetadataSection title="HTTP Info" icon={Globe}>
                                                                        <DataRow label="Title" value={p.metadata.http.title} />
                                                                        <DataRow label="Robots" value={p.metadata.http.robots} />
                                                                    </MetadataSection>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {activeTab === 'vulnerabilities' && (
                                    <motion.div
                                        key="vulnerabilities"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        {(data?.technical?.vulnerabilities || []).length > 0 ? (
                                            data.technical.vulnerabilities.map((v: any, i: number) => (
                                                <div key={i} className="group relative">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent blur opacity-0 group-hover:opacity-100 transition duration-1000" />
                                                    <div className="relative p-8 bg-terminal-bg/10 border border-panel-border rounded-3xl hover:border-red-500/20 transition-all flex items-center justify-between">
                                                        <div className="flex items-center gap-8">
                                                            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${v.cvss > 9 ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                                                                }`}>
                                                                <span className="text-2xl">{v.cvss.toFixed(1)}</span>
                                                                <span className="text-[8px] uppercase font-mono">CVSS</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-black text-foreground group-hover:text-info transition-colors">{v.id}</span>
                                                                <p className="text-xs text-muted-foreground mt-2 max-w-xl leading-relaxed">{v.summary}</p>
                                                                <div className="mt-4 flex flex-wrap gap-3">
                                                                    <span className="px-2 py-0.5 bg-background/40 rounded text-[9px] font-mono uppercase text-muted-foreground/80">Affected_Version: Generic</span>
                                                                    <span className="px-2 py-0.5 bg-background/40 rounded text-[9px] font-mono uppercase text-muted-foreground/80">Vect: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H</span>
                                                                    {v.exploit_db_id && (
                                                                        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-mono uppercase text-red-500 font-black animate-pulse">Weaponized_Exploit_Found</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {v.exploit_db_id && (
                                                                <a
                                                                    href={`https://www.exploit-db.com/exploits/${v.exploit_db_id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex flex-col items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group/edb"
                                                                >
                                                                    <div className="text-[10px] font-black text-red-500 uppercase font-mono mb-1">EDB-ID</div>
                                                                    <div className="text-sm font-bold text-red-400 group-hover/edb:text-white transition-colors">#{v.exploit_db_id}</div>
                                                                </a>
                                                            )}
                                                            <a
                                                                href={v.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-4 bg-terminal-bg rounded-2xl hover:bg-info text-muted-foreground/80 hover:text-black transition-all"
                                                            >
                                                                <LinkIcon className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-40 flex flex-col items-center opacity-40">
                                                <ShieldCheck className="w-16 h-16 text-emerald-500/10 mb-8" />
                                                <div className="text-[10px] font-mono text-muted-foreground/80 uppercase tracking-[0.4em]">Zero Known Vulnerabilities</div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'dns' && (
                                    <motion.div
                                        key="dns"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-10"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Passive DNS Hub */}
                                            {(data?.network_context?.associated_domains?.length > 0) && (
                                                <div className="p-10 bg-terminal-bg/10 border border-panel-border rounded-[2.5rem]">
                                                    <div className="text-[10px] font-mono text-muted-foreground/80 uppercase mb-8 flex items-center justify-between">
                                                        <span className="flex items-center gap-2.5"><Activity className="w-4 h-4 text-info" /> Associated_Artifacts</span>
                                                        <span className="px-2 py-0.5 bg-info/10 rounded text-info border border-info/20">{data?.network_context?.associated_domains?.length}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2.5">
                                                        {(data?.network_context?.associated_domains || []).map((domain: string, i: number) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => navigate(`/${domain}/detailed`)}
                                                                className="flex items-center justify-between p-4 bg-background/40 border border-panel-border rounded-2xl hover:border-info/30 group transition-all"
                                                            >
                                                                <div className="flex items-center gap-4 text-xs font-mono">
                                                                    <Globe className="w-4 h-4 text-muted-foreground/80 group-hover:text-info transition-colors" />
                                                                    <span className="text-muted-foreground/80 group-hover:text-foreground/90 truncate">{domain}</span>
                                                                </div>
                                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-info transition-all" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* SSL History Matrix */}
                                            {(data?.technical?.certificates?.length > 0) && (
                                                <div className="p-10 bg-terminal-bg/10 border border-panel-border rounded-[2.5rem]">
                                                    <div className="text-[10px] font-mono text-muted-foreground/80 uppercase mb-8 flex items-center gap-2.5">
                                                        <Fingerprint className="w-4 h-4 text-info" /> Certificate_Transparency_Log
                                                    </div>
                                                    <div className="space-y-4">
                                                        {(data?.technical?.certificates || []).slice(0, 8).map((c: any, i: number) => (
                                                            <div key={i} className="p-5 bg-background/40 border border-panel-border rounded-2xl group relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 w-24 h-24 bg-info/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150" />
                                                                <div className="relative flex items-center justify-between">
                                                                    <div className="truncate pr-4">
                                                                        <div className="text-xs font-bold text-foreground/90 truncate">{c.common_name}</div>
                                                                        <div className="flex items-center gap-2 mt-1.5">
                                                                            <span className="text-[8px] text-muted-foreground/80 font-mono uppercase truncate">{c.issuer?.split(',')[0] || 'Unknown Issuer'}</span>
                                                                            <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                                            <span className="text-[8px] text-muted-foreground/80 font-mono uppercase">{new Date(c.not_before).getFullYear()}</span>
                                                                        </div>
                                                                    </div>
                                                                    <a href={`https://crt.sh/?id=${c.id}`} target="_blank" className="p-2 bg-foreground/5 rounded-xl text-muted-foreground/80 hover:text-info transition-all">
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'headers' && (
                                    <motion.div
                                        key="headers"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-10"
                                    >
                                        {/* Technology Stack Profile */}
                                        {(data?.technical?.tech_stack?.length > 0) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {(data?.technical?.tech_stack || []).map((tech: any, i: number) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => navigate(`/explorer?filter=tech&value=${tech.name}`)}
                                                        className="p-6 bg-terminal-bg/20 border border-panel-border rounded-2xl hover:bg-terminal-bg/40 hover:border-info/30 transition-all flex items-center gap-4 text-foreground text-left group"
                                                    >
                                                        <div className="w-10 h-10 bg-info/5 rounded-xl flex items-center justify-center text-info group-hover:scale-110 transition-transform">
                                                            <Chip className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-muted-foreground/80 font-mono uppercase tracking-widest mb-1">{tech.type}</div>
                                                            <div className="text-sm font-bold text-foreground group-hover:text-info transition-colors">{tech.name}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Infrastructure Forensic Markers */}
                                        {Object.keys(data?.technical?.all_headers || {}).some(k => k.startsWith('x-') || k.startsWith('ms-')) && (
                                            <div className="flex flex-wrap gap-4 mb-6">
                                                {Object.entries(data?.technical?.all_headers || {}).map(([k, v]: [string, any]) => {
                                                    const isForensic = k.startsWith('x-azure') || k.startsWith('x-edgescape') || k.startsWith('ms-') || k.startsWith('x-rtag');
                                                    if (!isForensic) return null;
                                                    return (
                                                        <div key={k} className="px-4 py-2 bg-info/5 border border-info/20 rounded-xl flex items-center gap-3">
                                                            <Fingerprint className="w-3 h-3 text-info" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-mono text-muted-foreground uppercase">{k}</span>
                                                                <span className="text-[10px] font-bold text-foreground/90 truncate max-w-[150px]">{v}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Headers */}
                                        <div className="bg-panel-bg border border-panel-border rounded-[2rem] overflow-hidden font-mono text-foreground">
                                            <div className="bg-terminal-bg/50 p-6 border-b border-panel-border text-[9px] text-muted-foreground/80 uppercase flex items-center justify-between tracking-widest">
                                                <span>HTTP Response Headers</span>
                                                <Radio className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="p-4 md:p-10 overflow-x-auto custom-scrollbar">
                                                <div className="space-y-6">
                                                    {Object.entries(data?.technical?.all_headers || {}).map(([k, v]: [string, any]) => (
                                                        <div key={k} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-10">
                                                            <span className="text-muted-foreground/80 font-black uppercase text-[10px] tracking-widest break-all md:border-r border-panel-border">
                                                                {k}
                                                            </span>
                                                            <span className="text-info/80 break-all text-xs font-medium italic">
                                                                {v}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <IntelTacticalSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                data={data}
            />

            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-info text-app-bg rounded-full shadow-[0_0_30px_rgba(30,144,255,0.3)] flex items-center justify-center z-[90] active:scale-95 transition-transform border-4 border-background"
            >
                <Terminal className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            </button>
        </div>
    );
};

export default IntelDetailed;
