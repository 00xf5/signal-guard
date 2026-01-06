import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    X, Shield, Activity, Copy, Share2,
    ExternalLink, Terminal, ChevronRight,
    Zap, AlertTriangle, Fingerprint, Database,
    Globe, Info, Code
} from "lucide-react";
import { toast } from "sonner";

interface TacticalSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    data: any;
}

const IntelTacticalSidebar: React.FC<TacticalSidebarProps> = ({ isOpen, onClose, data }) => {
    const handleCopyAll = () => {
        const identifiers = [
            `IP: ${data?.network_context?.resolved_ip || data?.query}`,
            `ASN: ${data?.network_context?.asn?.number || 'N/A'}`,
            `ISP: ${data?.network_context?.asn?.isp || 'N/A'}`,
            `Score: ${data?.summary?.risk_score || 0}/100`,
            `Vulnerabilities: ${(data?.technical?.vulnerabilities || []).map((v: any) => v.id).join(', ')}`
        ].join('\n');

        navigator.clipboard.writeText(identifiers);
        toast.success("Intelligence harvested to clipboard");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Intelligence link copied");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-background border-l border-panel-border z-[101] lg:hidden overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-panel-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-info/10 rounded-lg">
                                        <Terminal className="w-4 h-4 text-info" />
                                    </div>
                                    <span className="text-xs font-mono font-black uppercase tracking-widest">Tactical_Overlay</span>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Section 0: System Navigation */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Terminal className="w-3 h-3 text-info" /> System_Navigation
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link to="/discovery" className="flex items-center gap-2 p-3 bg-terminal-bg/50 border border-panel-border rounded-xl hover:border-success/30 transition-all group">
                                        <Globe className="w-4 h-4 text-success" />
                                        <span className="text-xs font-bold text-foreground group-hover:text-success">Discovery</span>
                                    </Link>
                                    <Link to="/inventory" className="flex items-center gap-2 p-3 bg-terminal-bg/50 border border-panel-border rounded-xl hover:border-info/30 transition-all group">
                                        <Database className="w-4 h-4 text-info" />
                                        <span className="text-xs font-bold text-foreground group-hover:text-info">Inventory</span>
                                    </Link>
                                    <Link to="/forensics" className="flex items-center gap-2 p-3 bg-terminal-bg/50 border border-panel-border rounded-xl hover:border-warning/30 transition-all group">
                                        <Shield className="w-4 h-4 text-warning" />
                                        <span className="text-xs font-bold text-foreground group-hover:text-warning">Forensics</span>
                                    </Link>
                                    <Link to="/docs" className="flex items-center gap-2 p-3 bg-terminal-bg/50 border border-panel-border rounded-xl hover:border-foreground/30 transition-all group">
                                        <Code className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-bold text-foreground">Docs</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Section 2: Intelligence Snapshot */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-info" /> Intelligence_Snapshot
                                </div>

                                <div className="p-5 bg-terminal-bg/30 border border-panel-border rounded-2xl space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Risk_Grade</div>
                                            <div className="text-4xl font-black text-foreground italic">{data?.summary?.grade || 'N/A'}</div>
                                        </div>
                                        <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-black ${(data?.summary?.risk_score || 0) > 70 ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                            (data?.summary?.risk_score || 0) > 40 ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                                                'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                            }`}>
                                            <span className="text-xl leading-none">{data?.summary?.risk_score || 0}</span>
                                            <span className="text-[8px] uppercase">Score</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-mono">STATUS:</span>
                                            <span className="text-foreground font-bold flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE_NODE
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-mono">WEAPONIZED:</span>
                                            <span className={`font-bold ${data?.technical?.vulnerabilities?.some((v: any) => v.exploit_db_id) ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                {data?.technical?.vulnerabilities?.some((v: any) => v.exploit_db_id) ? 'YES' : 'NO'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-mono">OS_INTEL:</span>
                                            <span className="text-foreground/80 lowercase">{data?.technical?.ports?.[0]?.banner?.split(' ')[1] || 'generic_linux'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Investigation Toolbox */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-warning" /> Investigation_Toolbox
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={handleCopyAll}
                                        className="flex items-center justify-between p-4 bg-info/5 border border-info/20 rounded-xl hover:bg-info/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Copy className="w-4 h-4 text-info" />
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-foreground">Harvest Identifiers</div>
                                                <div className="text-[9px] text-muted-foreground">Copy IP, ASN, and CVEs to clipboard</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-info transition-all" />
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="flex items-center justify-between p-4 bg-terminal-bg/30 border border-panel-border rounded-xl hover:border-info/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Share2 className="w-4 h-4 text-muted-foreground group-hover:text-info" />
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-foreground">Share Intelligence</div>
                                                <div className="text-[9px] text-muted-foreground">Copy forensic link for reporting</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-info transition-all" />
                                    </button>

                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center justify-between p-4 bg-terminal-bg/30 border border-panel-border rounded-xl hover:border-info/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Database className="w-4 h-4 text-muted-foreground group-hover:text-info" />
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-foreground">Export PDF Report</div>
                                                <div className="text-[9px] text-muted-foreground">Download clean forensic summary</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-info transition-all" />
                                    </button>
                                </div>
                            </div>

                            {/* Section: Quick Diagnostics */}
                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-mono text-red-500 uppercase font-black">Active_Threats</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground leading-relaxed">
                                    {data?.summary?.risk_breakdown?.slice(0, 3).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2 mb-1">
                                            <div className={`w-1 h-1 rounded-full ${item.impact === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Infrastructure Fingerprint Shortcut */}
                            <div className="flex items-center justify-center pt-8">
                                <div className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.4em] flex flex-col items-center gap-2">
                                    <Fingerprint className="w-8 h-8 opacity-10" />
                                    RISK_SIGNAL_TACTICAL_v4.2
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default IntelTacticalSidebar;
