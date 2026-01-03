import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText, Scale, Zap, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Meta from "@/components/Meta";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-success/30">
            <Meta
                title="Terms of Service"
                description="Terms and conditions for using the RiskSignal IP intelligence platform and API. Understand our usage limits and service level agreements."
                keywords="Terms of Service, RiskSignal Terms, Usage Policy, API Agreement"
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
                            Terms of <span className="text-gradient">Service.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Welcome to RiskSignal. By using our platform or API, you agree to these terms.
                        </p>
                    </div>

                    <div className="grid gap-8">
                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-success font-bold">
                                <Scale className="w-5 h-5" />
                                <h3>Permitted Use</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                You may use our intelligence to protect your systems from fraud and abuse.
                                Redistributing raw data is prohibited.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-info font-bold">
                                <Zap className="w-5 h-5" />
                                <h3>API Quota & Limits</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Our free tier includes 500 requests. Circumventing this limit will result in a permanent ban.
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
                            <div className="flex items-center gap-3 text-warning font-bold">
                                <AlertTriangle className="w-5 h-5" />
                                <h3>No Guarantee of Accuracy</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                We provide intelligence "as-is." IP reputations change dynamically.
                                We do not guarantee absolute accuracy and are not liable for decisions made based on our scores.
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none text-muted-foreground">
                        <h2 className="text-foreground">Binding Arbitration</h2>
                        <p>
                            Any disputes arising from the use of our services will be resolved through binding arbitration.
                            By using this service, you waive your right to participate in class-action lawsuits or jury trials.
                        </p>
                        <p>
                            Last maintained: December 30, 2025.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
