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

const Scoring = () => {
  return (
    <section className="py-24 border-t border-border" id="scoring">
      <div className="container">
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-border" />
          SCORING SYSTEM
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Transparent scoring.
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Risk Score */}
          <div className="border border-border p-6">
            <h3 className="text-xl font-semibold mb-2">Risk Score</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Range: 0–100 — Likelihood of malicious activity
            </p>
            
            {/* Visual bar */}
            <div className="h-2 w-full bg-secondary flex mb-6">
              <div className="h-full bg-success" style={{ width: '29%' }} />
              <div className="h-full bg-warning" style={{ width: '40%' }} />
              <div className="h-full bg-danger" style={{ width: '31%' }} />
            </div>

            <div className="space-y-3">
              {riskLevels.map((level) => (
                <div key={level.range} className="flex items-center gap-3 text-sm">
                  <span className={`w-3 h-3 ${level.color}`} />
                  <span className="text-muted-foreground w-16">{level.range}</span>
                  <span>{level.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anonymity Score */}
          <div className="border border-border p-6">
            <h3 className="text-xl font-semibold mb-2">Anonymity Percentage</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Range: 0–100% — Difficulty of attributing activity to a real user
            </p>
            
            {/* Visual bar */}
            <div className="h-2 w-full bg-secondary flex mb-6">
              <div className="h-full bg-success" style={{ width: '30%' }} />
              <div className="h-full bg-warning" style={{ width: '30%' }} />
              <div className="h-full bg-danger" style={{ width: '40%' }} />
            </div>

            <div className="space-y-3">
              {anonymityLevels.map((level) => (
                <div key={level.range} className="flex items-center gap-3 text-sm">
                  <span className={`w-3 h-3 ${level.color}`} />
                  <span className="text-muted-foreground w-16">{level.range}</span>
                  <span>{level.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weighted Signals */}
        <div className="border border-border p-6 max-w-xl">
          <h3 className="text-lg font-semibold mb-4">Weighted Signals Include:</h3>
          <div className="grid grid-cols-2 gap-3">
            {signals.map((signal) => (
              <div key={signal} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-foreground" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scoring;
