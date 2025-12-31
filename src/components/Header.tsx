import { Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <a href="/" className="flex items-center gap-2 font-semibold" title="RiskSignal - Professional IP Intelligence Home">
          <img src="/favicon.png" alt="RiskSignal Security Logo" className="w-6 h-6 object-contain" />
          <span>RiskSignal</span>
        </a>


        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors" title="Deep IP features and threat detection">
            Features
          </a>
          <a href="#scoring" className="text-muted-foreground hover:text-foreground transition-colors" title="How our risk scoring system works">
            Scoring
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;

