import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    Building2, Globe, Shield, Activity,
    Database, Network, Zap, ShieldAlert,
    Search, Filter, Layers, List,
    Terminal, ArrowLeft, ExternalLink,
    ChevronRight, Circle, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Organization, AssetBase, Exposure, AssetRelationship } from "@/types/asm";
import Meta from "@/components/Meta";
import { toast } from "sonner";
import { AttackPathGraph } from "@/components/AttackPathGraph";
import { AsmService } from "@/lib/asm-service";

const OrgInventory = () => {
    const { id } = useParams();
    const [org, setOrg] = useState<Organization | null>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
    const [exposures, setExposures] = useState<Exposure[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('assets');
    const navigate = useNavigate();

    useEffect(() => {
        if (id) fetchOrgData();
    }, [id]);

    const fetchOrgData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Org
            const { data: orgData } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .single();
            if (orgData) setOrg(orgData);

            // 2. Fetch Assets with details
            const { data: assetData } = await supabase
                .from('assets')
                .select(`
                    *,
                    domains (fqdn),
                    ips (ip_address, asn, isp, country_code),
                    services (port, service, product)
                `)
                .eq('org_id', id);

            if (assetData) setAssets(assetData);

            // 3. Fetch Graph Relationships
            const { relationships: rels } = await AsmService.getOrgGraph(id!);
            setRelationships(rels);

            // 4. Fetch Exposures
            const { data: expData } = await supabase
                .from('exposures')
                .select('*')
                .in('asset_id', assetData?.map(a => a.id) || []);

            if (expData) setExposures(expData);

        } catch (err) {
            console.error("Failed to fetch org inventory:", err);
            toast.error("Telemetry link failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const getSeverityColor = (sev: string) => {
        switch (sev.toLowerCase()) {
            case 'critical': return 'text-red-500 border-red-500/20 bg-red-500/5';
            case 'high': return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
            case 'medium': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
            default: return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center">
            <Terminal className="w-10 h-10 text-info animate-pulse" />
        </div>
    );

    if (!org) return <div>ORG_NOT_FOUND</div>;

    return (
        <div className="min-h-screen bg-app-bg text-foreground/80 font-sans">
            <Meta title={`${org.name} Inventory | RiskSignal`} />
            <Header />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/inventory')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-info transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Global_Inbound</span>
                </button>

                {/* Profile Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-info/5 border border-info/20 rounded-3xl flex items-center justify-center text-info shadow-[0_0_30px_rgba(30,144,255,0.1)]">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black tracking-tighter text-foreground italic">{org.name}</h1>
                                <span className={`px-2 py-0.5 rounded border text-[9px] font-mono hover:bg-foreground/5 transition-colors cursor-help ${org.confidence_score > 90 ? 'border-emerald-500/30 text-emerald-500' : 'border-orange-500/30 text-orange-500'}`}>
                                    LNK_{org.confidence_score}%
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-mono uppercase tracking-[0.25em]">
                                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {org.root_domain}</span>
                                <span className="opacity-20">|</span>
                                <span className="flex items-center gap-1.5 text-info/80"><Activity className="w-3.5 h-3.5" /> ID_{org.id.split('-')[0].toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-2xl flex flex-col">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">Nodes_Tracked</span>
                            <span className="text-2xl font-black text-foreground">{assets.length}</span>
                        </div>
                        <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-2xl flex flex-col">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">Exposures</span>
                            <span className="text-2xl font-black text-red-500">{exposures.length}</span>
                        </div>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-10 border-b border-panel-border mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                    {[
                        { id: 'assets', label: 'Asset Matrix', icon: Layers },
                        { id: 'exposures', label: 'Exposure Queue', icon: ShieldAlert },
                        { id: 'graph', label: 'Attack Path', icon: Network }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-6 text-[11px] font-mono uppercase tracking-[0.2em] flex items-center gap-2.5 border-b-2 transition-all group ${activeTab === tab.id
                                ? 'border-info text-info font-black'
                                : 'border-transparent text-muted-foreground hover:text-foreground/80'
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Panels */}
                <AnimatePresence mode="wait">
                    {activeTab === 'assets' && (
                        <motion.div
                            key="assets"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assets.map((asset, i) => (
                                    <div
                                        key={asset.id}
                                        className="p-6 bg-terminal-bg/20 border border-panel-border rounded-3xl hover:border-info/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <Circle className={`w-1.5 h-1.5 animate-pulse ${asset.asset_type === 'domain' ? 'fill-blue-500 text-blue-500' : asset.asset_type === 'ip' ? 'fill-emerald-500 text-emerald-500' : 'fill-info text-info'}`} />
                                                    {asset.asset_type}
                                                </div>
                                                <h3 className="text-lg font-black text-foreground truncate max-w-[200px]">
                                                    {asset.asset_type === 'domain' ? asset.domains[0]?.fqdn : asset.asset_type === 'ip' ? asset.ips[0]?.ip_address : 'Service Asset'}
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/${asset.domains?.[0]?.fqdn || asset.ips?.[0]?.ip_address}/detailed`)}
                                                className="p-2.5 bg-foreground/5 rounded-xl hover:bg-info hover:text-black transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {asset.asset_type === 'ip' && (
                                                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80">
                                                    <span>ASN: {asset.ips[0]?.asn}</span>
                                                    <span>{asset.ips[0]?.country_code}</span>
                                                </div>
                                            )}
                                            {asset.asset_type === 'service' && (
                                                <div className="flex items-center justify-between text-[10px] font-mono text-info/80">
                                                    <span className="font-bold uppercase tracking-tight">{asset.services[0]?.service}</span>
                                                    <span>PORT_{asset.services[0]?.port}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-panel-border flex items-center justify-between">
                                            <div className="text-[9px] font-mono text-muted-foreground uppercase italic opacity-40">
                                                ID: {asset.id.split('-')[0]}
                                            </div>
                                            <div className="flex -space-x-1.5">
                                                {exposures.filter(e => e.asset_id === asset.id).slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className={`w-2 h-2 rounded-full border border-background ${e.severity === 'high' || e.severity === 'critical' ? 'bg-red-500' : 'bg-info'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'exposures' && (
                        <motion.div
                            key="exposures"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {exposures.length > 0 ? exposures.map((exp, i) => (
                                <div key={i} className="p-8 bg-terminal-bg/20 border border-panel-border rounded-[2rem] hover:border-info/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-8">
                                        <div className={`w-16 h-16 rounded-[1.25rem] border-2 flex flex-col items-center justify-center font-black ${getSeverityColor(exp.severity)}`}>
                                            <span className="text-[10px] uppercase font-mono">{exp.severity}</span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-mono text-info uppercase tracking-widest mb-1">{exp.taxonomy_id}</div>
                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-info transition-colors">
                                                {exp.taxonomy_id === 'EXP-GEN-RISK' ? 'Infrastructure Health Risk' : exp.taxonomy_id}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground uppercase">
                                                <span className="px-2 py-0.5 bg-background/40 rounded border border-panel-border">Status: {exp.status}</span>
                                                <span className="opacity-40">Detected: {new Date(exp.first_seen).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-4 bg-foreground/5 rounded-2xl hover:bg-info hover:text-black transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            )) : (
                                <div className="py-40 text-center opacity-40">
                                    <Shield className="w-16 h-16 mx-auto mb-6" />
                                    <div className="text-[10px] font-mono uppercase tracking-widest">Zero Vulnerable Exposures Tracked</div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'graph' && (
                        <motion.div
                            key="graph"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-[700px] relative overflow-hidden"
                        >
                            <AttackPathGraph
                                assets={assets}
                                relationships={relationships}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
};

export default OrgInventory;
