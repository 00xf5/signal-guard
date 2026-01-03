import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/favicon.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span>RiskSignal</span>
        </Link>


        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/discovery" className="text-foreground hover:text-success transition-colors font-medium">
            Discovery
          </Link>
          <Link to="/inventory" className="text-foreground hover:text-info transition-colors font-medium">
            Inventory
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#scoring" className="text-muted-foreground hover:text-foreground transition-colors">
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

