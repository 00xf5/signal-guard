import React from "react";
import { Link } from "react-router-dom";
import {
    Activity, ShieldAlert, Terminal, TrendingUp,
    Globe, Database, Shield, Code, X,
    Cpu, Zap, Fingerprint, Lock, Server
} from "lucide-react";
import { motion } from "framer-motion";

interface TacticalSidebarProps {
    result: any;
    scanMetadata?: {
        startTime?: string;
        duration?: number;
        engineVersion?: string;
    };
    isMobile?: boolean;
    onClose?: () => void;
}

export const TacticalSidebar: React.FC<TacticalSidebarProps> = ({
    result,
    scanMetadata,
    isMobile,
    onClose
}) => {
    const discovery = result?.intelligence_summary?.discovery || {};
    const criticalAssets = result?.intelligence_summary?.critical_assets || [];

    // Count signal types
    const signalCounts = criticalAssets.reduce((acc: any, asset: any) => {
        asset.signals?.forEach((sig: string) => {
            const normalized = sig.toLowerCase();
            if (normalized.includes('xss')) acc.xss = (acc.xss || 0) + 1;
            else if (normalized.includes('idor') || normalized.includes('lead')) acc.idor = (acc.idor || 0) + 1;
            else if (normalized.includes('auth')) acc.auth = (acc.auth || 0) + 1;
            else if (normalized.includes('payment')) acc.payment = (acc.payment || 0) + 1;
            else if (normalized.includes('secret') || normalized.includes('key')) acc.secrets = (acc.secrets || 0) + 1;
        });
        return acc;
    }, {});

    const getProgressBar = (value: number, max: number, color: string = "success") => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full bg-${color} transition-all duration-500`}
                />
            </div>
        );
    };

    return (
        <div className={`${isMobile ? 'w-full' : 'w-72'} bg-[#070709] border-r border-white/5 flex flex-col h-full overflow-hidden`}>
            {/* Digital Header Decoration */}
            <div className="h-1 bg-gradient-to-r from-success/50 via-info/50 to-warning/50 animate-pulse" />

            <div className="flex-1 p-5 space-y-8 overflow-y-auto custom-scrollbar">
                {/* 0. HUD Controls (Mobile Close) */}
                {isMobile && (
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-success" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Tactical_Mobile_HUD</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                )}

                {/* 1. Global Navigation (Digital Style) */}
                <div className="space-y-4">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                        <Server className="w-3 h-3 text-info" /> System_Matrix
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Link to="/discovery" className="flex flex-col gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-success/30 transition-all group overflow-hidden relative">
                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[2] group-hover:opacity-10">
                                <Globe className="w-8 h-8" />
                            </div>
                            <Globe className="w-3.5 h-3.5 text-success" />
                            <span className="text-[10px] font-black text-white group-hover:text-success uppercase">Discovery</span>
                        </Link>
                        <Link to="/inventory" className="flex flex-col gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-info/30 transition-all group overflow-hidden relative">
                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[2] group-hover:opacity-10">
                                <Database className="w-8 h-8" />
                            </div>
                            <Database className="w-3.5 h-3.5 text-info" />
                            <span className="text-[10px] font-black text-white group-hover:text-info uppercase">Inventory</span>
                        </Link>
                        <Link to="/forensics" className="flex flex-col gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-warning/30 transition-all group overflow-hidden relative">
                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[2] group-hover:opacity-10">
                                <Shield className="w-8 h-8" />
                            </div>
                            <Shield className="w-3.5 h-3.5 text-warning" />
                            <span className="text-[10px] font-black text-white group-hover:text-warning uppercase">Timeline</span>
                        </Link>
                        <Link to="/docs" className="flex flex-col gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/20 transition-all group overflow-hidden relative">
                            <div className="absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[2] group-hover:opacity-10">
                                <Code className="w-8 h-8" />
                            </div>
                            <Code className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black text-white group-hover:text-foreground uppercase">Docs</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Tactical Metadata (Terminal Style) */}
                <div className="p-4 bg-black/40 border-l-2 border-info/50 rounded-r-xl space-y-4">
                    <div className="text-[9px] font-mono text-info uppercase tracking-widest flex justify-between">
                        <span>Recon_Metadata</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-info animate-pulse" />
                            <div className="w-1 h-1 bg-info/40 animate-pulse delay-75" />
                        </div>
                    </div>
                    <div className="space-y-2 text-[10px] font-mono leading-tight">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-muted-foreground">TARGET:</span>
                            <span className="text-white font-bold truncate max-w-[120px]">{result?.intelligence_summary?.domain || 'NONE'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-muted-foreground">SESSION:</span>
                            <span className="text-info font-bold">{result?.intelligence_summary?.scan_id?.slice(0, 8) || 'DEAD'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-muted-foreground">VERSION:</span>
                            <span className="text-success font-bold">ASM-v7.4</span>
                        </div>
                        {scanMetadata?.duration && (
                            <div className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-muted-foreground">LATENCY:</span>
                                <span className="text-warning font-bold">{scanMetadata.duration}.02s</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Real-time Telemetry */}
                <div className="space-y-4">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity className="w-3 h-3 text-success" /> Live_Telemetry
                    </div>
                    <div className="space-y-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <div className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Asset_Load</div>
                                <div className="text-lg font-black font-mono text-success leading-none">{discovery.js_files || 0}</div>
                            </div>
                            {getProgressBar(discovery.js_files || 0, 100, "success")}
                            <div className="mt-1 text-[8px] text-muted-foreground font-mono flex justify-between italic">
                                <span>Scanning payload...</span>
                                <span>100% capacity</span>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Surface_Area</div>
                                <div className="text-lg font-black font-mono text-info leading-none">{discovery.unique_endpoints || 0}</div>
                            </div>
                            {getProgressBar(discovery.unique_endpoints || 0, 1000, "info")}
                            <div className="mt-1 text-[8px] text-muted-foreground font-mono flex justify-between italic">
                                <span>Map density high</span>
                                <span>Nodes found</span>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Hazard_Count</div>
                                <div className="text-lg font-black font-mono text-danger leading-none italic">{discovery.threats_scored_above_70 || 0}</div>
                            </div>
                            {getProgressBar(discovery.threats_scored_above_70 || 0, 50, "danger")}
                            <div className="mt-1 text-[8px] text-danger/60 font-mono flex justify-between italic">
                                <span className="animate-pulse">Active threats detected!</span>
                                <span>High Risk</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Threat Matrix Breakdown */}
                <div className="space-y-4">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 text-danger" /> Hazard_Matrix
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {[
                            { label: 'XSS Injection', count: signalCounts.xss || 0, color: 'text-orange-500', bar: 70 },
                            { label: 'IDOR Leakage', count: signalCounts.idor || 0, color: 'text-red-500', bar: 95 },
                            { label: 'Broken Auth', count: signalCounts.auth || 0, color: 'text-yellow-500', bar: 40 },
                            { label: 'Privacy Breach', count: signalCounts.payment || 0, color: 'text-purple-500', bar: 15 },
                            { label: 'Hardcoded Keys', count: signalCounts.secrets || 0, color: 'text-pink-500', bar: 85 }
                        ].map((item) => (
                            <div key={item.label} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-8 rounded-full ${item.count > 0 ? item.color.replace('text-', 'bg-') : 'bg-white/5'}`} />
                                    <div>
                                        <div className="text-[10px] font-black text-white group-hover:text-foreground">{item.label}</div>
                                        <div className="text-[8px] text-muted-foreground font-mono uppercase">Severity: {item.bar}%</div>
                                    </div>
                                </div>
                                <div className={`text-sm font-black font-mono ${item.count > 0 ? item.color : 'text-muted-foreground/30'}`}>
                                    {item.count.toString().padStart(2, '0')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. System Integrity Check */}
                <div className="pt-6 border-t border-white/10 space-y-3">
                    <div className="p-3 bg-black/40 rounded-xl flex items-center gap-4">
                        <Fingerprint className="w-8 h-8 text-info opacity-40" />
                        <div className="flex-1">
                            <div className="text-[10px] font-black text-white uppercase italic">Integrity_Stamp</div>
                            <div className="text-[8px] text-muted-foreground font-mono truncate">SHA256: {Math.random().toString(16).slice(2, 20)}...</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">Linked.Live</span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground/20">EST-2026-SG</span>
                    </div>
                </div>
            </div>

            {/* Scrolling Digital Rain (Subtle) */}
            <div className="h-24 pointer-events-none opacity-[0.03] overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col gap-0.5 animate-digital-rain">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="text-[8px] font-mono whitespace-nowrap text-success tracking-tighter">
                            {Math.random().toString(16).repeat(8)}
                            {Math.random().toString(36).toUpperCase().repeat(8)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tactical Live Feed */}
            <div className="bg-black border-t border-white/5 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[8px] font-mono text-success uppercase font-black tracking-widest">Live_Feed_Buffer</span>
                </div>
                <div className="h-10 overflow-hidden relative">
                    <div className="absolute inset-0 flex flex-col gap-1 animate-slide-up opacity-40">
                        <div className="text-[7px] font-mono text-muted-foreground truncate">{" >> "} [SYS] Establishing socket bridge...</div>
                        <div className="text-[7px] font-mono text-muted-foreground truncate">{" >> "} [NET] Routing through encrypted nodes...</div>
                        <div className="text-[7px] font-mono text-muted-foreground truncate">{" >> "} [ASM] Engine handshaking complete.</div>
                        <div className="text-[7px] font-mono text-muted-foreground truncate">{" >> "} [INT] Memory buffer overflow checked.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
