import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ApiDemo from "@/components/ApiDemo";
import Scoring from "@/components/Scoring";
import DataSources from "@/components/DataSources";
import Pricing from "@/components/Pricing";
import Philosophy from "@/components/Philosophy";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <Hero />
        <Features />
        <ApiDemo />
        <Scoring />
        <DataSources />
        <Pricing />
        <Philosophy />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
