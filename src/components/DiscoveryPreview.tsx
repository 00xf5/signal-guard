import { Link } from "react-router-dom";
import { Globe, Shield, Zap, ArrowRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

const DiscoveryPreview = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-black/40 border-y border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-success/5 via-transparent to-transparent opacity-50" />

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-bold tracking-widest uppercase mb-4">
                                <Activity className="w-3 h-3 animate-pulse" />
                                Interactive Intelligence
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Explore the <span className="text-gradient">Threat Landscape.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                                Our Live Discovery engine allows you to visualize global network activity in real-time.
                                Search for any IP or domain to uncover its forensic footprint, reputation history, and infrastructure markers.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <Globe className="w-4 h-4 text-success" />
                                    Global Threat Map
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Visualize live attacks and botnet telemetry across 190+ countries.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <Shield className="w-4 h-4 text-info" />
                                    Forensic Intelligence
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Deep dive into subnets, associated domains, and infrastructure fingerprints.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link
                                to="/discovery"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all hover:gap-3 group"
                            >
                                Launch Discovery Engine
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-success/20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                        <div className="relative border border-white/10 rounded-3xl overflow-hidden shadow-2xl bg-black/60 backdrop-blur-xl group-hover:border-success/30 transition-all">
                            <img
                                src="/discovery-preview.png"
                                alt="Live Threat Map Preview"
                                className="w-full h-auto opacity-70 group-hover:opacity-100 transition-opacity"
                            />
                            {/* Visual HUD elements */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                                <div className="w-1.5 h-1.5 rounded-full bg-info" />
                            </div>
                            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground/50">
                                SYSTEM_STATUS: OPERATIONAL
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DiscoveryPreview;
