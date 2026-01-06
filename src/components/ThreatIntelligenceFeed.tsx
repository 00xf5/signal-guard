import React from "react";
import { motion } from "framer-motion";
import {
    Zap, Shield, AlertTriangle,
    Globe, Terminal, Radio,
    Activity, Clock, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface ThreatEvent {
    id: string;
    target: string;
    type: 'critical' | 'suspicious' | 'safe';
    source: string;
    timestamp: string;
    label: string;
}

interface ThreatIntelligenceFeedProps {
    events: ThreatEvent[];
}

const ThreatIntelligenceFeed: React.FC<ThreatIntelligenceFeedProps> = ({ events }) => {
    const getSeverityColor = (type: string) => {
        switch (type) {
            case 'critical': return 'text-danger bg-danger/10 border-danger/20';
            case 'suspicious': return 'text-warning bg-warning/10 border-warning/20';
            default: return 'text-success bg-success/10 border-success/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-danger animate-pulse" />
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground">Live_Threat_Stream</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-muted-foreground uppercase">
                    Frequency: 2.4Hz
                </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {events.length > 0 ? (
                    events.map((event, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={event.id}
                            className="group relative"
                        >
                            <Link
                                to={`/${event.target}/detailed`}
                                className="block p-4 bg-terminal-bg/40 border border-panel-border rounded-2xl hover:border-info/30 transition-all hover:bg-terminal-bg/60"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${event.type === 'critical' ? 'bg-danger shadow-[0_0_8px_#ef4444]' : event.type === 'suspicious' ? 'bg-warning' : 'bg-success'}`} />
                                        <span className="text-[10px] font-mono font-bold text-foreground truncate max-w-[120px]">{event.target}</span>
                                    </div>
                                    <span className="text-[8px] font-mono text-muted-foreground uppercase">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                </div>

                                <div className="text-[11px] font-medium text-foreground/80 mb-3 group-hover:text-foreground transition-colors">
                                    {event.label}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${getSeverityColor(event.type)}`}>
                                            {event.type}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-white/5 bg-white/5 text-muted-foreground">
                                            {event.source}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center border border-dashed border-panel-border rounded-3xl opacity-40">
                        <Terminal className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                        <div className="text-[10px] font-mono uppercase tracking-widest">Awaiting_Inbound_Signals</div>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-panel-border">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Global_Health</div>
                        <div className="text-sm font-black text-success">98.4%</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[8px] font-mono text-muted-foreground uppercase mb-1">Active_Nodes</div>
                        <div className="text-sm font-black text-info">1.2M</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatIntelligenceFeed;
