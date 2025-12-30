import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const CTA = () => {
  return (
    <section className="py-24 border-t border-border relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-success/50 animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-3 h-3 bg-warning/50 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-danger/50 animate-float" style={{ animationDelay: '2s' }} />

      <div className="container relative z-10">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-6">
              <Shield className="w-12 h-12 mx-auto animate-glow-pulse" />
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-warning animate-pulse" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to see the signal?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Built for security teams, fraud detection, bug hunters, SOCs, and developers 
              who need actionable intelligence.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button variant="hero" size="lg" className="group">
                Get API Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="hover-lift">
                Contact Sales
              </Button>
            </div>

            {/* Pricing teaser */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-success animate-pulse" />
                Free tier available — Limited daily checks
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-foreground" />
                Paid plans for bulk analysis & enterprise
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTA;
