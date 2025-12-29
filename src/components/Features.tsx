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

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.category}
              className="slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="border border-border p-6 h-full hover-lift bg-card/50">
                <div className="flex items-center gap-3 mb-6">
                  <feature.icon className="w-5 h-5 text-foreground" />
                  <h3 className="text-lg font-semibold">{feature.category}</h3>
                </div>
                <ul className="space-y-4">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Serverless badge */}
        <div className="mt-16 flex items-center gap-4 text-sm text-muted-foreground">
          <Zap className="w-4 h-4" />
          <span>Serverless & Fast — Designed for Vercel / serverless environments. JSON-first API. No database required.</span>
        </div>
      </div>
    </section>
  );
};

export default Features;
