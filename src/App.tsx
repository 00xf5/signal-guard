import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThemeProvider from "@/contexts/ThemeContext";
import Index from "@/pages/Index";
import ApiAccess from "@/pages/ApiAccess";
import Docs from "@/pages/Docs";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import About from "@/pages/About";
import Discovery from "@/pages/Discovery";
import IntelDetailed from "@/pages/IntelDetailed";
import ReputationDetailed from "@/pages/ReputationDetailed";
import Explorer from "@/pages/Explorer";
import Forensics from "@/pages/Forensics";
import Inventory from "@/pages/Inventory";
import OrgInventory from "@/pages/OrgInventory";
import TacticalJS from "@/pages/TacticalJS";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/api-access" element={<ApiAccess />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/discovery" element={<Discovery />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:id" element={<OrgInventory />} />
            <Route path="/forensics" element={<Forensics />} />
            <Route path="/tactical-js" element={<TacticalJS />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/:query/detailed" element={<IntelDetailed />} />
            <Route path="/:query/reputation" element={<ReputationDetailed />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

