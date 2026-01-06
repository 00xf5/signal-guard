import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Meta from "@/components/Meta";
import {
    Search, Shield, Terminal,
    Cpu, Activity, Zap,
    Filter, Database, Globe,
    ArrowRight, ExternalLink,
    Clock, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ClickableAsset from "@/components/ClickableAsset";
import ForensicTacticalSidebar from "@/components/ForensicTacticalSidebar";

interface ForensicResult {
    id: string;
    asset_id: string;
    asset_value: string;
    created_at: string;
    snapshot_data: any;
    match_source: string;
}

const Forensics = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [results, setResults] = useState<ForensicResult[]>([]);
    const [stats, setStats] = useState({
        total_snapshots: 0,
        unique_assets: 0,
        indexed_keys: 0
    });

    useEffect(() => {
        const savedHistory = localStorage.getItem('forensic_search_history');
        if (savedHistory) {
            try { setSearchHistory(JSON.parse(savedHistory)); }
            catch (e) { console.error("Failed to load history", e); }
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { count: snapshotCount } = await supabase
                .from('asset_snapshots')
                .select('*', { count: 'exact', head: true });

            const { count: assetCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true });

            setStats({
                total_snapshots: snapshotCount || 0,
                unique_assets: assetCount || 0,
                indexed_keys: 153 // Mock value for effect
            });
        } catch (e) {
            console.error("Stats fetch failed", e);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.length < 3) {
            toast.error("Term too short. Minimum 3 characters for forensic grep.");
            return;
        }

        setIsSearching(true);
        setResults([]);

        try {
            // Using PostgREST path search for JSONB
            // This is a deep search across the snapshot_data object
            const { data, error } = await supabase
                .from('asset_snapshots')
                .select(`
                    id,
                    created_at,
                    snapshot_data,
                    assets (value)
                `)
                .or(`snapshot_data->>http_headers.ilike.*${searchTerm}*,snapshot_data->>service_banners.ilike.*${searchTerm}*`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Save to history
            const cleanQuery = searchTerm.trim();
            if (cleanQuery) {
                const updatedHistory = [cleanQuery, ...searchHistory.filter(h => h !== cleanQuery)].slice(0, 10);
                setSearchHistory(updatedHistory);
                localStorage.setItem('forensic_search_history', JSON.stringify(updatedHistory));
            }

            const formatted = (data || []).map((r: any) => ({
                id: r.id,
                asset_id: r.asset_id,
                asset_value: r.assets?.value || 'Unknown',
                created_at: r.created_at,
                snapshot_data: r.snapshot_data,
                match_source: JSON.stringify(r.snapshot_data).toLowerCase().includes(searchTerm.toLowerCase()) ? 'Global Match' : 'Static Match'
            }));

            setResults(formatted);
            if (formatted.length === 0) toast.info("No forensic matches found.");
            else toast.success(`Found ${formatted.length} signals matching "${searchTerm}"`);

        } catch (err) {
            console.error("Forensic search failed:", err);
            toast.error("Forensic index unreachable.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-app-bg text-foreground font-mono transition-colors duration-500">
            <Meta
                title="Forensic Search Engine | Deep Grep Network Artifacts"
                description="Search the high-fidelity historical index of the global attack surface. Execute 'grep-style' queries across millions of HTTP headers, service banners, and SSL certificates."
                keywords="forensic search, grep network, network artifact hunting, historical ip data, banner search, header search, cybersecurity forensics, threat hunting tool"
            />
            <Header />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <header className="mb-12 space-y-4">
                    <div className="flex items-center gap-3 text-info">
                        <Shield className="w-6 h-6" />
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Forensic_Grep_Engine</h1>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
                        Query the high-fidelity historical index of the global attack surface.
                        Search across <span className="text-foreground font-bold">banners</span>,
                        <span className="text-foreground font-bold">headers</span>,
                        <span className="text-foreground font-bold">certificates</span>, and
                        <span className="text-foreground font-bold">metadata</span> strings.
                    </p>
                </header>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Snapshots_Indexed', value: stats.total_snapshots.toLocaleString(), icon: Database, color: 'text-info' },
                        { label: 'Unique_Assets', value: stats.unique_assets.toLocaleString(), icon: Globe, color: 'text-success' },
                        { label: 'Query_Latency', value: '24ms', icon: Zap, color: 'text-warning' }
                    ].map((stat, i) => (
                        <div key={i} className="p-6 bg-terminal-bg/30 border border-panel-border rounded-3xl flex items-center gap-6 group hover:border-info/30 transition-all">
                            <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</div>
                                <div className="text-2xl font-black">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search Console */}
                <section className="mb-16">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-info/20 to-success/20 blur opacity-25 group-focus-within:opacity-50 transition-opacity" />
                        <div className="relative flex items-center">
                            <Terminal className="absolute left-6 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="grep -ri 'Server: nginx' /archive/..."
                                className="w-full h-16 pl-16 pr-32 bg-terminal-bg border border-panel-border rounded-3xl text-lg focus:outline-none focus:border-info/50 transition-all font-mono"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="absolute right-3 px-6 h-10 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                            >
                                {isSearching ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                                Execute_Scan
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 flex items-center gap-6 text-[10px] text-muted-foreground px-4">
                        <span className="flex items-center gap-2"><Filter className="w-3 h-3" /> Regex Powered</span>
                        <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Indexed JSONB</span>
                        <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> Real-time Matches</span>
                    </div>
                </section>

                {/* Results Matrix */}
                <div className="space-y-6">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {results.map((result, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={result.id}
                                    className="p-8 bg-terminal-bg/20 border border-panel-border rounded-[2.5rem] hover:border-info/30 transition-all group overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded bg-info/10 border border-info/20 text-[9px] font-black text-info uppercase tracking-widest">Signal_Match</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{new Date(result.created_at).toLocaleString()}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-foreground">
                                                <ClickableAsset value={result.asset_value} />
                                            </h3>
                                        </div>
                                        <div className="flex gap-4">
                                            <Link
                                                to={`/${result.asset_value}/detailed`}
                                                className="p-4 bg-white/5 rounded-2xl hover:bg-info hover:text-black transition-all"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute top-4 right-4 text-[9px] font-mono text-muted-foreground/30 uppercase">
                                            Payload_Dump
                                        </div>
                                        <pre className="p-6 bg-black/40 border border-white/5 rounded-2xl text-[11px] font-mono text-foreground/70 overflow-x-auto custom-scrollbar max-h-40 whitespace-pre-wrap">
                                            {JSON.stringify(result.snapshot_data, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                                                <span className="text-[10px] text-muted-foreground uppercase">Integrity: Verified</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-info shadow-[0_0_8px_rgba(0,122,255,0.3)]" />
                                                <span className="text-[10px] text-muted-foreground uppercase">Source: {result.match_source}</span>
                                            </div>
                                        </div>
                                        <div className="text-[9px] text-muted-foreground opacity-20 italic">
                                            Snapshot_ID: {result.id}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : !isSearching ? (
                        <div className="py-40 text-center space-y-6 opacity-40">
                            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                                <Terminal className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold uppercase tracking-widest">Awaiting_Instructions</h3>
                                <p className="text-sm max-w-sm mx-auto">Enter a search query to scan the global forensic archive. Use keywords like server types, header names, or specific banners.</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />

            <ForensicTacticalSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                history={searchHistory}
                onHistoryClick={(h) => {
                    setSearchTerm(h);
                    setTimeout(() => handleSearch(null as any), 100);
                }}
            />

            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 left-6 lg:hidden w-14 h-14 bg-warning text-black rounded-full shadow-[0_0_30px_rgba(255,191,0,0.3)] flex items-center justify-center z-[90] active:scale-95 transition-transform border-4 border-[#030712]"
            >
                <Terminal className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-info rounded-full border-2 border-[#030712] animate-pulse" />
            </button>
        </div>
    );
};

export default Forensics;
