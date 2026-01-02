import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Meta from "@/components/Meta";
import { Shield, Target, Users, Globe, Zap, Database, Lock, Eye } from "lucide-react";

const About = () => {
    const aboutJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "RiskSignal",
        "url": "https://risksignal-tau.vercel.app/about",
        "logo": "https://risksignal-tau.vercel.app/favicon.png",
        "description": "High-fidelity IP intelligence and network analysis platform for security professionals."
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/30">
            <Meta
                title="About RiskSignal Intelligence"
                description="Learn about the engine behind RiskSignal. We provide high-fidelity IP intelligence audits and infrastructure intelligence for developers and security teams."
                keywords="RiskSignal Mission, IP Intelligence Technology, Cyber Threat Detection, Security Infrastructure Company"
                jsonLd={aboutJsonLd}
            />
            <Header />

            <main className="pt-24 pb-20 container max-w-4xl px-4">
                <div className="space-y-16">
                    <div className="space-y-6 text-center lg:text-left">
                        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                            Modern <span className="text-gradient">Intelligence.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            RiskSignal provides deep infrastructure intelligence to help developers and security teams understand who is connecting to their systems.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center border-y border-border py-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-success font-bold text-sm tracking-widest uppercase">
                                <Target className="w-4 h-4" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl font-bold">Better Data for Everyone.</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our goal is to provide developers with high-fidelity IP intelligence without the complexity.
                                We believe in transparency and providing actionable insights rather than cryptic scores.
                            </p>
                        </div>
                        <div className="bg-success/5 border border-success/20 rounded-2xl p-8 relative overflow-hidden group">
                            <Shield className="w-24 h-24 text-success/10 absolute -bottom-4 -right-4 transition-transform group-hover:scale-110" />
                            <div className="space-y-4 relative z-10">
                                <div className="text-4xl font-bold text-success">99.9%</div>
                                <p className="text-sm font-medium">Accuracy in Data Center detection</p>
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center border border-info/20">
                                <Globe className="w-5 h-5 text-info" />
                            </div>
                            <h3 className="font-bold">Global Perspective</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We utilize edge nodes globally to ensure our signals are fresh and reflect the current state of
                                global routing and anonymization.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center border border-warning/20">
                                <Lock className="w-5 h-5 text-warning" />
                            </div>
                            <h3 className="font-bold">Privacy First</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We do not store lookup history. Your queries are processed in-memory and discarded,
                                ensuring complete privacy for your intelligence gathering.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center border border-success/20">
                                <Zap className="w-5 h-5 text-success" />
                            </div>
                            <h3 className="font-bold">Developer Centric</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Everything we build starts with an API-first approach. We build the tools we want to use
                                as developers.
                            </p>
                        </div>
                    </div>

                    {/* The Engine Section */}
                    <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center border border-border">
                                <Database className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">How it Works</h2>
                                <p className="text-sm text-muted-foreground">Multiple data sources, one simple API</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed">
                            <p>
                                Unlike standard geolocation services, RiskSignal performs deep packet analysis markers
                                and browser-level checks to identify behavioral outliers. We correlate:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4">
                                <li><strong>ASN Reputation:</strong> Historic attack patterns from specific network autonomous systems.</li>
                                <li><strong>Device Signal Delta:</strong> Discrepancies between browser timezone, locale, and IP geolocation.</li>
                                <li><strong>Infrastructure Mapping:</strong> Real-time identification of VPN gateways and cloud exit nodes.</li>
                                <li><strong>Behavioral Heuristics:</strong> Identifying patterns indicative of automated scanning and bot activity.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Team/End Section */}
                    <div className="text-center space-y-4">
                        <Users className="w-8 h-8 mx-auto text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Join the Defense.</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Used by infrastructure engineers and security researchers worldwide to protect their perimeter.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
