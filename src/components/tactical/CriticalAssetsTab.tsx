import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CriticalAssetsTabProps {
    assets: any[];
}

export const CriticalAssetsTab: React.FC<CriticalAssetsTabProps> = ({ assets }) => {
    const [scoreFilter, setScoreFilter] = useState<number>(0);
    const [signalFilter, setSignalFilter] = useState<string>("");

    const filteredAssets = assets.filter(asset => {
        if (scoreFilter > 0 && asset.score < scoreFilter) return false;
        if (signalFilter && !asset.signals?.some((s: string) => s.toLowerCase().includes(signalFilter.toLowerCase()))) return false;
        return true;
    });

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-red-500 border-red-500/50 bg-red-500/10";
        if (score >= 70) return "text-orange-500 border-orange-500/50 bg-orange-500/10";
        if (score >= 50) return "text-yellow-500 border-yellow-500/50 bg-yellow-500/10";
        return "text-green-500 border-green-500/50 bg-green-500/10";
    };

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap flex-1">
                    {[
                        { label: "All", value: 0 },
                        { label: "≥ 50", value: 50 },
                        { label: "≥ 70", value: 70 },
                        { label: "≥ 90", value: 90 }
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setScoreFilter(filter.value)}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${scoreFilter === filter.value
                                    ? "bg-success text-black"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                    {["IDOR", "XSS", "Auth"].map((sig) => (
                        <button
                            key={sig}
                            onClick={() => setSignalFilter(signalFilter === sig ? "" : sig)}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${signalFilter === sig
                                    ? "bg-info text-black"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                        >
                            {sig}
                        </button>
                    ))}
                    {(scoreFilter > 0 || signalFilter) && (
                        <button
                            onClick={() => {
                                setScoreFilter(0);
                                setSignalFilter("");
                            }}
                            className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-danger/20 text-danger hover:bg-danger/30 transition-all flex items-center gap-1"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">
                    {filteredAssets.length} / {assets.length}
                </div>
            </div>

            {/* Assets List */}
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                    {filteredAssets.map((asset, i) => {
                        const idorLeads = asset.signals?.filter((s: string) =>
                            s.toLowerCase().includes('idor') || s.toLowerCase().includes('lead')
                        ) || [];

                        return (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 bg-[#0a0a0c] border border-white/10 rounded-lg hover:border-success/30 transition-all group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Score Badge */}
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-lg border-2 ${getScoreColor(asset.score)} font-black text-xl font-mono shrink-0`}>
                                        {asset.score}
                                    </div>

                                    {/* Asset Info */}
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">JS Asset</div>
                                                <a
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-mono text-foreground hover:text-success transition-colors break-all block group-hover:underline"
                                                >
                                                    {asset.url.split('?')[0]}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Signals */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {asset.signals?.slice(0, 8).map((sig: string, idx: number) => {
                                                const isHighRisk = sig.toLowerCase().includes('idor') ||
                                                    sig.toLowerCase().includes('lead') ||
                                                    sig.toLowerCase().includes('auth') ||
                                                    sig.toLowerCase().includes('payment');
                                                return (
                                                    <span
                                                        key={idx}
                                                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${isHighRisk
                                                                ? "bg-danger/10 text-danger border-danger/20"
                                                                : "bg-white/5 text-muted-foreground border-white/10"
                                                            }`}
                                                    >
                                                        {sig.replace(/-/g, ' ').slice(0, 20)}
                                                    </span>
                                                );
                                            })}
                                            {asset.signals?.length > 8 && (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono text-muted-foreground bg-white/5">
                                                    +{asset.signals.length - 8} more
                                                </span>
                                            )}
                                        </div>

                                        {/* IDOR Leads */}
                                        {idorLeads.length > 0 && (
                                            <div className="pt-2 border-t border-white/5">
                                                <div className="text-[9px] font-black text-danger uppercase tracking-wider mb-1.5">High-Fidelity Leads:</div>
                                                <div className="space-y-1">
                                                    {idorLeads.map((lead: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-[10px] font-mono text-danger/90 bg-danger/5 border border-danger/10 rounded px-2 py-1">
                                                            <div className="w-1 h-1 rounded-full bg-danger animate-pulse shrink-0" />
                                                            {lead}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredAssets.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <div className="text-4xl mb-4">🔍</div>
                        <div className="text-sm font-mono">No assets match the current filters</div>
                    </div>
                )}
            </div>
        </div>
    );
};
