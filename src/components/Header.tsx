import { Shield } from "lucide-react";

const Header = () => {
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
          <a href="#scoring" className="text-muted-foreground hover:text-foreground transition-colors">
            Scoring
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Header actions removed as per request */}
        </div>
      </div>
    </header>
  );
};

export default Header;

