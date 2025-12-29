import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-20 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="fade-in flex items-center gap-2 mb-8 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>Security Intelligence API</span>
          </div>

          {/* Main headline */}
          <h1 className="fade-in fade-in-delay-1 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Risk Intelligence.
            <br />
            <span className="text-muted-foreground">Anonymity Detection.</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-in fade-in-delay-2 text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            RiskSignal answers two critical questions: Is this IP/domain malicious? 
            How anonymous is the actor behind it?
          </p>

          {/* Terminal-style question */}
          <div className="fade-in fade-in-delay-3 code-block mb-10 max-w-xl">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <span className="w-3 h-3 rounded-full bg-danger/60" />
              <span className="w-3 h-3 rounded-full bg-warning/60" />
              <span className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-2">risksignal</span>
            </div>
            <code className="text-sm md:text-base">
              <span className="text-muted-foreground">$</span>{" "}
              <span className="text-foreground">curl</span>{" "}
              <span className="text-muted-foreground">https://api.risksignal.io/check-ip?ip=</span>
              <span className="text-foreground">8.8.8.8</span>
              <span className="terminal-cursor">_</span>
            </code>
          </div>

          {/* CTAs */}
          <div className="fade-in fade-in-delay-4 flex flex-wrap gap-4">
            <Button variant="hero" size="lg">
              Get API Access
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              View Documentation
            </Button>
          </div>

          {/* Stats */}
          <div className="fade-in fade-in-delay-4 grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border max-w-xl">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">&lt;50ms</div>
              <div className="text-sm text-muted-foreground">Response</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">5+</div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
