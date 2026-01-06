import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    Building2, Globe, Shield, Activity,
    ChevronRight, Database, Search,
    LayoutGrid, List, Filter, Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Organization } from "@/types/asm";
import Meta from "@/components/Meta";
import InventoryTacticalSidebar from "@/components/InventoryTacticalSidebar";
import ClickableAsset from "@/components/ClickableAsset";
import { Terminal } from "lucide-react";

const Inventory = () => {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('name');

        if (data) setOrgs(data);
        setIsLoading(false);
    };

    const filteredOrgs = orgs.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.root_domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-app-bg text-foreground/80 font-sans">
            <Meta
                title="Inventory Control | Attack Surface Management Matrix"
                description="Comprehensive asset inventory and attack surface mapping. Monitor domain graphs, IP ranges, and shadow IT infrastructure across your entire organization."
                keywords="attack surface management, asm, easm, shadow it detection, asset inventory graph, infrastructure monitoring, risk management dashboard"
            />
            <Header />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground italic flex items-center gap-3">
                            <Database className="w-8 h-8 text-info" /> INVENTORY_CONTROL
                        </h1>
                        <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em] mt-2">
                            Managing {orgs.length} Active Attack Surfaces
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter Organizations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-terminal-bg/50 border border-panel-border rounded-xl text-sm font-mono w-64 focus:outline-none focus:border-info/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/discovery')}
                            className="flex items-center gap-2 px-4 py-2 bg-info text-black text-xs font-bold uppercase rounded-xl hover:bg-info/80 transition-all active:scale-95 shadow-[0_4px_14px_0_rgba(30,144,255,0.3)]"
                        >
                            <Plus className="w-4 h-4" /> New_Recon
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-panel-bg/20 border border-panel-border rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredOrgs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOrgs.map((org, i) => (
                            <motion.div
                                key={org.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => navigate(`/inventory/${org.id}`)}
                                className="group p-8 bg-panel-bg/30 border border-panel-border rounded-[2.5rem] hover:border-info/30 transition-all duration-500 cursor-pointer relative overflow-hidden"
                            >
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-info/5 rounded-full blur-3xl group-hover:bg-info/10 transition-colors" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-14 h-14 bg-info/5 border border-info/20 rounded-2xl flex items-center justify-center text-info group-hover:scale-110 transition-transform duration-500">
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-mono border ${org.confidence_score > 80 ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'}`}>
                                        CONFIDENCE_{org.confidence_score}%
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-foreground mb-1 group-hover:text-info transition-colors">{org.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                                        <Globe className="w-3 h-3" /> <ClickableAsset value={org.root_domain} showIcon={false} />
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-panel-border flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-mono text-muted-foreground uppercase">Stability</span>
                                            <div className="flex gap-0.5 mt-1">
                                                {[1, 2, 3, 4, 5].map(step => (
                                                    <div key={step} className={`w-1 h-3 rounded-full ${step <= 4 ? 'bg-info/60' : 'bg-foreground/5'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-info group-hover:text-black transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-panel-border rounded-3xl">
                        <Database className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-foreground italic">NO_ORGANIZATIONS_FOUND</h2>
                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Start by performing a discovery scan on a domain to initialize an entity inventory.</p>
                        <button
                            onClick={() => navigate('/discovery')}
                            className="mt-8 px-6 py-2 bg-foreground/5 border border-panel-border rounded-xl text-xs font-bold uppercase hover:bg-foreground/10 transition-colors"
                        >
                            Return to Discovery
                        </button>
                    </div>
                )}
            </main>

            <Footer />

            <InventoryTacticalSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                orgsCount={orgs.length}
            />

            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed bottom-6 left-6 lg:hidden w-14 h-14 bg-info text-black rounded-full shadow-[0_0_30px_rgba(30,144,255,0.3)] flex items-center justify-center z-[90] active:scale-95 transition-transform border-4 border-background"
            >
                <Terminal className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
            </button>
        </div>
    );
};

export default Inventory;
