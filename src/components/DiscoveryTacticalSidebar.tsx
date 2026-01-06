import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    X, History, Activity, Zap,
    ArrowRight, Globe, ShieldAlert,
    Clock, Cpu, Terminal, Database, Info, Code
} from "lucide-react";

interface DiscoverySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: string[];
    onHistoryClick: (query: string) => void;
    stats: {
        safe: number;
        suspicious: number;
        critical: number;
    };
}

const DiscoveryTacticalSidebar: React.FC<DiscoverySidebarProps> = ({
    isOpen,
    onClose,
    history,
    onHistoryClick,
    stats
}) => {
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
                                    <div className="p-2 bg-success/10 rounded-lg">
                                        <Globe className="w-4 h-4 text-success" />
                                    </div>
                                    <span className="text-xs font-mono font-black uppercase tracking-widest">Global_Discovery_HUD</span>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Section 0: System Navigation */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Terminal className="w-3 h-3 text-success" /> System_Navigation
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

                            {/* Section 2: Global Heat Index */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-success" /> Global_Heat_Index
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-xl">
                                        <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">Live_Threats</div>
                                        <div className="text-xl font-black text-danger">{(stats.critical + stats.suspicious).toLocaleString()}</div>
                                        <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-danger w-[65%] animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-xl">
                                        <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">Network_Nodes</div>
                                        <div className="text-xl font-black text-info">{stats.safe.toLocaleString()}</div>
                                        <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-info w-[85%]" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-terminal-bg/30 border border-panel-border rounded-xl col-span-2 flex items-center justify-between">
                                        <div>
                                            <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">Edge_Latency</div>
                                            <div className="text-xl font-black text-success">24ms</div>
                                        </div>
                                        <Zap className="w-8 h-8 text-success/20" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Search History (Frequency List) */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History className="w-3 h-3 text-info" /> Intel_Frequencies
                                </div>

                                <div className="space-y-2">
                                    {history.length > 0 ? (
                                        history.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    onHistoryClick(item);
                                                    onClose();
                                                }}
                                                className="w-full flex items-center justify-between p-3 bg-terminal-bg/30 border border-panel-border rounded-xl hover:border-info/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-info" />
                                                    <span className="text-xs font-mono text-foreground/80 group-hover:text-foreground">{item}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border border-dashed border-panel-border rounded-2xl opacity-40">
                                            <div className="text-[10px] font-mono text-muted-foreground uppercase">No_Previous_Scans</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="mt-auto pt-8 border-t border-panel-border">
                                <div className="p-4 bg-black/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Core_Systems: ONLINE</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-muted-foreground/30">v4.2.0</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DiscoveryTacticalSidebar;
