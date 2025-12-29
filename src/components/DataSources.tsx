const sources = [
  { provider: "AbuseIPDB", purpose: "Abuse reports & confidence score" },
  { provider: "IPinfo", purpose: "ASN, organization, geolocation" },
  { provider: "IPQualityScore", purpose: "VPN / proxy / TOR detection" },
  { provider: "IPAPI.co", purpose: "ASN & hosting hints" },
  { provider: "Public ASN lists", purpose: "Hosting & bulletproof detection" },
];

const DataSources = () => {
  return (
    <section className="py-24 border-t border-border" id="sources">
      <div className="container">
        <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <span className="w-8 h-px bg-border" />
          DATA SOURCES
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Aggregated intelligence.
        </h2>
        <p className="text-muted-foreground mb-12 max-w-xl">
          RiskSignal aggregates and correlates data from multiple providers. 
          We provide derived intelligence — not raw data resale.
        </p>

        {/* Table */}
        <div className="border border-border overflow-hidden max-w-2xl">
          <div className="grid grid-cols-2 bg-secondary/50 text-sm">
            <div className="p-4 font-semibold border-r border-border">Provider</div>
            <div className="p-4 font-semibold">Purpose</div>
          </div>
          {sources.map((source, index) => (
            <div 
              key={source.provider}
              className={`grid grid-cols-2 text-sm ${
                index !== sources.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="p-4 border-r border-border">{source.provider}</div>
              <div className="p-4 text-muted-foreground">{source.purpose}</div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-6">
          RiskSignal does not resell raw data. It provides derived intelligence.
        </p>
      </div>
    </section>
  );
};

export default DataSources;
