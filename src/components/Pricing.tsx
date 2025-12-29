import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For developers exploring the API",
    features: [
      "100 requests/day",
      "IP & domain checks",
      "Risk scoring",
      "Anonymity detection",
      "Community support",
    ],
    limitations: [
      "No bulk analysis",
      "Standard rate limits",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For teams and production apps",
    features: [
      "10,000 requests/day",
      "Everything in Free",
      "Bulk CSV analysis",
      "Priority rate limits",
      "Webhook notifications",
      "Email support",
      "API key rotation",
    ],
    limitations: [],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale security operations",
    features: [
      "Unlimited requests",
      "Everything in Pro",
      "Custom integrations",
      "Dedicated infrastructure",
      "SLA guarantees",
      "Dedicated support",
      "Custom scoring models",
      "On-premise option",
    ],
    limitations: [],
    cta: "Contact Sales",
    highlight: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 border-t border-border" id="pricing">
      <div className="container">
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-border" />
          PRICING
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Simple, transparent pricing.
        </h2>
        <p className="text-muted-foreground mb-16 max-w-xl">
          Start free. Scale as you grow. No hidden fees. Cancel anytime.
        </p>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`slide-up border p-6 flex flex-col ${
                tier.highlight
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  {tier.highlight && (
                    <span className="text-xs px-2 py-1 bg-background text-foreground">
                      POPULAR
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={tier.highlight ? "text-background/60" : "text-muted-foreground"}>
                    {tier.period}
                  </span>
                </div>
                <p className={`text-sm ${tier.highlight ? "text-background/70" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                      tier.highlight ? "text-background" : "text-foreground"
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
                {tier.limitations.map((limitation) => (
                  <li
                    key={limitation}
                    className={`flex items-start gap-3 text-sm ${
                      tier.highlight ? "text-background/50" : "text-muted-foreground"
                    }`}
                  >
                    <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                      −
                    </span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={tier.highlight ? "secondary" : "outline"}
                className={`w-full ${
                  tier.highlight
                    ? "bg-background text-foreground hover:bg-background/90"
                    : ""
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="p-4 font-semibold text-center">Free</th>
                <th className="p-4 font-semibold text-center bg-secondary/30">Pro</th>
                <th className="p-4 font-semibold text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Daily requests", free: "100", pro: "10,000", enterprise: "Unlimited" },
                { feature: "IP checks", free: "✓", pro: "✓", enterprise: "✓" },
                { feature: "Domain checks", free: "✓", pro: "✓", enterprise: "✓" },
                { feature: "Risk scoring", free: "✓", pro: "✓", enterprise: "✓" },
                { feature: "Anonymity detection", free: "✓", pro: "✓", enterprise: "✓" },
                { feature: "Bulk CSV analysis", free: "—", pro: "✓", enterprise: "✓" },
                { feature: "Webhook notifications", free: "—", pro: "✓", enterprise: "✓" },
                { feature: "Priority rate limits", free: "—", pro: "✓", enterprise: "✓" },
                { feature: "Custom integrations", free: "—", pro: "—", enterprise: "✓" },
                { feature: "SLA guarantee", free: "—", pro: "—", enterprise: "99.9%" },
                { feature: "Support", free: "Community", pro: "Email", enterprise: "Dedicated" },
              ].map((row, index) => (
                <tr key={row.feature} className={index !== 10 ? "border-b border-border" : ""}>
                  <td className="p-4 text-muted-foreground">{row.feature}</td>
                  <td className="p-4 text-center">{row.free}</td>
                  <td className="p-4 text-center bg-secondary/30">{row.pro}</td>
                  <td className="p-4 text-center">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
