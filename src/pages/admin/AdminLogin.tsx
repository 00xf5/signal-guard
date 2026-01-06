import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Terminal, Lock, Mail, Shield, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Meta from "@/components/Meta";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: isValid, error } = await supabase.rpc('verify_admin', {
                p_email: email,
                p_password: password
            });

            if (error) throw error;

            if (isValid) {
                sessionStorage.setItem('admin_session', 'active_tactical_node');
                sessionStorage.setItem('admin_email', email);
                sessionStorage.setItem('admin_key', password);
                toast.success("Identity verified. Accessing Command Center...");
                navigate("/admin/dashboard");
            } else {
                toast.error("Invalid credentials. Surveillance log updated.");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error("Authentication system failure.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Meta title="Admin_Login | RiskSignal" noindex={true} />

            <div className={`absolute inset-0 opacity-20 pointer-events-none grid-bg`}></div>
            <style>{`.grid-bg { background-image: radial-gradient(rgba(30,144,255,0.1) 1px, transparent 1px); background-size: 32px 32px; }`}</style>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="bg-panel-bg border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="w-24 h-24" />
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-info/10 rounded-2xl text-info">
                            <Terminal className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter text-white">COMMAND_GATE</h1>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Archival_Access_Required</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest pl-1">Registry_Email</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-info transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@risksignal.com"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono text-white focus:outline-none focus:border-info/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest pl-1">Vulnerability_Key</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-info transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono text-white focus:outline-none focus:border-info/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-info text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-info/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(30,144,255,0.2)]"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Authorize_Session
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <p className="text-[9px] font-mono text-yellow-500/80 leading-relaxed uppercase tracking-widest">
                            Warning: Unauthorized access attempts are monitored and logged to the forensic database.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Core_Systems_Stable</span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
