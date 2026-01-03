import React from "react";
import {
    Clock,
    Zap,
    Shield,
    Network,
    Fingerprint,
    Cpu,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface Change {
    type: string;
    category: 'network' | 'application' | 'infrastructure' | 'security' | 'identity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    old: any;
    new: any;
    desc: string;
}

interface DiscoveryTimelineProps {
    version: number;
    changes: Change[];
    findings: any[];
}

const DiscoveryTimeline: React.FC<DiscoveryTimelineProps> = ({ version, changes, findings }) => {
    const hasChanges = changes && changes.length > 0;

    // Severity Compression
    const criticals = findings.filter(f => f.score >= 50).length + changes.filter(c => c.severity === 'critical').length;
    const highs = findings.filter(f => f.score >= 25 && f.score < 50).length + changes.filter(c => c.severity === 'high').length;
    const lows = findings.filter(f => f.score < 25).length + changes.filter(c => c.severity === 'low' || c.severity === 'medium').length;

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'network': return <Network className="w-4 h-4" />;
            case 'security': return <Shield className="w-4 h-4" />;
            case 'application': return <Cpu className="w-4 h-4" />;
            case 'identity': return <Fingerprint className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };

    const getSeverityStyles = (sev: string) => {
        switch (sev) {
            case 'critical': return 'text-danger border-danger/20 bg-danger/5 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]';
            case 'high': return 'text-warning border-warning/20 bg-warning/5';
            case 'medium': return 'text-info border-info/20 bg-info/5';
            default: return 'text-success border-success/20 bg-success/5';
        }
    };

    return (
        <div className="space-y-8">
            {/* Version & Severity Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/20 border border-info/30 text-info">
                        <span className="font-black text-sm">v{version}</span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Snapshot State</div>
                        <div className="text-sm font-mono text-foreground font-bold italic">Linear Forensic Timeline</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {criticals > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                            </span>
                            {criticals} CRITICAL
                        </div>
                    )}
                    {highs > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-[10px] font-bold uppercase tracking-tighter">
                            🔥 {highs} HIGH
                        </div>
                    )}
                    <div className="text-[10px] font-mono text-muted-foreground bg-white/5 border border-white/10 px-2 py-1 rounded">
                        {lows} SUB-CRITICAL EVENTS
                    </div>
                </div>
            </div>

            {/* Main Timeline Column */}
            <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-info/50 before:via-border/50 before:to-transparent">

                {/* 1. Changes (Events) */}
                {hasChanges ? (
                    changes.map((change, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={i}
                            className="relative"
                        >
                            <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-info flex items-center justify-center z-10">
                                <Zap className="w-3 h-3 text-info" />
                            </div>
                            <div className={`p-4 rounded-xl border ${getSeverityStyles(change.severity)}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded bg-background border border-border">
                                            {getCategoryIcon(change.category)}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest">{change.type.replace('_', ' ')}</span>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-60">DETECTED NOW</span>
                                </div>
                                <p className="text-sm text-foreground font-medium mb-3">{change.desc}</p>
                                <div className="flex items-center gap-3 text-[11px] font-mono p-2 rounded-lg bg-black/40 border border-white/5">
                                    <span className="line-through opacity-40">{JSON.stringify(change.old?.val) || 'null'}</span>
                                    <ArrowRight className="w-3 h-3 opacity-40" />
                                    <span className="text-success font-bold">{JSON.stringify(change.new?.val) || 'active'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="relative">
                        <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-success flex items-center justify-center z-10">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                        </div>
                        <div className="p-6 rounded-xl border border-success/20 bg-success/5">
                            <h4 className="text-sm font-bold text-success mb-1">State Integrity Confirmed</h4>
                            <p className="text-xs text-muted-foreground italic">SHA-256 match vs. previous snapshot. No behavioral or infrastructure drift detected during this scan lifecycle.</p>
                        </div>
                    </div>
                )}

                {/* 2. Risk Findings (Static but snapshot-linked) */}
                {findings.map((finding, i) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (changes.length + i) * 0.1 }}
                        key={`finding-${i}`}
                        className="relative"
                    >
                        <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-background border-2 border-danger flex items-center justify-center z-10 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                            <AlertCircle className="w-3 h-3 text-danger animate-pulse" />
                        </div>
                        <div className="p-4 rounded-xl border border-danger/10 bg-black/40 backdrop-blur-sm group hover:border-danger/30 transition-all">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black p-1 px-2 rounded bg-danger/20 text-danger uppercase tracking-tighter">
                                    HEURISTIC VIOLATION
                                </span>
                                <span className="text-[14px] font-black text-danger">+{finding.calculated_score}</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-foreground opacity-90 capitalize">
                                    {finding.rule_id ? finding.rule_id.split('-').join(' ') : 'Security Risk Detected'}
                                </p>
                                <div className="p-2 rounded bg-white/5 text-[10px] font-mono text-muted-foreground border border-white/5">
                                    EVIDENCE: {JSON.stringify(finding.evidence)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <div className="relative pt-4 text-center">
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">End of Forensic Record</div>
                </div>
            </div>
        </div>
    );
};

export default DiscoveryTimeline;
