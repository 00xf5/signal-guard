import { 
  Shield, 
  Eye, 
  Brain, 
  Zap, 
  Database,
  Globe,
  AlertTriangle,
  Users,
  Server,
  MapPin
} from "lucide-react";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const features = [
  {
    category: "Risk Intelligence",
    icon: Shield,
    items: [
      { icon: AlertTriangle, text: "IP and domain reputation analysis" },
      { icon: Database, text: "Abuse history & confidence scoring" },
      { icon: Shield, text: "Threat category classification" },
    ]
  },
  {
    category: "Anonymity Intelligence",
    icon: Eye,
    items: [
      { icon: Eye, text: "Anonymity Percentage (0–100%)" },
      { icon: Globe, text: "VPN / Proxy / TOR detection" },
      { icon: Server, text: "Residential vs Datacenter classification" },
      { icon: Users, text: "ASN & hosting provider intelligence" },
      { icon: MapPin, text: "Geo & ASN mismatch detection" },
    ]
  },
  {
    category: "Explainable Scoring",
    icon: Brain,
    items: [
      { icon: Database, text: "Raw third-party data" },
      { icon: Brain, text: "Transparent flags & breakdown" },
      { icon: Zap, text: "Human-readable summaries" },
    ]
  }
];

const Features = () => {
  return (
    <section className="py-24 border-t border-border" id="features">
      <div className="container">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-16">
            <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-border" />
              CAPABILITIES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligence, not guesswork.
            </h2>
            <p className="text-muted-foreground max-w-xl">
              RiskSignal aggregates and correlates data from multiple providers to deliver 
              actionable intelligence — not vibes.
            </p>
          </div>
        </ScrollReveal>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.category} delay={index * 100}>
              <div className="border border-border p-6 h-full hover-lift bg-card/50 glow-card group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 border border-border group-hover:border-foreground/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.category}</h3>
                </div>
                <ul className="space-y-4">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors">
                      <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Serverless badge */}
        <ScrollReveal delay={400}>
          <div className="mt-16 flex items-center gap-4 text-sm text-muted-foreground border border-border p-4 max-w-fit">
            <Zap className="w-4 h-4 text-warning animate-pulse" />
            <span>Serverless & Fast — Designed for Vercel / serverless environments. JSON-first API. No database required.</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Features;
