import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth"; 
import Dashboard from "./pages/Dashboard";
import FieldShieldScan from "./pages/FieldShieldScan";
import NotFound from "./pages/NotFound";

// CRITICAL: Check environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const isConfigBroken = !SUPABASE_URL;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className={isConfigBroken ? "min-h-screen bg-red-600" : ""}>
          <Routes>
            {/* true608.com/ -> Marketing Page */}
            <Route path="/" element={<Index />} /> 
            
            {/* true608.com/app -> Orange Login Page */}
            <Route path="/app" element={<Auth />} /> 
            
            {/* true608.com/app/dashboard -> Admin/CEO Selection Screen */}
            <Route path="/app/dashboard" element={<Dashboard />} />
            
            {/* true608.com/app/field-shield/scan -> Technician Direct Access */}
            <Route path="/app/field-shield/scan" element={<FieldShieldScan />} />
            
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
