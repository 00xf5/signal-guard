import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button as UiButton } from "@/components/ui/button";
import {
    Building2, Globe, Shield, Activity,
    Database, Network, Zap, ShieldAlert,
    Search, Filter, Layers, List,
    Terminal, ArrowLeft, ExternalLink,
    ChevronRight, Circle, MoreVertical,
    Clock, ArrowRight, Tag, Plus
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
    const [sortKey, setSortKey] = useState<'value' | 'type' | 'last_seen'>('value');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [auditLog, setAuditLog] = useState<any[]>([]);
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
            const assetIds = assetData?.map(a => a.id) || [];
            if (assetIds.length > 0) {
                const { data: expData } = await supabase
                    .from('exposures')
                    .select('*')
                    .in('asset_id', assetIds);
                if (expData) setExposures(expData);

                // 5. Fetch Forensic Audit Log
                const { data: logData } = await supabase
                    .from('asset_changes')
                    .select('*, assets(value)')
                    .in('asset_id', assetIds)
                    .order('detected_at', { ascending: false })
                    .limit(50);
                if (logData) setAuditLog(logData);
            }

        } catch (err) {
            console.error("Failed to fetch org inventory:", err);
            toast.error("Telemetry link failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = async (assetId: string, currentTags: string[]) => {
        const tag = prompt("Enter tag name:");
        if (!tag) return;

        const newTags = [...(currentTags || []), tag.toLowerCase().trim()];
        const { error } = await supabase
            .from('assets')
            .update({ tags: newTags })
            .eq('id', assetId);

        if (error) {
            toast.error("Failed to apply tag.");
        } else {
            toast.success(`Tag "${tag}" applied.`);
            setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tags: newTags } : a));
        }
    };

    const handleRemoveTag = async (assetId: string, tagToRemove: string, currentTags: string[]) => {
        const newTags = (currentTags || []).filter(t => t !== tagToRemove);
        const { error } = await supabase
            .from('assets')
            .update({ tags: newTags })
            .eq('id', assetId);

        if (error) {
            toast.error("Failed to remove tag.");
        } else {
            setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tags: newTags } : a));
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
                        <UiButton
                            variant="hero"
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-6 h-14 rounded-2xl hidden md:flex"
                            onClick={() => window.print()}
                        >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            Generate Executive Report
                        </UiButton>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-10 border-b border-panel-border mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                    {[
                        { id: 'assets', label: 'Asset Matrix', icon: Layers },
                        { id: 'exposures', label: 'Exposure Queue', icon: ShieldAlert },
                        { id: 'forensics', label: 'Forensic Timeline', icon: Clock },
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 no-print">
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order_By:</span>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'value', label: 'Identity' },
                                            { id: 'type', label: 'Species' },
                                            { id: 'last_seen', label: 'Last Probe' }
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    if (sortKey === s.id) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                                    else setSortKey(s.id as any);
                                                }}
                                                className={`text-[10px] font-mono uppercase transition-colors ${sortKey === s.id ? 'text-info font-black underline' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {s.label} {sortKey === s.id && (sortOrder === 'asc' ? '↑' : '↓')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground opacity-50 uppercase">
                                    Displaying_{assets.length}_Nodes
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...assets].sort((a, b) => {
                                    const valA = sortKey === 'value' ? (a.value || '') : sortKey === 'type' ? (a.asset_type || '') : (a.last_seen || '');
                                    const valB = sortKey === 'value' ? (b.value || '') : sortKey === 'type' ? (b.asset_type || '') : (b.last_seen || '');
                                    const res = String(valA).localeCompare(String(valB));
                                    return sortOrder === 'asc' ? res : -res;
                                }).map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="p-6 bg-terminal-bg/20 border border-panel-border rounded-3xl hover:border-info/30 transition-all group relative overflow-hidden break-inside-avoid"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                                    <Circle className={`w-1.5 h-1.5 animate-pulse ${asset.asset_type === 'domain' ? 'fill-blue-500 text-blue-500' : asset.asset_type === 'ip' ? 'fill-emerald-500 text-emerald-500' : 'fill-info text-info'}`} />
                                                    {asset.asset_type}
                                                </div>
                                                <h3 className="text-lg font-black text-foreground truncate max-w-[200px]">
                                                    {asset.value}
                                                </h3>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/${asset.value}/detailed`)}
                                                className="p-2.5 bg-foreground/5 rounded-xl hover:bg-info hover:text-black transition-all no-print"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/80">
                                                <span>{asset.ips?.[0]?.asn || 'NO_ASN_DATA'}</span>
                                                <span>{asset.ips?.[0]?.country_code || 'GEO_UNKNOWN'}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-4 min-h-[24px]">
                                                {(asset.tags || []).map((tag: string, tidx: number) => (
                                                    <span
                                                        key={tidx}
                                                        onClick={() => handleRemoveTag(asset.id, tag, asset.tags)}
                                                        className="px-2 py-0.5 rounded bg-info/10 border border-info/20 text-[8px] font-mono text-info hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 cursor-pointer transition-all"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={() => handleAddTag(asset.id, asset.tags)}
                                                    className="w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-info hover:text-black transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
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
                                <div key={i} className="p-8 bg-terminal-bg/20 border border-panel-border rounded-[2rem] hover:border-info/30 transition-all flex items-center justify-between group break-inside-avoid">
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
                                    <button className="p-4 bg-foreground/5 rounded-2xl hover:bg-info hover:text-black transition-all no-print">
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

                    {activeTab === 'forensics' && (
                        <motion.div
                            key="forensics"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-info/40 before:via-panel-border before:to-transparent">
                                {auditLog.length > 0 ? auditLog.map((log) => (
                                    <div key={log.id} className="relative break-inside-avoid">
                                        <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-app-bg border border-panel-border flex items-center justify-center z-10">
                                            <div className={`w-2 h-2 rounded-full ${log.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-info'}`} />
                                        </div>
                                        <div className="p-6 bg-terminal-bg/30 border border-panel-border rounded-[2rem] hover:border-info/30 transition-all space-y-4 group">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono text-info uppercase tracking-widest">{log.change_type}</span>
                                                        <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-40 italic">Asset: {log.assets?.value}</span>
                                                    </div>
                                                    <h4 className="text-md font-bold text-foreground opacity-90">{log.desc}</h4>
                                                </div>
                                                <div className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                                                    {new Date(log.detected_at).toLocaleString()}
                                                </div>
                                            </div>

                                            {(log.old_value?.val || log.new_value?.val) && (
                                                <div className="flex items-center gap-4 p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] overflow-hidden">
                                                    <div className="flex-1 truncate opacity-40 line-through">{JSON.stringify(log.old_value?.val) || 'NONE'}</div>
                                                    <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                    <div className="flex-1 truncate text-success font-bold">{JSON.stringify(log.new_value?.val) || 'NONE'}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-40 text-center opacity-40">
                                        <Clock className="w-16 h-16 mx-auto mb-6" />
                                        <div className="text-[10px] font-mono uppercase tracking-widest">No forensic drift detected in current cycle</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'graph' && (
                        <motion.div
                            key="graph"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-[700px] relative overflow-hidden no-print"
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
