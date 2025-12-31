import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Terminal, Code2, Globe, Database, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Docs = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
        <div className="relative group bg-black/50 border border-white/10 rounded-xl overflow-hidden mt-4">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{language}</span>
                <button
                    onClick={() => copyCode(code, id)}
                    className="text-muted-foreground hover:text-white transition-colors p-1"
                >
                    {copiedId === id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-success/90">{code}</code>
            </pre>
        </div>
    );

    const curlCode = `curl -X GET "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8" \\
     -H "x-api-key: YOUR_24_DIGIT_KEY"`;

    const jsCode = `const fetchIpData = async (ip) => {
  const response = await fetch(\`https://risksignal-tau.vercel.app/api/scan?ip=\${ip}\`, {
    headers: {
      'x-api-key': 'YOUR_24_DIGIT_KEY'
    }
  });
  return await response.json();
};

fetchIpData('8.8.8.8').then(console.log);`;

    const pythonCode = `import requests

def scan_ip(ip, api_key):
    url = f"https://risksignal-tau.vercel.app/api/scan?ip={ip}"
    headers = {"x-api-key": api_key}
    response = requests.get(url, headers=headers)
    return response.json()

data = scan_ip("8.8.8.8", "YOUR_24_DIGIT_KEY")
print(data)`;

    const goCode = `package main

import (
    "fmt"
    "net/http"
    "io/ioutil"
)

func main() {
    client := &http.Client{}
    req, _ := http.NewRequest("GET", "https://risksignal-tau.vercel.app/api/scan?ip=8.8.8.8", nil)
    req.Header.Set("x-api-key", "YOUR_24_DIGIT_KEY")
    
    resp, _ := client.Do(req)
    defer resp.Body.Close()
    
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="pt-24 pb-20 container max-w-5xl px-4">
                <Link to="/api-access" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Generator
                </Link>

                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                                Integration <span className="text-gradient">Guide.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Programmatically query IP intelligence and threat scores.
                                Implementation is header-based and designed for scale.
                            </p>
                        </div>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center border border-success/20">
                                    <Globe className="w-5 h-5 text-success" />
                                </div>
                                <h2 className="text-2xl font-bold">Base Endpoint</h2>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 group">
                                <span className="px-2 py-0.5 rounded bg-success/20 text-success text-[10px] font-bold tracking-widest uppercase">GET</span>
                                <code className="text-sm font-mono text-foreground/80 break-all">https://risksignal-tau.vercel.app/api/scan</code>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center border border-info/20">
                                    <Shield className="w-5 h-5 text-info" />
                                </div>
                                <h2 className="text-2xl font-bold">Authentication</h2>
                            </div>
                            <p className="text-muted-foreground">
                                Pass your 24-digit hexadecimal key in the <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/10">x-api-key</code> header.
                                All requests without a valid header or targeting an exhausted quota will return a 401 Unauthorized status.
                            </p>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
                                    <Terminal className="w-5 h-5 text-warning" />
                                </div>
                                <h2 className="text-2xl font-bold">Implementation Samples</h2>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                        Simple cURL
                                    </h3>
                                    <CodeBlock code={curlCode} language="bash" id="curl" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Code2 className="w-4 h-4 text-muted-foreground" />
                                        JavaScript (Fetch)
                                    </h3>
                                    <CodeBlock code={jsCode} language="javascript" id="js" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Database className="w-4 h-4 text-muted-foreground" />
                                        Python (Requests)
                                    </h3>
                                    <CodeBlock code={pythonCode} language="python" id="python" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-muted-foreground" />
                                        Go (Standard Library)
                                    </h3>
                                    <CodeBlock code={goCode} language="go" id="go" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8">
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                            <h4 className="font-bold text-sm tracking-widest uppercase text-muted-foreground">Data Dictionary</h4>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-mono text-success">security.risk_score</span>
                                        <span className="text-muted-foreground uppercase text-[9px]">Float (0-100)</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Weighted probability that the IP is used for malicious activities.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-mono text-info">security.verdict</span>
                                        <span className="text-muted-foreground uppercase text-[9px]">String</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Strategic recommendation: ALLOW, REVIEW, or BLOCK.</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-mono text-warning">security.trust_level</span>
                                        <span className="text-muted-foreground uppercase text-[9px]">String</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Confidence tier: PREMIUM, NEUTRAL, or HIGH_RISK.</p>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <span className="font-mono text-white/40 block mb-1 uppercase text-[10px]">Reputation Markers</span>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        is_vpn, is_proxy, is_tor, is_botnet_node, is_spam_source
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <Button asChild variant="hero" className="w-full bg-white text-black hover:bg-white/90">
                                    <Link to="/api-access">Generate Key</Link>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-xs text-blue-400">
                                NOTE
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Always perform IP scanning server-side. Exposing your API Key in clear-text frontend code may allow others to exhaust your quota.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Docs;
