import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { Database, Shield, Eye, Globe, Server } from "lucide-react";
import { useState } from "react";

const sources = [
  { provider: "AbuseIPDB", purpose: "Abuse reports & confidence score", icon: Shield },
  { provider: "IPinfo", purpose: "ASN, organization, geolocation", icon: Globe },
  { provider: "IPQualityScore", purpose: "VPN / proxy / TOR detection", icon: Eye },
  { provider: "IPAPI.co", purpose: "ASN & hosting hints", icon: Server },
  { provider: "Public ASN lists", purpose: "Hosting & bulletproof detection", icon: Database },
];

const DataSources = () => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section className="py-24 border-t border-border" id="sources">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Intelligence Sources
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Correlating data from multiple providers to deliver derived intelligence.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="border border-border overflow-hidden max-w-2xl">
            <div className="grid grid-cols-[auto_1fr_2fr] bg-secondary/50 text-sm">
              <div className="p-4 font-semibold border-r border-border w-12" />
              <div className="p-4 font-semibold border-r border-border">Provider</div>
              <div className="p-4 font-semibold">Purpose</div>
            </div>
            {sources.map((source, index) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.provider}
                  className={`grid grid-cols-[auto_1fr_2fr] text-sm transition-all duration-300 ${index !== sources.length - 1 ? 'border-b border-border' : ''
                    } ${hoveredRow === index ? 'bg-secondary/30' : ''}`}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="p-4 border-r border-border flex items-center justify-center">
                    <Icon className={`w-4 h-4 transition-all duration-300 ${hoveredRow === index ? 'text-foreground scale-110' : 'text-muted-foreground'}`} />
                  </div>
                  <div className={`p-4 border-r border-border transition-colors ${hoveredRow === index ? 'text-foreground' : ''}`}>
                    {source.provider}
                  </div>
                  <div className={`p-4 transition-colors ${hoveredRow === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {source.purpose}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-6 p-3 border border-border/50 max-w-fit">
            <Database className="w-3 h-3" />
            <span>RiskSignal does not resell raw data. It provides derived intelligence.</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DataSources;
