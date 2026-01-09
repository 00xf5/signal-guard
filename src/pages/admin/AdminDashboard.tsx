import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Terminal, Database, Key, Activity,
    Globe, Users, ShieldAlert, Cpu,
    Zap, Trash2, RefreshCw, Eye,
    Lock, Power, Search, Filter,
    ShieldCheck, ClipboardList, UploadCloud,
    CheckCircle2, XCircle, AlertTriangle,
    ChevronRight, Save, Shield, Network
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Meta from "@/components/Meta";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        orgs: 0,
        assets: 0,
        findings: 0,
        api_keys: 0
    });
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [scans, setScans] = useState<any[]>([]);
    const [riskRules, setRiskRules] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('api_keys');

    const [bulkInput, setBulkInput] = useState("");
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        const session = sessionStorage.getItem('admin_session');
        if (!session) {
            navigate("/admin/login");
            return;
        }
        fetchData();
        logAuditAction('LOGIN', { status: 'success' });
    }, [navigate]);

    const logAuditAction = async (action: string, details: any) => {
        const adminEmail = sessionStorage.getItem('admin_email');
        if (!adminEmail) return;

        try {
            await supabase.from('admin_audit_logs').insert([{
                admin_email: adminEmail,
                action,
                details,
                ip_address: 'tactical_proxy' // Generic for now
            }]);
        } catch (error) {
            console.error("Audit log failed:", error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { count: orgCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
            const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
            const { count: findingsCount } = await supabase.from('risk_findings').select('*', { count: 'exact', head: true });
            const { count: keyCount } = await supabase.from('api_access').select('*', { count: 'exact', head: true });

            setStats({
                orgs: orgCount || 0,
                assets: assetCount || 0,
                findings: findingsCount || 0,
                api_keys: keyCount || 0
            });

            const [
                { data: keys },
                { data: orgs },
                { data: scanData },
                { data: rules },
                { data: logs }
            ] = await Promise.all([
                supabase.from('api_access').select('*').order('created_at', { ascending: false }),
                supabase.from('organizations').select('*').order('created_at', { ascending: false }),
                supabase.from('scans').select('*').order('started_at', { ascending: false }).limit(15),
                supabase.from('risk_rules').select('*').order('weight', { ascending: false }),
                supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(20)
            ]);

            setApiKeys(keys || []);
            setOrganizations(orgs || []);
            setScans(scanData || []);
            setRiskRules(rules || []);
            setAuditLogs(logs || []);

        } catch (error) {
            console.error("Data fetch error:", error);
            toast.error("Failed to sync command center data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logAuditAction('LOGOUT', { status: 'manual' });
        sessionStorage.removeItem('admin_session');
        sessionStorage.removeItem('admin_email');
        sessionStorage.removeItem('admin_key');
        toast.info("Command Center session terminated.");
        navigate("/admin/login");
    };

    const handleTopUp = async (id: string, email: string) => {
        const adminEmail = sessionStorage.getItem('admin_email');
        const adminKey = sessionStorage.getItem('admin_key');

        try {
            const { data: success, error } = await supabase.rpc('secure_admin_top_up', {
                p_email: adminEmail,
                p_password: adminKey,
                p_key_id: id
            });

            if (error || !success) throw new Error(error?.message || "Verification failed");

            toast.success("API Key limits reset and telemetry recharged.");
            fetchData();
        } catch (error) {
            toast.error("Security authorization failed.");
        }
    };

    const handleDeleteOrg = async (id: string, name: string) => {
        if (!confirm(`Confirm destruction of organization profile: ${name}?`)) return;

        const adminEmail = sessionStorage.getItem('admin_email');
        const adminKey = sessionStorage.getItem('admin_key');

        try {
            const { data: success, error } = await supabase.rpc('secure_admin_purge_org', {
                p_email: adminEmail,
                p_password: adminKey,
                p_org_id: id
            });

            if (error || !success) throw new Error(error?.message || "Verification failed");

            toast.success(`${name} purged from tactical registry.`);
            fetchData();
        } catch (error) {
            toast.error("Purge operation failed.");
        }
    };

    const toggleRiskRule = async (ruleId: string, currentStatus: boolean, ruleSlug: string) => {
        const adminEmail = sessionStorage.getItem('admin_email');
        const adminKey = sessionStorage.getItem('admin_key');

        try {
            const { data: success, error } = await supabase.rpc('secure_admin_toggle_rule', {
                p_email: adminEmail,
                p_password: adminKey,
                p_rule_id: ruleId,
                p_status: !currentStatus
            });

            if (error || !success) throw new Error(error?.message || "Verification failed");

            toast.success(`Rule [${ruleSlug}] ${!currentStatus ? 'enabled' : 'disabled'}.`);
            fetchData();
        } catch (error) {
            toast.error("Failed to toggle risk policy.");
        }
    };

    const handleBulkImport = async () => {
        if (!bulkInput.trim()) return;
        setIsImporting(true);

        const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        const imported = [];
        const failed = [];

        for (const line of lines) {
            try {
                // Simple organization seeding logic
                const name = line.split('.')[0].charAt(0).toUpperCase() + line.split('.')[0].slice(1);
                const { error } = await supabase.from('organizations').insert([{
                    name: name,
                    root_domain: line,
                    confidence_score: 100
                }]);

                if (error) throw error;
                imported.push(line);
            } catch (err) {
                failed.push(line);
            }
        }

        logAuditAction('BULK_IMPORT', {
            total: lines.length,
            success: imported.length,
            failed: failed.length,
            targets: imported
        });

        toast.success(`Import Complete: ${imported.length} loaded, ${failed.length} skipped.`);
        setBulkInput("");
        setIsImporting(false);
        fetchData();
    };

    return (
        <div className="min-h-screen bg-black text-foreground/80 font-sans">
            <Meta title="Command_Center | RiskSignal" noindex={true} />
            <Header />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-white flex items-center gap-4">
                            <Terminal className="w-10 h-10 text-info" /> COMMAND_CENTER
                        </h1>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Tactical_Node: {sessionStorage.getItem('admin_email')} // ONLINE
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Sync_Cache
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500/20 transition-all"
                        >
                            <Power className="w-4 h-4" /> Terminate_Session
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-panel-bg p-6 border border-white/5 rounded-3xl group hover:border-info/30 transition-all">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Tracked_Entities</div>
                        <div className="text-3xl font-black text-white">{stats.orgs}</div>
                        <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-info w-[65%]" />
                        </div>
                    </div>
                    <div className="bg-panel-bg p-6 border border-white/5 rounded-3xl group hover:border-emerald-500/30 transition-all">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Network_Assets</div>
                        <div className="text-3xl font-black text-white">{stats.assets}</div>
                        <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[85%]" />
                        </div>
                    </div>
                    <div className="bg-panel-bg p-6 border border-white/5 rounded-3xl group hover:border-danger/30 transition-all text-danger">
                        <div className="text-[10px] font-mono text-danger/60 uppercase tracking-widest mb-2">Critical_Findings</div>
                        <div className="text-3xl font-black">{stats.findings}</div>
                        <div className="h-1 bg-danger/10 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-danger w-[45%] animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-panel-bg p-6 border border-white/5 rounded-3xl group hover:border-warning/30 transition-all">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Active_API_Keys</div>
                        <div className="text-3xl font-black text-white">{stats.api_keys}</div>
                        <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-warning w-[30%]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-panel-bg border border-white/5 rounded-2xl w-fit">
                            {[
                                { id: 'api_keys', label: 'API_MANAGER', icon: Key },
                                { id: 'organizations', label: 'REGISTRY', icon: Globe },
                                { id: 'rules', label: 'RISK_POLICIES', icon: ShieldCheck },
                                { id: 'audit', label: 'AUDIT_LOGS', icon: ClipboardList },
                                { id: 'import', label: 'BULK_IMPORT', icon: UploadCloud },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? 'bg-info text-black shadow-[0_0_20px_rgba(30,144,255,0.2)]'
                                        : 'text-muted-foreground hover:text-white'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[500px]">
                            {activeTab === 'api_keys' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {apiKeys.map(key => (
                                            <div key={key.id} className="bg-panel-bg border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Key_Identity</span>
                                                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{key.email}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleTopUp(key.id, key.email)}
                                                            className="p-2.5 bg-success/10 text-success rounded-xl hover:bg-success hover:text-black transition-all"
                                                            title="Recharge Quota"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-[11px] text-info/80 break-all">
                                                        {key.api_key}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                                        <span className="text-muted-foreground">Usage_Telemetry:</span>
                                                        <span className={key.usage_count >= key.max_usage ? 'text-danger font-black' : 'text-success font-black'}>
                                                            {key.usage_count} / {key.max_usage}
                                                        </span>
                                                    </div>

                                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${key.usage_count >= key.max_usage ? 'bg-danger' : 'bg-info'}`}
                                                            style={{ width: `${Math.min((key.usage_count / key.max_usage) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'organizations' && (
                                <div className="space-y-3">
                                    {organizations.map(org => (
                                        <div key={org.id} className="bg-panel-bg border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-info/5 flex items-center justify-center text-info border border-info/10">
                                                    <Globe className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-info transition-colors">{org.name}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                                                        <Globe className="w-3 h-3" /> {org.root_domain}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right hidden sm:block">
                                                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Confidence</div>
                                                    <div className="text-xs font-bold text-success">{org.confidence_score}%</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteOrg(org.id, org.name)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'rules' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {riskRules.map(rule => (
                                        <div key={rule.id} className={`p-6 rounded-3xl border transition-all ${rule.enabled ? 'bg-panel-bg border-white/5' : 'bg-black/60 border-danger/20 grayscale opacity-60'}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${rule.base_severity === 'critical' ? 'bg-danger/20 text-danger' : 'bg-info/20 text-info'}`}>
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-black uppercase tracking-widest text-white">{rule.name}</h3>
                                                        <span className="text-[9px] font-mono text-muted-foreground uppercase">{rule.slug}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleRiskRule(rule.id, rule.enabled, rule.slug)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${rule.enabled ? 'bg-info' : 'bg-zinc-800'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed h-12 overflow-hidden">{rule.description}</p>
                                            <div className="mt-4 flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest opacity-60">
                                                <span>Weight: {rule.weight}</span>
                                                <span>•</span>
                                                <span>{rule.base_severity} SEV</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}



                            {activeTab === 'audit' && (
                                <div className="bg-panel-bg border border-white/5 rounded-[2rem] overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/5">
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Timestamp</th>
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Action</th>
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Admin</th>
                                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground font-mono">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.map(log => (
                                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 text-[10px] font-mono text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${log.action.includes('PURGE') || log.action.includes('LOGOUT') ? 'border-danger/30 text-danger' :
                                                            log.action.includes('IMPORT') || log.action.includes('LOGIN') ? 'border-success/30 text-success' : 'border-info/30 text-info'
                                                            }`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[10px] font-mono">{log.admin_email}</td>
                                                    <td className="p-4 text-[9px] font-mono text-muted-foreground">{JSON.stringify(log.details)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'import' && (
                                <div className="bg-panel-bg border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <UploadCloud className="w-32 h-32 text-info" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <h2 className="text-xl font-black italic tracking-tighter text-white">BULK_IMPORT_MATRIX</h2>
                                        <p className="text-xs text-muted-foreground font-mono max-w-lg">
                                            Import organizations by pasting a list of root domains (one per line). Root domains will be automatically seeded
                                            into the tactical monitoring grid.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <textarea
                                            value={bulkInput}
                                            onChange={(e) => setBulkInput(e.target.value)}
                                            placeholder="google.com&#10;microsoft.com&#10;github.com"
                                            className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm text-info/90 focus:outline-none focus:border-info/50 transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleBulkImport}
                                            disabled={isImporting || !bulkInput.trim()}
                                            className="w-full h-14 bg-info text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-info/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(30,144,255,0.2)]"
                                        >
                                            {isImporting ? (
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Zap className="w-5 h-5" />
                                                    Execute_Matrix_Import
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Activity className="w-4 h-4 text-info animate-pulse" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Live_Telemetry</h2>
                        </div>

                        <div className="bg-panel-bg border border-white/5 rounded-[2.5rem] p-6 space-y-6 min-h-[600px] flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-info/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex-1 space-y-4 font-mono">
                                {scans.map(scan => (
                                    <div key={scan.id} className="text-[10px] p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2 group">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${scan.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                scan.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500 animate-pulse'
                                                }`}>
                                                {scan.status}
                                            </span>
                                            <span className="text-muted-foreground/40">{new Date(scan.started_at).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-info font-bold truncate">{scan.target}</div>
                                        <div className="text-[8px] text-muted-foreground uppercase tracking-widest opacity-50">
                                            Engine: {scan.scan_type}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminDashboard;
