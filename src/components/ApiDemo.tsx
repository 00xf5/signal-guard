import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

const sampleResponse = `{
  "target": "8.8.8.8",
  "type": "ip",
  "riskScore": 42,
  "riskLevel": "Medium",
  "anonymityScore": 68,
  "anonymityLevel": "Medium-High",
  "connectionType": "Residential Proxy",
  "confidence": 0.87,
  "abuse": {
    "reports": 5,
    "abuseConfidenceScore": 35,
    "lastReported": "2025-12-20T14:35:00Z",
    "categories": ["Spam", "Brute Force"]
  },
  "network": {
    "asn": "AS12345",
    "organization": "Example ISP",
    "asnType": "Residential ISP",
    "hostingProvider": false
  },
  "flags": {
    "vpnDetected": true,
    "proxyType": "Residential",
    "torDetected": false,
    "asnGeoMismatch": true,
    "ipRotationLikely": true
  },
  "summary": "This IP presents a medium security risk..."
}`;

const ApiDemo = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 border-t border-border" id="api">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Info */}
          <div>
            <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-border" />
              API
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Simple endpoints.
              <br />
              <span className="text-muted-foreground">Rich intelligence.</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Two endpoints. Complete visibility. Get risk scores, anonymity percentages, 
              and actionable intelligence in milliseconds.
            </p>

            {/* Endpoints */}
            <div className="space-y-4 mb-8">
              <div className="code-block">
                <div className="text-xs text-muted-foreground mb-2">Check IP</div>
                <code className="text-sm">
                  <span className="text-success">GET</span>{" "}
                  <span className="text-foreground">/api/check-ip</span>
                  <span className="text-muted-foreground">?ip=8.8.8.8</span>
                </code>
              </div>
              <div className="code-block">
                <div className="text-xs text-muted-foreground mb-2">Check Domain</div>
                <code className="text-sm">
                  <span className="text-success">GET</span>{" "}
                  <span className="text-foreground">/api/check-domain</span>
                  <span className="text-muted-foreground">?domain=example.com</span>
                </code>
              </div>
            </div>

            <Button variant="outline" size="sm">
              View Full API Docs
            </Button>
          </div>

          {/* Right side - Response */}
          <div className="relative">
            <div className="code-block max-h-[500px] overflow-auto">
              <div className="flex items-center justify-between mb-4 sticky top-0 bg-card pb-2 border-b border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  200 OK
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-6 px-2 text-xs"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <pre className="text-xs leading-relaxed">
                <code>{sampleResponse}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApiDemo;
