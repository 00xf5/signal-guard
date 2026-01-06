import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, Globe, Database, Info, Code, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Discovery", href: "/discovery", icon: Globe, color: "text-success" },
    { name: "Inventory", href: "/inventory", icon: Database, color: "text-info" },
    { name: "Forensics", href: "/forensics", icon: Shield, color: "text-warning" },
    { name: "About", href: "/about", icon: Info, color: "text-muted-foreground" },
    { name: "Docs", href: "/docs", icon: Code, color: "text-muted-foreground" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/favicon.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span>RiskSignal</span>
        </Link>


        <nav className="hidden md:flex items-center gap-8 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`font-medium transition-colors ${link.href === "/about" || link.href === "/docs" ? "text-muted-foreground hover:text-foreground" : `text-foreground hover:${link.color.replace('text-', '')}`}`}
            >
              {link.name}
            </Link>
          ))}
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden hover:bg-foreground/5 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[48] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-14 bottom-0 w-64 bg-background border-l border-border z-[49] md:hidden overflow-y-auto px-6 py-8"
            >
              <div className="space-y-6">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield className="w-3 h-3 text-info" /> Navigation_Hub
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-4 bg-terminal-bg/50 border border-panel-border rounded-xl hover:border-info/30 transition-all group"
                    >
                      <link.icon className={`w-5 h-5 ${link.color}`} />
                      <span className="text-sm font-bold text-foreground">{link.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <a
                    href="#features"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#scoring"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Scoring
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

