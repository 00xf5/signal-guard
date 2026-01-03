import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Meta from "@/components/Meta";
import {
    Search, Network, Cpu, Globe, ArrowLeft,
    Filter, Activity, Database, Shield, Zap,
    ChevronRight, ExternalLink, Terminal
} from "lucide-react";
import { motion } from "framer-motion";

const Explorer = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const filter = searchParams.get('filter') || 'global';
    const value = searchParams.get('value') || '';

    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mocking an advanced infrastructure search
        const fetchResults = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Generate some mock intelligence based on the filter
            const mockResults = Array.from({ length: 8 }).map((_, i) => ({
                ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                hostname: `server-${Math.random().toString(36).substring(7)}.node.risk`,
                threat_level: i % 3 === 0 ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
                ports: [80, 443, 22].slice(0, Math.floor(Math.random() * 3) + 1),
                asn: value.startsWith('AS') ? value : 'AS15169',
                last_seen: '2 mins ago'
            }));

            setResults(mockResults);
            setIsLoading(false);
        };

        fetchResults();
    }, [filter, value]);

    return (
        <div className="min-h-screen bg-app-bg text-foreground selection:bg-info/30">
            <Meta
                title={`Infrastructure Explorer: ${value || 'Global'}`}
                description={`Advanced network intelligence search for ${filter}: ${value}. Discover related assets and infrastructure patterns.`}
            />
            <Header />

            <main className="pt-24 pb-20 container max-w-6xl px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-info transition-colors uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Back to Intelligence
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                            Network <span className="text-gradient">Explorer.</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 bg-info/10 border border-info/20 rounded-lg flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-info" />
                                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-info">{filter}</span>
                            </div>
                            <span className="text-xl font-mono text-foreground/40">/</span>
                            <span className="text-xl font-bold tracking-tight">{value || "Global Feed"}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-terminal-bg/30 border border-panel-border rounded-3xl flex-shrink-0 md:max-w-[300px]">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-4 h-4 text-info animate-pulse" />
                            <span className="text-[10px] font-mono text-muted-foreground uppercase font-black">Cluster_Intelligence</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Found <span className="text-foreground font-bold">128 nodes</span> matching this infrastructure signature across the global edge network.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6">
                        <div className="w-12 h-12 border-2 border-info/10 border-t-info rounded-full animate-spin" />
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Aggregating_Cross_Signals</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        {results.map((item, i) => (
                            <motion.div
                                key={item.ip}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/${item.ip}/detailed`)}
                                className="group relative p-6 bg-terminal-bg/10 border border-panel-border rounded-3xl hover:border-info/40 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Database className="w-24 h-24" />
                                </div>
                                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 font-black ${item.threat_level === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                                item.threat_level === 'Medium' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                                                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                            }`}>
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold text-foreground group-hover:text-info transition-colors flex items-center gap-3">
                                                {item.ip}
                                                <span className={`text-[8px] px-2 py-0.5 rounded border uppercase font-mono ${item.threat_level === 'High' ? 'border-red-500/20 text-red-500' : 'border-emerald-500/20 text-emerald-500'
                                                    }`}>
                                                    {item.threat_level} Risk
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground space-x-2 mt-1">
                                                <span className="font-mono text-[10px]">{item.hostname}</span>
                                                <span>•</span>
                                                <span className="font-mono text-[10px]">{item.asn}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="flex flex-col items-end">
                                            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-2">Open_Ports</div>
                                            <div className="flex gap-1.5">
                                                {item.ports.map((p: any) => (
                                                    <span key={p} className="w-8 h-8 rounded-lg bg-terminal-bg/50 border border-panel-border flex items-center justify-center text-[10px] font-mono text-info/80">{p}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-10 w-[1px] bg-panel-border hidden lg:block" />
                                        <div className="flex flex-col items-end">
                                            <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Last_Seen</div>
                                            <div className="text-[10px] font-bold text-foreground/70">{item.last_seen}</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-info transition-all transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Explorer;
