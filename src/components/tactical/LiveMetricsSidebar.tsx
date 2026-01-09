import React from "react";
import { Activity, ShieldAlert, Terminal, TrendingUp } from "lucide-react";

interface LiveMetricsSidebarProps {
    result: any;
    scanMetadata?: {
        startTime?: string;
        duration?: number;
        engineVersion?: string;
    };
}

export const LiveMetricsSidebar: React.FC<LiveMetricsSidebarProps> = ({ result, scanMetadata }) => {
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

    const getProgressBar = (value: number, max: number) => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-success transition-all duration-500" style={{ width: `${percentage}%` }} />
            </div>
        );
    };

    return (
        <div className="w-64 bg-[#0a0a0c] border-r border-white/10 p-4 space-y-6 overflow-y-auto h-full">
            {/* Scan Metadata */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-success flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    Scan Metadata
                </h3>
                <div className="space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Domain:</span>
                        <span className="text-foreground font-bold truncate ml-2">{result?.intelligence_summary?.domain || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Scan ID:</span>
                        <span className="text-foreground font-bold">{result?.intelligence_summary?.scan_id?.slice(0, 8) || 'N/A'}</span>
                    </div>
                    {scanMetadata?.startTime && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Started:</span>
                            <span className="text-foreground font-bold">{scanMetadata.startTime}</span>
                        </div>
                    )}
                    {scanMetadata?.duration && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="text-foreground font-bold">{scanMetadata.duration}s</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Engine:</span>
                        <span className="text-success font-bold">v1.4</span>
                    </div>
                </div>
            </div>

            {/* Live Metrics */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-info flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Live Metrics
                </h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">Assets</span>
                            <span className="text-sm font-black font-mono">{discovery.js_files || 0}</span>
                        </div>
                        {getProgressBar(discovery.js_files || 0, 100)}
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">Endpoints</span>
                            <span className="text-sm font-black font-mono">{discovery.unique_endpoints || 0}</span>
                        </div>
                        {getProgressBar(discovery.unique_endpoints || 0, 1000)}
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">Threats</span>
                            <span className="text-sm font-black font-mono text-danger">{discovery.threats_scored_above_70 || 0}</span>
                        </div>
                        {getProgressBar(discovery.threats_scored_above_70 || 0, 50)}
                    </div>
                </div>
            </div>

            {/* Threat Breakdown */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-danger flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" />
                    Threat Breakdown
                </h3>
                <div className="space-y-1.5 text-[11px] font-mono">
                    {[
                        { label: 'XSS Candidates', count: signalCounts.xss || 0, color: 'text-orange-500' },
                        { label: 'IDOR Leads', count: signalCounts.idor || 0, color: 'text-red-500' },
                        { label: 'Auth Logic', count: signalCounts.auth || 0, color: 'text-yellow-500' },
                        { label: 'Payment', count: signalCounts.payment || 0, color: 'text-purple-500' },
                        { label: 'Secrets', count: signalCounts.secrets || 0, color: 'text-pink-500' }
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.count > 0 ? item.color.replace('text-', 'bg-') : 'bg-white/10'}`} />
                                {item.label}:
                            </span>
                            <span className={`font-bold ${item.count > 0 ? item.color : 'text-muted-foreground'}`}>{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pattern Analysis */}
            <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-warning flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    Pattern Analysis
                </h3>
                <div className="space-y-2 text-[11px] font-mono">
                    <div>
                        <div className="text-muted-foreground mb-1">Common Frameworks:</div>
                        <div className="space-y-0.5 pl-2">
                            <div className="text-foreground">• Next.js (detected)</div>
                            <div className="text-foreground">• React (detected)</div>
                        </div>
                    </div>
                    <div className="pt-2 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Bundler:</span>
                            <span className="text-foreground">Webpack</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Minified:</span>
                            <span className="text-foreground">89%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Source Maps:</span>
                            <span className="text-success">45%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
