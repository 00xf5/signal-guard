import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    X, Shield, Activity, Zap,
    Globe, Terminal, Database, Code, History, Clock, ArrowRight
} from "lucide-react";

interface ForensicSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history?: string[];
    onHistoryClick?: (query: string) => void;
}

const ForensicTacticalSidebar: React.FC<ForensicSidebarProps> = ({
    isOpen,
    onClose,
    history = [],
    onHistoryClick
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
                        className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-[#030712] border-l border-white/10 z-[101] lg:hidden overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-warning/10 rounded-lg">
                                        <Shield className="w-4 h-4 text-warning" />
                                    </div>
                                    <span className="text-xs font-mono font-black text-white uppercase tracking-widest">Forensic_HUD</span>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Section 0: System Navigation */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Terminal className="w-3 h-3 text-warning" /> System_Navigation
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link to="/discovery" className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-success/30 transition-all group">
                                        <Globe className="w-4 h-4 text-success" />
                                        <span className="text-xs font-bold text-white group-hover:text-success">Discovery</span>
                                    </Link>
                                    <Link to="/inventory" className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-info/30 transition-all group">
                                        <Database className="w-4 h-4 text-info" />
                                        <span className="text-xs font-bold text-white group-hover:text-info">Inventory</span>
                                    </Link>
                                    <Link to="/forensics" className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl border-warning/30 transition-all group">
                                        <Shield className="w-4 h-4 text-warning" />
                                        <span className="text-xs font-bold text-white">Forensics</span>
                                    </Link>
                                    <Link to="/docs" className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/30 transition-all group">
                                        <Code className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-bold text-white">Docs</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Section 1: Forensic Capabilities */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-warning" /> Forensic_Tools
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Snapshot Grep</div>
                                            <div className="text-[9px] text-muted-foreground">Deep banner & header search</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 opacity-50">
                                        <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                            <History className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Time Travel</div>
                                            <div className="text-[9px] text-muted-foreground">Compare historical snapshots</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Investigation History */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History className="w-3 h-3 text-warning" /> Recent_Queries
                                </div>

                                <div className="space-y-2">
                                    {history.length > 0 ? (
                                        history.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    onHistoryClick?.(item);
                                                    onClose();
                                                }}
                                                className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:border-warning/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-warning" />
                                                    <span className="text-xs font-mono text-white/80 group-hover:text-white">{item}</span>
                                                </div>
                                                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl opacity-40">
                                            <div className="text-[10px] font-mono text-muted-foreground uppercase">Archive_Empty</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="mt-auto pt-8 border-t border-white/10">
                                <div className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Archive_Engine: READY</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-muted-foreground/30">H-ID: FORENSIC-01</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ForensicTacticalSidebar;
