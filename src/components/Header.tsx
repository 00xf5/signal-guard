import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <a href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="w-5 h-5" />
          <span>RiskSignal</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#api" className="text-muted-foreground hover:text-foreground transition-colors">
            API
          </a>
          <a href="#scoring" className="text-muted-foreground hover:text-foreground transition-colors">
            Scoring
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Docs
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/api-key')}>
            Get API Key
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
