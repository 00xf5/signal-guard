import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Meta from "@/components/Meta";

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/30">
            <Meta
                title="Privacy Policy & Data Protection"
                description="Our commitment to privacy and data security. Learn how RiskSignal handles IP intelligence telemetry and system logs."
                keywords="Privacy Policy, Data Security, IP Intelligence Privacy, RiskSignal Terms"
            />
            <Header />

            <main className="pt-24 pb-20 container max-w-4xl px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Terminal
                </Link>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            Privacy <span className="text-gradient">Policy.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            This policy outlines how we handle information in our IP intelligence system.
                        </p>
                    </div>

                    <div className="grid gap-8">
                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-success font-bold">
                                <Shield className="w-5 h-5" />
                                <h3>Data Collection</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect technical telemetry related to IP addresses, including geolocation and network infrastructure details.
                                No personally identifiable information is collected beyond what is required for API quota management.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-info font-bold">
                                <Lock className="w-5 h-5" />
                                <h3>Signal Security</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                API queries are encrypted in transit. We maintain isolation between individual API keys and their usage data.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-warning font-bold">
                                <Eye className="w-5 h-5" />
                                <h3>Usage Intelligence</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Usage telemetry is tracked for quota enforcement and security monitoring to prevent platform abuse.
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-muted-foreground">
                        <h2 className="text-foreground">Detailed Provisions</h2>
                        <p>
                            By using RiskSignal, you acknowledge that our assessments are probabilistic in nature.
                            Our reputation layer is built upon real-time connection telemetry and historical attack patterns.
                            We reserve the right to modify our detection vectors to counter evolving threat landscapes.
                        </p>
                        <p>
                            Last updated: December 30, 2025.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacy;
