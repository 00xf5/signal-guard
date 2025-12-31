import { Zap, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AccessCTA = () => {
    return (
        <div className="container px-4 py-8">
            <div className="relative group overflow-hidden border border-white/10 dark:border-white/5 bg-black/40 backdrop-blur-md rounded-2xl p-6 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center border border-success/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <Zap className="w-6 h-6 text-success animate-pulse" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                Signal Access & API
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                Integrate professional IP signal intelligence into your stack. Get 500 requests free.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button asChild variant="hero" size="sm" className="h-10 px-6 font-semibold group/btn bg-white text-black hover:bg-white/90">
                            <Link to="/api-access" className="flex items-center gap-2">
                                Generate Key
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" size="sm" className="h-10 px-6 font-semibold border border-white/10 hover:bg-white/5 text-white/70 hover:text-white">
                            <Link to="/docs" className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                View Docs
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessCTA;
