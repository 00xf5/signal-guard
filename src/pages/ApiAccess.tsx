import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Key, Copy, Check, Zap, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ApiAccess = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const generateApiKey = () => {
        const buffer = new Uint8Array(12);
        window.crypto.getRandomValues(buffer);
        return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        const apiKey = generateApiKey();

        try {
            const { error } = await supabase
                .from('api_access')
                .insert([{ email, api_key: apiKey, max_usage: 500 }]);

            if (error) throw error;

            setGeneratedKey(apiKey);
            toast.success("API Key generated successfully!");
        } catch (error: unknown) {
            const err = error as Error;
            toast.error(err.message || "Failed to generate API Key");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedKey) {
            navigator.clipboard.writeText(generatedKey);
            setIsCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/30">
            <Header />

            <main className="pt-24 pb-20 container max-w-4xl px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold tracking-widest uppercase">
                            <Zap className="w-3 h-3" />
                            Developer Portal
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            Generate your <span className="text-gradient">Access Key.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                            Start integrating Signal Guard's intelligence into your own infrastructure.
                            Each key includes 500 requests for professional threat assessment.
                        </p>
                    </div>

                    {!generatedKey ? (
                        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-50" />

                            <form onSubmit={handleGenerate} className="relative space-y-6 max-w-md">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Work Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-background/50 border-border focus:ring-success/50 focus:border-success/50"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        * We only use your email to track your 500-request quota.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    variant="hero"
                                    className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-white/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Provisioning..." : "Generate API Key"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-success/5 border border-success/20 rounded-2xl p-8 sm:p-12 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <ShieldCheck className="w-12 h-12 text-success/20" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-success">Generation Successful</h3>
                                    <p className="text-sm text-muted-foreground">Your unique 24-digit hex key is ready for use.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group/key">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-success/20 via-success/10 to-success/20 rounded-lg blur opacity-25 group-hover/key:opacity-75 transition duration-1000"></div>
                                        <div className="relative flex items-center justify-between bg-muted/50 border border-border rounded-lg p-6 font-mono shadow-2xl">
                                            <span className="text-xl sm:text-2xl tracking-tighter text-success font-bold break-all mr-4">
                                                {generatedKey}
                                            </span>
                                            <button
                                                onClick={copyToClipboard}
                                                className="shrink-0 p-3 rounded-lg bg-white/5 hover:bg-success/10 text-muted-foreground hover:text-success transition-all border border-white/5"
                                                title="Copy API Key"
                                            >
                                                {isCopied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                            <Zap className="w-3.5 h-3.5 text-warning" />
                                            Quota: 500 Requests
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                            <Key className="w-3.5 h-3.5 text-success" />
                                            Persistence: Permanent
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <Button asChild variant="hero" className="bg-white text-black hover:bg-white/90 px-8">
                                        <Link to="/docs" className="flex items-center gap-2">
                                            Get Started with Integration
                                        </Link>
                                    </Button>
                                    <Button onClick={() => setGeneratedKey(null)} variant="ghost" className="text-muted-foreground hover:text-white px-8">
                                        Generate Another
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-6 pt-8">
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">High Speed</h4>
                            <p className="text-xs text-muted-foreground">Global edge nodes ensure &lt;50ms response times for all key-based scans.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Safe Auth</h4>
                            <p className="text-xs text-muted-foreground">Header-based authentication. No session tracking or cookies required.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Detailed</h4>
                            <p className="text-xs text-muted-foreground">Full JSON access to WebRTC leaks, ASN reputation, and threat scores.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ApiAccess;
