import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";

const riskLevels = [
  { range: "0–29", level: "Low", color: "bg-success" },
  { range: "30–69", level: "Medium", color: "bg-warning" },
  { range: "70–100", level: "High", color: "bg-danger" },
];

const anonymityLevels = [
  { range: "0–30%", level: "Low anonymity", color: "bg-success" },
  { range: "31–60%", level: "Medium anonymity", color: "bg-warning" },
  { range: "61–100%", level: "High anonymity", color: "bg-danger" },
];

const signals = [
  "VPN / Proxy type",
  "TOR usage",
  "Residential vs Datacenter IP",
  "ASN & Geo mismatch",
  "IP rotation likelihood",
  "Hosting provider reputation",
];

// Animated score bar component
const AnimatedScoreBar = ({ 
  segments,
  isVisible 
}: { 
  segments: { width: string; color: string }[];
  isVisible: boolean;
}) => {
  const [widths, setWidths] = useState(segments.map(() => "0%"));

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setWidths(segments.map(s => s.width));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, segments]);

  return (
    <div className="h-3 w-full bg-secondary flex overflow-hidden mb-6">
      {segments.map((segment, i) => (
        <div 
          key={i}
          className={`h-full ${segment.color} transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: widths[i] }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

const Scoring = () => {
  const [isRiskVisible, setIsRiskVisible] = useState(false);
  const [isAnonymityVisible, setIsAnonymityVisible] = useState(false);

  return (
    <section className="py-24 border-t border-border" id="scoring">
      <div className="container">
        <ScrollReveal>
          <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-border" />
            SCORING SYSTEM
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Transparent scoring.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Risk Score */}
          <ScrollReveal delay={100}>
            <div 
              className="border border-border p-6 glow-card hover-lift"
              ref={(el) => {
                if (el) {
                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting) setIsRiskVisible(true);
                    },
                    { threshold: 0.3 }
                  );
                  observer.observe(el);
                }
              }}
            >
              <h3 className="text-xl font-semibold mb-2">Risk Score</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Range: 0–100 — Likelihood of malicious activity
              </p>
              
              <AnimatedScoreBar 
                isVisible={isRiskVisible}
                segments={[
                  { width: '29%', color: 'bg-success' },
                  { width: '40%', color: 'bg-warning' },
                  { width: '31%', color: 'bg-danger' },
                ]}
              />

              <div className="space-y-3">
                {riskLevels.map((level, i) => (
                  <div 
                    key={level.range} 
                    className="flex items-center gap-3 text-sm transition-all duration-300"
                    style={{ 
                      opacity: isRiskVisible ? 1 : 0,
                      transform: isRiskVisible ? 'translateX(0)' : 'translateX(-10px)',
                      transitionDelay: `${i * 100 + 300}ms`
                    }}
                  >
                    <span className={`w-3 h-3 ${level.color} animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                    <span className="text-muted-foreground w-16">{level.range}</span>
                    <span>{level.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Anonymity Score */}
          <ScrollReveal delay={200}>
            <div 
              className="border border-border p-6 glow-card hover-lift"
              ref={(el) => {
                if (el) {
                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      if (entry.isIntersecting) setIsAnonymityVisible(true);
                    },
                    { threshold: 0.3 }
                  );
                  observer.observe(el);
                }
              }}
            >
              <h3 className="text-xl font-semibold mb-2">Anonymity Percentage</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Range: 0–100% — Difficulty of attributing activity to a real user
              </p>
              
              <AnimatedScoreBar 
                isVisible={isAnonymityVisible}
                segments={[
                  { width: '30%', color: 'bg-success' },
                  { width: '30%', color: 'bg-warning' },
                  { width: '40%', color: 'bg-danger' },
                ]}
              />

              <div className="space-y-3">
                {anonymityLevels.map((level, i) => (
                  <div 
                    key={level.range} 
                    className="flex items-center gap-3 text-sm transition-all duration-300"
                    style={{ 
                      opacity: isAnonymityVisible ? 1 : 0,
                      transform: isAnonymityVisible ? 'translateX(0)' : 'translateX(-10px)',
                      transitionDelay: `${i * 100 + 300}ms`
                    }}
                  >
                    <span className={`w-3 h-3 ${level.color} animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                    <span className="text-muted-foreground w-16">{level.range}</span>
                    <span>{level.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Weighted Signals */}
        <ScrollReveal delay={300}>
          <div className="border border-border p-6 max-w-xl glow-card">
            <h3 className="text-lg font-semibold mb-4">Weighted Signals Include:</h3>
            <div className="grid grid-cols-2 gap-3 stagger-children">
              {signals.map((signal) => (
                <div key={signal} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <span className="w-1.5 h-1.5 bg-foreground" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Scoring;
