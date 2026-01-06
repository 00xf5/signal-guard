import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Key, Copy, Check, Zap, ArrowLeft, ShieldCheck, Mail, Code2, Terminal, Database, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Meta from "@/components/Meta";
import { motion } from "framer-motion";

const ApiAccess = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [lookupKey, setLookupKey] = useState("");
    const [usageData, setUsageData] = useState<{ count: number; max: number } | null>(null);
    const [isCheckingUsage, setIsCheckingUsage] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [previewLang, setPreviewLang] = useState('javascript');

    const apiJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "RiskSignal Trust API",
        "url": "https://app.risksignal.name.ng/api-access",
        "description": "Professional Forensic Trust API. Scale your entity verification with high-fidelity signal analysis.",
        "applicationCategory": "SecurityApplication",
        "featureList": ["Forensic Trust Scoring", "Confidence Gauges", "Legitimacy Verification", "Usage Guarantees"]
    };

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
        } catch (error: any) {
            toast.error(error.message || "Failed to generate API Key");
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

    const checkUsage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupKey || lookupKey.length < 10) {
            toast.error("Please enter a valid API Key");
            return;
        }

        setIsCheckingUsage(true);
        try {
            const { data, error } = await supabase
                .from('api_access')
                .select('usage_count, max_usage')
                .eq('api_key', lookupKey)
                .single();

            if (error || !data) throw new Error("Key not found in forensic database.");

            setUsageData({ count: data.usage_count, max: data.max_usage });
            toast.success("Telemetry usage synchronized.");
        } catch (error: any) {
            toast.error(error.message);
            setUsageData(null);
        } finally {
            setIsCheckingUsage(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/30">
            <Meta
                title="Trust Intelligence API Access | Enterprise Fraud Prevention"
                description="Professional Trust Intelligence API. Scale your risk analysis, entity verification, and fraud prevention with 500+ high-fidelity biometric and network signals."
                keywords="Trust API, Fraud Prevention API, Vendor Risk Management, IP Risk Score API, KYC verification API, deep forensic signals, Enterprise security API"
                jsonLd={apiJsonLd}
            />
            <Header />

            <main className="pt-24 pb-20 container max-w-4xl px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group text-[10px] font-mono uppercase tracking-widest">
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4 text-center md:text-left">
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter italic">
                            Access the <span className="text-info">Trust API.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto md:mx-0">
                            Integrate professional forensic intelligence into your own infrastructure.
                            Each developer key is pre-loaded with <span className="text-foreground font-black">500 free signals.</span>
                        </p>
                    </div>

                    {!generatedKey ? (
                        <div className="bg-panel-bg/20 border border-panel-border rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-info/5 via-transparent to-transparent opacity-50" />

                            <form onSubmit={handleGenerate} className="relative space-y-6 max-w-md mx-auto md:mx-0">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Work_Email_Baseline
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="forensics@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-black/40 border-panel-border focus:border-info/50 font-mono text-sm"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground italic font-mono">
                                        * Email used exclusively for quota anchoring.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-[11px] font-black uppercase tracking-[0.2em] bg-info text-black hover:bg-info/80 shadow-[0_0_20px_rgba(30,144,255,0.2)]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Synchronizing..." : "Initialize API Key"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-info/5 border border-info/20 rounded-[2.5rem] p-8 sm:p-12 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <ShieldCheck className="w-16 h-16 text-info/20" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black italic tracking-tighter text-info">Baseline_Ready</h3>
                                    <p className="text-xs text-muted-foreground font-mono">Your unique 24-digit forensic key is ready for deployment.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group/key">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-info/20 via-info/10 to-info/20 rounded-lg blur opacity-25 group-hover/key:opacity-75 transition duration-1000"></div>
                                        <div className="relative flex items-center justify-between bg-black/60 border border-panel-border rounded-2xl p-6 font-mono shadow-2xl">
                                            <span className="text-xl sm:text-2xl tracking-tighter text-info font-bold break-all mr-4">
                                                {generatedKey}
                                            </span>
                                            <button
                                                onClick={copyToClipboard}
                                                className="shrink-0 p-3 rounded-xl bg-white/5 hover:bg-info/10 text-muted-foreground hover:text-info transition-all border border-white/5"
                                                title="Copy API Key"
                                            >
                                                {isCopied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                        <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1.5 rounded-full border border-panel-border">
                                            Quota: 500 Signals
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1.5 rounded-full border border-panel-border">
                                            Status: Persistent
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <Button asChild className="bg-info text-black hover:bg-info/90 px-8 font-black uppercase text-[10px] tracking-widest h-12">
                                        <Link to="/docs" className="flex items-center gap-2">
                                            Integration Gateway
                                        </Link>
                                    </Button>
                                    <Button onClick={() => setGeneratedKey(null)} variant="ghost" className="text-muted-foreground hover:text-white px-8 font-black uppercase text-[10px] tracking-widest h-12">
                                        Return
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LIVE QUOTA & TRUST MARKETING */}
                    <div className="grid md:grid-cols-2 gap-8 pt-8">
                        {/* QUOTA MONITOR */}
                        <div className="bg-panel-bg/20 border border-panel-border rounded-[2rem] p-8 space-y-6 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-info/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Activity className="w-5 h-5 text-info" />
                                </div>
                                <h2 className="text-xl font-black italic tracking-tighter">QUOTA_MONITOR</h2>
                            </div>

                            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                                Enter an existing key to synchronize live telemetry consumption from RiskSignal edge nodes.
                            </p>

                            <form onSubmit={checkUsage} className="space-y-4">
                                <Input
                                    placeholder="Enter Forensic Key..."
                                    value={lookupKey}
                                    onChange={(e) => setLookupKey(e.target.value)}
                                    className="h-11 bg-black/40 border-panel-border font-mono text-xs focus:border-info/50"
                                />
                                <Button
                                    type="submit"
                                    disabled={isCheckingUsage}
                                    className="w-full h-11 bg-white/5 border border-panel-border text-foreground font-black uppercase text-[10px] tracking-widest hover:bg-foreground/10"
                                >
                                    {isCheckingUsage ? "Synchronizing..." : "Sync Live Quota"}
                                </Button>
                            </form>

                            {usageData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-6 space-y-4"
                                >
                                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em]">
                                        <span className="text-info">Telemetry Consumption</span>
                                        <span className="text-muted-foreground">{usageData.count} / {usageData.max}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(usageData.count / usageData.max) * 100}%` }}
                                            className="h-full bg-info shadow-[0_0_15px_rgba(30,144,255,0.6)]"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] text-muted-foreground font-mono italic">
                                            Status: {usageData.count >= usageData.max ? 'EXHAUSTED' : 'OPERATIONAL'}
                                        </p>
                                        <p className="text-[9px] text-info font-black uppercase tracking-widest">
                                            {usageData.max - usageData.count} Checks Left
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* TRUST MARKET STRATEGY */}
                        <div className="bg-black/40 border border-panel-border rounded-[2rem] p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-success" />
                                </div>
                                <h2 className="text-xl font-black italic tracking-tighter uppercase">Trust_Intelligence</h2>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                                We bridge the gap into <span className="text-success">Fraud Prevention</span> and <span className="text-info">Vendor Risk</span> through multi-layer verification.
                            </p>

                            <div className="space-y-3">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-[9px]">
                                    <div className="flex justify-between items-center text-success">
                                        <span>+12 Email Security Baseline</span>
                                        <span className="opacity-60">[VERIFIED]</span>
                                    </div>
                                    <div className="flex justify-between items-center text-success">
                                        <span>+18 Infrastructure Maturity</span>
                                        <span className="opacity-60">[STABLE]</span>
                                    </div>
                                    <div className="flex justify-between items-center text-success">
                                        <span>+22 ASN Reputation Tier</span>
                                        <span className="opacity-60">[PREMIUM]</span>
                                    </div>
                                    <div className="flex justify-between items-center text-info">
                                        <span>+8 Edge Arbitration (WAF)</span>
                                        <span className="opacity-60">[DETECTED]</span>
                                    </div>
                                    <div className="flex justify-between items-center text-danger/80">
                                        <span>-13 Observed Exposure Penalty</span>
                                        <span className="opacity-60">[EXPOSED]</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 flex justify-between items-center font-black text-sm text-foreground">
                                        <span className="italic uppercase tracking-tighter">Trust_Gauge_Score</span>
                                        <span className="text-success tracking-tighter text-lg">87%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fraud_Block</div>
                                    <p className="text-[8px] text-muted-foreground leading-tight">Block low-trust signups instantly.</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Payment_Auth</div>
                                    <p className="text-[8px] text-muted-foreground leading-tight">Auto-approve high-trust txns.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API PREVIEW / DOCS */}
                    <div className="space-y-6 pt-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-panel-border">
                                <Code2 className="w-4 h-4 text-info" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tighter italic uppercase">Technical_Gateway</h2>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="bg-panel-bg/30 border border-panel-border rounded-[2rem] overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-panel-border">
                                    <div className="flex gap-6">
                                        {['javascript', 'python', 'go'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setPreviewLang(lang)}
                                                className={`text-[10px] uppercase tracking-tighter font-black transition-colors ${previewLang === lang ? 'text-info' : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                    <Terminal className="w-3.5 h-3.5 text-muted-foreground/30" />
                                </div>
                                <div className="p-6 flex-1 font-mono text-xs sm:text-[13px] leading-relaxed text-foreground/80">
                                    {previewLang === 'javascript' && (
                                        <pre className="text-info/90">
                                            {`const res = await fetch(API_URL, {
  method: 'POST',
  headers: { 
    'x-api-key': 'your_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ target: 'example.com' })
});
const data = await res.json();`}
                                        </pre>
                                    )}
                                    {previewLang === 'python' && (
                                        <pre className="text-warning/80">
                                            {`headers = {
    'x-api-key': 'your_key',
    'Content-Type': 'application/json'
}
res = requests.post(url, 
    json={'target': 'example.com'}, 
    headers=headers
)
data = res.json()`}
                                        </pre>
                                    )}
                                    {previewLang === 'go' && (
                                        <pre className="text-success/80">
                                            {`req, _ := http.NewRequest("POST", url, body)
req.Header.Set("x-api-key", "your_key")
req.Header.Set("Content-Type", "json")
resp, _ := client.Do(req)`}
                                        </pre>
                                    )}
                                </div>
                            </div>

                            <div className="bg-panel-bg/60 border border-panel-border rounded-[2rem] overflow-hidden flex flex-col group/resp">
                                <div className="flex items-center justify-between px-6 py-4 bg-info/5 border-b border-panel-border">
                                    <span className="text-[10px] uppercase tracking-tighter text-info font-black flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-info" />
                                        Forensic Response
                                    </span>
                                    <Database className="w-3.5 h-3.5 text-info/30" />
                                </div>
                                <div className="p-6 max-h-[300px] overflow-y-auto font-mono text-[11px] sm:text-xs leading-tight scrollbar-hide bg-black/20">
                                    <pre className="text-info/70">
                                        {`{
  "status": "success",
  "trust_intel": {
    "target": "example.com",
    "trust_score": 87,
    "confidence": 100,
    "verdict": "TRUSTED",
    "signals": [
        { "id": "SEC-SSL", "label": "Valid Cert", "weight": 15 },
        { "id": "ASN-REP", "label": "Mature ASN", "weight": 20 }
    ],
    "meta": {
        "usage_remaining": 482
    }
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER VALUES */}
                    <div className="grid sm:grid-cols-3 gap-6 pt-12 border-t border-panel-border">
                        <div className="space-y-2">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Ultra_Latency</h4>
                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">Global edge nodes ensure &lt;50ms response times for all forensic telemetry.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Header_Auth</h4>
                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">Secure x-api-key standard. No session persistence or cookie overhead required.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Signal_Depth</h4>
                            <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">Deep JSON access to ASN reputation tiers and cryptographic maturity logs.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ApiAccess;
