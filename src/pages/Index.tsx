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


const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ThemeToggle />
      <main className="pt-14">
        <Hero />
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

