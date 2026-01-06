import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    X, Database, Activity, Zap,
    Globe, Terminal, Shield, Code, ChevronRight
} from "lucide-react";

interface InventorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orgsCount: number;
}

const InventoryTacticalSidebar: React.FC<InventorySidebarProps> = ({
    isOpen,
    onClose,
    orgsCount
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
                        className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-app-bg border-l border-panel-border z-[101] lg:hidden overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-6 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-panel-border pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-info/10 rounded-lg">
                                        <Database className="w-4 h-4 text-info" />
                                    </div>
                                    <span className="text-xs font-mono font-black text-foreground uppercase tracking-widest">Inventory_HUD</span>
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
                                    <Link to="/inventory" className="flex items-center gap-2 p-3 bg-terminal-bg/50 border border-panel-border rounded-xl border-info/30 transition-all group">
                                        <Database className="w-4 h-4 text-info" />
                                        <span className="text-xs font-bold text-foreground">Inventory</span>
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

                            {/* Section 1: ASM Stats */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-info" /> Surface_Metrics
                                </div>
                                <div className="p-5 bg-terminal-bg/30 border border-panel-border rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                        <Database className="w-16 h-16" />
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Tracked_Entities</div>
                                    <div className="text-4xl font-black text-foreground italic">{orgsCount}</div>
                                    <div className="mt-4 pt-4 border-t border-panel-border">
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-muted-foreground uppercase">Sync_Status:</span>
                                            <span className="text-success font-bold">STABLE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Quick Actions */}
                            <div className="space-y-4">
                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-warning" /> Tactical_Shortcuts
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <Link to="/discovery" className="flex items-center justify-between p-4 bg-info/5 border border-info/20 rounded-xl hover:bg-info/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-4 h-4 text-info" />
                                            <div>
                                                <div className="text-xs font-bold text-foreground">Launch Recon</div>
                                                <div className="text-[9px] text-muted-foreground">Map new infrastructure</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-info transition-all" />
                                    </Link>
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="mt-auto pt-8 border-t border-panel-border">
                                <div className="p-4 bg-black/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
                                        <span className="text-[10px] font-mono text-muted-foreground uppercase">ASM_CORE: ACTIVE</span>
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

export default InventoryTacticalSidebar;
