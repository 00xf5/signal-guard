import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-12 h-12 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to see the signal?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Built for security teams, fraud detection, bug hunters, SOCs, and developers 
            who need actionable intelligence.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button variant="hero" size="lg">
              Get API Access
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>

          {/* Pricing teaser */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Free tier available — Limited daily checks</p>
            <p>Paid plans for bulk analysis & enterprise</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
