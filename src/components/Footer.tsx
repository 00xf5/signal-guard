import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold mb-3">
              <img src="/favicon.png" alt="RiskSignal" className="w-6 h-6 object-contain" />
              <span>RiskSignal</span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-xs">
              Professional IP Intelligence.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/api-access" className="hover:text-foreground transition-colors">API Keys</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 RiskSignal. All rights reserved.</p>
          <p>
            RiskSignal provides probabilistic intelligence, not guarantees.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

