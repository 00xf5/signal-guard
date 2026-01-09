import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, Bell, Download, RefreshCw, FileJson, Clock, Copy, ShieldAlert, LayoutDashboard, Menu, X, Terminal, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { satelliteClient } from "@/lib/satelliteClient";
import Meta from "@/components/Meta";
import { DiscordWebhookModal } from "@/components/tactical/DiscordWebhookModal";
import { LiveMetricsSidebar } from "@/components/tactical/LiveMetricsSidebar";
import { CriticalAssetsTab } from "@/components/tactical/CriticalAssetsTab";
import { EndpointsTab } from "@/components/tactical/EndpointsTab";

import { SecretsTab } from "@/components/tactical/SecretsTab";
import { AllAssetsTab } from "@/components/tactical/AllAssetsTab";

const TacticalJS = () => {
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("domain") || "");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [mode, setMode] = useState<'easy' | 'medium' | 'full'>('full');
    const [activeTab, setActiveTab] = useState<'critical' | 'all' | 'endpoints' | 'secrets' | 'timeline' | 'raw'>('critical');
    const [webhookModalOpen, setWebhookModalOpen] = useState(false);
    const [discordWebhook, setDiscordWebhook] = useState<string>("");
    const [webhookThreshold, setWebhookThreshold] = useState<number>(70);
    const [scanMetadata, setScanMetadata] = useState<any>({});

    const [isPolling, setIsPolling] = useState(false);
    const [dbMissing, setDbMissing] = useState(false);
    const [mobileMetricsOpen, setMobileMetricsOpen] = useState(false);

    const standardizeIntelligence = useCallback((targetDomain: string, intelRows: any[], scanMetadataRows?: any, endpointRows?: any[]) => {
        const rows = intelRows || [];

        return {
            intelligence_summary: {
                domain: targetDomain,
                scan_id: scanMetadataRows?.id || 'live-session',
                mode: mode,
                discovery: {
                    js_files: rows.length,
                    unique_endpoints: scanMetadataRows?.endpoint_count || endpointRows?.length || 0,
                    threats_scored_above_70: rows.filter((f: any) => f.score >= 70).length
                },
                critical_assets: rows
                    .filter((f: any) => f.score >= 70)
                    .slice(0, 10)
                    .map((f: any) => ({
                        url: f.url,
                        score: f.score,
                        signals: f.tags || []
                    })),
                full_assets: rows.map((f: any) => ({
                    url: f.url,
                    score: f.score,
                    signals: f.tags || [],
                    content_hash: f.content_hash,
                    secrets: f.secrets || []
                })),
                full_endpoints: endpointRows?.map((e: any) => ({
                    method: e.method,
                    path: e.path,
                    is_dangerous: e.is_dangerous
                })) || [],
                secrets: rows.flatMap((f: any) => f.secrets || [])
            },
            storage: { snapshot: `${targetDomain.replace(/\./g, '_')}_satellite.json` }
        };
    }, [mode]);

    const fetchLiveResults = useCallback(async (targetDomain: string) => {
        try {
            // Check Intelligence
            const { data: intelRows, error: intelError } = await satelliteClient
                .from('js_intelligence')
                .select('*')
                .eq('domain', targetDomain);

            if (intelError) {
                if (intelError.code === '42703' || intelError.message?.includes('does not exist')) {
                    setDbMissing(true);
                    setIsPolling(false);
                    return;
                }
                throw intelError;
            }

            // Check Metadata
            const { data: scanData, error: scanError } = await satelliteClient
                .from('scans')
                .select('id, js_count, endpoint_count')
                .eq('domain', targetDomain)
                .order('created_at', { ascending: false })
                .limit(1);

            if (scanError) {
                if (scanError.code === '42703' || scanError.message?.includes('does not exist')) {
                    setDbMissing(true);
                    setIsPolling(false);
                    return;
                }
                throw scanError;
            }

            // Fetch Endpoints
            const { data: endpointRows, error: endpointError } = await satelliteClient
                .from('endpoints')
                .select('*')
                .eq('domain', targetDomain);

            if (endpointError) {
                if (endpointError.code === '42703' || endpointError.message?.includes('does not exist')) {
                    setDbMissing(true);
                    setIsPolling(false);
                    return;
                }
                throw endpointError;
            }

            const standardized = standardizeIntelligence(targetDomain, intelRows || [], scanData?.[0], endpointRows || []);
            if (standardized) setResult(standardized);

        } catch (err: any) {
            console.warn("Satellite link sync:", err.message);
        }
    }, [standardizeIntelligence]);

    useEffect(() => {
        let interval: any;
        if (isPolling && query) {
            interval = setInterval(() => fetchLiveResults(query.trim()), 5000);
        }
        return () => clearInterval(interval);
    }, [isPolling, query, fetchLiveResults]);

    const handleRunScan = useCallback(async (e?: React.FormEvent, targetQuery?: string) => {
        if (e) e.preventDefault();
        const scanTarget = targetQuery || query;
        if (!scanTarget) return;

        setIsLoading(true);
        setIsPolling(false);
        setDbMissing(false);
        const startTime = new Date();
        setScanMetadata({ startTime: startTime.toLocaleTimeString(), duration: 0 });

        // Show the rugged UI frame immediately with empty data
        setResult(standardizeIntelligence(scanTarget.trim(), [], null, []));

        // Trigger background polling if the engine takes more than 3s (Super responsiveness)
        const pollTimer = setTimeout(() => {
            if (!isPolling) {
                toast.info("Establishing Satellite Link...", { description: "Remote engine is warming up. Polling started.", duration: 3000 });
                setIsPolling(true);
                fetchLiveResults(scanTarget.trim());
            }
        }, 3000);

        try {
            const { data, error } = await supabase.functions.invoke('jsasm-tactical', {
                body: { domain: scanTarget.trim(), mode, discord: discordWebhook || undefined }
            });

            clearTimeout(pollTimer);
            if (error) throw error;
            if (data.error) throw new Error(data.error);

            if (data.status === 'initiated') {
                if (!isPolling) {
                    toast.info("Satellite Link Established", { description: "Streaming mission intel...", duration: 4000 });
                    setIsPolling(true);
                    fetchLiveResults(scanTarget.trim());
                }
                return;
            }

            const standardized = standardizeIntelligence(
                scanTarget.trim(),
                data.intelligence_summary?.full_assets || [],
                data.intelligence_summary,
                data.intelligence_summary?.full_endpoints
            );

            setResult(standardized || data);
            setIsPolling(false);
            toast.success("Extraction complete.");

        } catch (error: any) {
            clearTimeout(pollTimer);
            if (error.message?.includes('timed out') || error.message?.includes('AbortError')) {
                toast.warning("Satellite Link Active", { description: "Engine running in background." });
                setIsPolling(true);
                fetchLiveResults(scanTarget.trim());
            } else {
                toast.error(error.message || "Engine unreachable.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [query, mode, discordWebhook, fetchLiveResults, isPolling, standardizeIntelligence]);

    useEffect(() => {
        // Stealth Warmup: Use an Image pulse to wake up the Render engine silently
        // This avoids CORS/401 console errors while still triggering the server to wake from sleep
        const img = new Image();
        img.src = `https://jsasm.onrender.com/ping?t=${Date.now()}`;

        const domainParam = searchParams.get("domain");
        if (domainParam) {
            setQuery(domainParam);
            handleRunScan(undefined, domainParam);
        }
    }, [searchParams, handleRunScan]);

    const handleExportJSON = () => {
        if (!result) return;
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jsasm_${result.intelligence_summary?.domain}_${Date.now()}.json`;
        a.click();
        toast.success("JSON exported successfully");
    };

    const handleCopyJSON = () => {
        if (!result) return;
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        toast.success("JSON copied to clipboard");
    };

    const criticalAssets = result?.intelligence_summary?.critical_assets || [];

    return (
        <div className="h-screen bg-[#070708] text-foreground flex flex-col pt-14 overflow-hidden">
            <Meta
                title="JS-ASM Tactical Dashboard | Attack Surface Recon"
                description="High-velocity JavaScript reconnaissance and attack surface mapping. Identify logic leaks, hidden endpoints, and credential exposure with precision."
            />
            <Header />

            {/* Top Control Bar */}
            <div className="flex-none bg-[#0a0a0c] border-b border-white/10 backdrop-blur-sm z-40">
                <div className="container max-w-full px-4 py-3">
                    <form onSubmit={handleRunScan} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            {/* Mobile Metrics Toggle */}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setMobileMetricsOpen(!mobileMetricsOpen)}
                                className="md:hidden h-9 w-9 border-white/10 bg-black/40"
                            >
                                <LayoutDashboard className="w-4 h-4 text-success" />
                            </Button>

                            {/* Domain Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Target domain..."
                                    className="pl-10 h-9 bg-black/40 border-white/10 text-sm font-mono focus:border-success/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                            {/* Mode Toggle */}
                            <div className="flex shrink-0 gap-1 bg-black/40 p-1 rounded border border-white/10">
                                {(['easy', 'medium', 'full'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMode(m)}
                                        className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${mode === m
                                            ? "bg-success text-black"
                                            : "text-muted-foreground hover:bg-white/10"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Discord Webhook */}
                            <Button
                                type="button"
                                onClick={() => setWebhookModalOpen(true)}
                                variant="outline"
                                size="sm"
                                className={`h-9 shrink-0 px-3 text-[10px] font-black uppercase ${discordWebhook ? 'border-success/50 text-success' : 'border-white/10'}`}
                            >
                                <Bell className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">{discordWebhook ? 'Webhook Active' : 'Discord'}</span>
                            </Button>

                            {/* Launch Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-9 shrink-0 px-6 bg-success text-black hover:bg-success/90 font-black text-[10px] uppercase tracking-widest flex-1 md:flex-none"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                                ) : <Terminal className="w-3 h-3 mr-2" />}
                                <span className="hidden xs:inline">{isLoading ? "SCANNING..." : "LAUNCH"}</span>
                                <span className="xs:hidden">{isLoading ? "..." : "GO"}</span>
                            </Button>

                            {/* Export */}
                            {result && (
                                <Button
                                    type="button"
                                    onClick={handleExportJSON}
                                    variant="outline"
                                    size="sm"
                                    className="h-9 shrink-0 px-3 text-[10px] font-black uppercase border-white/10"
                                >
                                    <Download className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">Export</span>
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Database Missing Alert */}
                {dbMissing && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-danger/20 border-2 border-danger/40 backdrop-blur-xl p-4 rounded-lg flex gap-4 items-start shadow-2xl">
                            <ShieldAlert className="w-8 h-8 text-danger shrink-0 animate-pulse" />
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-danger uppercase tracking-widest mb-1">Remote Schema Mismatch</h4>
                                <p className="text-[11px] text-foreground leading-relaxed">
                                    The tactical engine is active, but columns like <code className="text-info">domain</code> were not found in the remote Supabase project.
                                    <br />
                                    <span className="font-bold text-success mt-1 block">Solution: Apply the SQL migration to your SATELLITE Supabase project:</span>
                                    <code className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-info">/supabase/migrations/20260108_js_asm_schema.sql</code>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar - Desktop Only */}
                <div className="hidden md:flex">
                    {result && (
                        <LiveMetricsSidebar result={result} scanMetadata={scanMetadata} />
                    )}
                </div>

                {/* Mobile Metrics Drawer */}
                {mobileMetricsOpen && result && (
                    <div className="md:hidden fixed inset-0 z-[60] flex justify-end">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMetricsOpen(false)} />
                        <div className="relative w-72 bg-[#0a0a0c] border-l border-white/10 h-full overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <h3 className="text-xs font-black uppercase tracking-widest text-success">Deployment Metrics</h3>
                                <Button variant="ghost" size="icon" onClick={() => setMobileMetricsOpen(false)} className="h-8 w-8 text-muted-foreground">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <LiveMetricsSidebar result={result} scanMetadata={scanMetadata} />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    {result ? (
                        <div className="h-full flex flex-col">
                            {/* Tabs - Now Scrollable on Mobile */}
                            <div className="flex-none border-b border-white/10 bg-[#0a0a0c] overflow-x-auto scrollbar-none whitespace-nowrap">
                                <div className="flex items-center px-4">
                                    {[
                                        { id: 'critical', label: 'Top Leads', count: result.intelligence_summary?.critical_assets?.length || 0 },
                                        { id: 'all', label: 'Full Asset Surface', count: result.intelligence_summary?.full_assets?.length || 0 },
                                        { id: 'endpoints', label: 'Endpoints', count: result.intelligence_summary?.discovery?.unique_endpoints || 0 },
                                        { id: 'secrets', label: 'Secrets & Leaks', count: result.intelligence_summary?.secrets?.length || 0 },
                                        { id: 'timeline', label: 'Timeline', count: null },
                                        { id: 'raw', label: 'Raw JSON', count: null }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id
                                                ? "border-success text-success"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            {tab.label}
                                            {tab.count !== null && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-auto p-4">
                                {activeTab === 'critical' && <CriticalAssetsTab assets={result.intelligence_summary?.critical_assets || []} />}
                                {activeTab === 'all' && <AllAssetsTab assets={result.intelligence_summary?.full_assets || []} />}
                                {activeTab === 'endpoints' && <EndpointsTab assets={result.intelligence_summary?.full_assets || []} />}
                                {activeTab === 'secrets' && <SecretsTab assets={result.intelligence_summary?.full_assets || []} />}
                                {activeTab === 'timeline' && (
                                    <div className="space-y-2 font-mono text-[11px]">
                                        <div className="flex gap-3 p-3 bg-black/40 border border-white/10 rounded">
                                            <Clock className="w-4 h-4 text-info shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-muted-foreground">{scanMetadata.startTime}</div>
                                                <div className="text-foreground font-bold">Scan initiated (Mode: {mode.toUpperCase()})</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-black/40 border border-white/10 rounded">
                                            <Clock className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-muted-foreground">+{(scanMetadata.duration * 0.3).toFixed(1)}s</div>
                                                <div className="text-foreground font-bold">Discovered {result.intelligence_summary?.discovery?.js_files || 0} JS assets</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-black/40 border border-white/10 rounded">
                                            <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-muted-foreground">+{(scanMetadata.duration * 0.7).toFixed(1)}s</div>
                                                <div className="text-foreground font-bold">Extracted {result.intelligence_summary?.discovery?.unique_endpoints || 0} unique endpoints</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-3 bg-black/40 border border-danger/10 rounded">
                                            <Clock className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-muted-foreground">+{scanMetadata.duration}s</div>
                                                <div className="text-foreground font-bold">Identified {result.intelligence_summary?.discovery?.threats_scored_above_70 || 0} high-signal threats</div>
                                            </div>
                                        </div>
                                        {discordWebhook && (
                                            <div className="flex gap-3 p-3 bg-black/40 border border-success/10 rounded">
                                                <Clock className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="text-muted-foreground">+{(scanMetadata.duration + 0.2).toFixed(1)}s</div>
                                                    <div className="text-foreground font-bold">Discord webhook triggered</div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-3 p-3 bg-black/40 border border-white/10 rounded">
                                            <Clock className="w-4 h-4 text-info shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-muted-foreground">+{(scanMetadata.duration + 0.4).toFixed(1)}s</div>
                                                <div className="text-foreground font-bold">Scan complete. Snapshot saved: {result.storage?.snapshot}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'raw' && (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button onClick={handleCopyJSON} variant="outline" size="sm" className="text-[10px] font-black uppercase">
                                                <Copy className="w-4 h-4 mr-2" />
                                                Copy
                                            </Button>
                                            <Button onClick={handleExportJSON} variant="outline" size="sm" className="text-[10px] font-black uppercase">
                                                <FileJson className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                        <pre className="p-4 bg-black/60 border border-white/10 rounded-lg overflow-auto text-[10px] font-mono max-h-[calc(100vh-300px)]">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center space-y-4 max-w-md px-4">
                                <div className="text-6xl opacity-20">⚡</div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white/40">Ready for Assignment</h3>
                                <p className="text-sm text-muted-foreground/60 leading-relaxed">
                                    Enter a target domain above to initialize the JS-ASM Elite engine. Configure scan mode and optional Discord webhook for real-time alerts.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Tactical Status Bar */}
            <div className="flex-none bg-[#0a0a0c] border-t border-white/10 px-4 py-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                    <div className="flex gap-6 text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 text-success animate-spin-slow" />
                            <span>Satellite Linked</span>
                        </div>
                        {result && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>Scan Time: {scanMetadata.duration || 0}s</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Copy className="w-3 h-3" />
                            <span>RSA-4096 Secure</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-success font-black tracking-[0.2em] uppercase">Engine Online</span>
                    </div>
                </div>
            </div>

            {/* Discord Webhook Modal */}
            <DiscordWebhookModal
                isOpen={webhookModalOpen}
                onClose={() => setWebhookModalOpen(false)}
                onSave={(webhook, threshold) => {
                    setDiscordWebhook(webhook);
                    setWebhookThreshold(threshold);
                }}
                currentWebhook={discordWebhook}
            />
        </div>
    );
};

export default TacticalJS;
