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
        title="Cyber-Asset Attack Surface Management & Threat Reconnaissance"
        description="Global digital footprint mapping, automated shadow IT discovery, and distributed threat intelligence. Secure your external attack surface with the high-fidelity RiskSignal reconnaissance engine."
        keywords="ASM, CAASM, Cyber Asset Management, External Attack Surface, Digital Footprint, Threat Reconnaissance, Vulnerability Discovery, Shadow IT"
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

