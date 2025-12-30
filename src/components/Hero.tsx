import { Shield } from "lucide-react";
import IPLookupDemo from "./IPLookupDemo";

const Hero = () => {
  return (
    <section className="min-h-screen flex flex-col justify-center py-12 lg:py-20 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="order-1">
            {/* Badge */}
            <div className="fade-in flex items-center gap-2 mb-6 text-muted-foreground text-sm">
              <Shield className="w-4 h-4" />
              <span>Security Intelligence</span>
            </div>

            {/* Main headline */}
            <h1 className="fade-in fade-in-delay-1 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.1]">
              Risk Intelligence.
              <br />
              <span className="text-muted-foreground">Anonymity Detection.</span>
            </h1>

            {/* Subheadline */}
            <p className="fade-in fade-in-delay-2 text-base md:text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed">
              RiskSignal answers two critical questions: Is this IP/domain malicious?
              How anonymous is the actor behind it?
            </p>

            {/* Stats - Hidden on mobile, shown on lg */}
            <div className="fade-in fade-in-delay-4 hidden lg:grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-border max-w-xl">
              <div>
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">&lt;50ms</div>
                <div className="text-sm text-muted-foreground">Response</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">5+</div>
                <div className="text-sm text-muted-foreground">Data Sources</div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Demo */}
          <div className="order-2 fade-in fade-in-delay-2">
            <IPLookupDemo />
          </div>
        </div>

        {/* Stats - Shown on mobile only */}
        <div className="fade-in fade-in-delay-4 lg:hidden grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
          <div>
            <div className="text-2xl md:text-3xl font-bold mb-1">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold mb-1">&lt;50ms</div>
            <div className="text-sm text-muted-foreground">Response</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-bold mb-1">5+</div>
            <div className="text-sm text-muted-foreground">Data Sources</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

