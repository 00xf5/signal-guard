import Header from "@/components/Header";
import ThemeProvider, { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Scoring from "@/components/Scoring";
import DataSources from "@/components/DataSources";
import Philosophy from "@/components/Philosophy";
import SEOContent from "@/components/SEOContent";
import Footer from "@/components/Footer";


const Index = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider>
      <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : 'light'}`}>
        <Header />
        <ThemeToggle />
        <main className="pt-14">
          <Hero />
          <Features />
          <Scoring />
          <DataSources />
          <Philosophy />
          <SEOContent />
        </main>
        <Footer />

      </div>
    </ThemeProvider>
  );
};

export default Index;

