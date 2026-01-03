import Header from "@/components/Header";
import ThemeToggle from "@/components/ThemeToggle";
import Hero from "@/components/Hero";
import AccessCTA from "@/components/AccessCTA";
import Features from "@/components/Features";
import Scoring from "@/components/Scoring";
import DataSources from "@/components/DataSources";
import Philosophy from "@/components/Philosophy";
import SEOContent from "@/components/SEOContent";
import Footer from "@/components/Footer";
import Meta from "@/components/Meta";
import DiscoveryPreview from "@/components/DiscoveryPreview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Meta
        title="IP Intelligence & Anonymity Detection"
        description="Real-time IP risk scoring, VPN detection, and forensic network intelligence. Audit any IP or domain with the high-fidelity RiskSignal engine."
        keywords="IP intelligence, VPN detection, proxy detection, threat intelligence, risk scoring, anonymity detection, Tor detection, RiskSignal"
      />
      <Header />
      <ThemeToggle />
      <main className="pt-14">
        <Hero />
        <DiscoveryPreview />
        <AccessCTA />
        <Features />
        <Scoring />
        <DataSources />
        <Philosophy />
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

