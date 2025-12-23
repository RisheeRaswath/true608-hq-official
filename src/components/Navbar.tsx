import { LogOut, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = ({ userEmail, handleLogout }: { userEmail: string | null, handleLogout: () => void }) => {
  
  // THE TARGETING COMPUTER: Smooth Scroll Logic
  const scrollToPricing = () => {
    const element = document.getElementById('investment-tiers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="border-b border-white/10 bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <img src="/logo.png" alt="TRUE608" className="h-7 w-auto object-contain" />
        
        <div className="flex items-center gap-8">
          {/* THE PRIMARY NAV STRIKE */}
          <button 
            onClick={scrollToPricing}
            className="hidden md:block text-[10px] font-mono text-white/40 hover:text-blue-600 uppercase tracking-[0.3em] transition-all cursor-pointer font-black"
          >
            INVESTMENT TIERS
          </button>

          <span className="hidden lg:block text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            ACCESS ID: {userEmail || "GUEST"}@608.SECURE
          </span>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/40 hover:text-white hover:bg-blue-600/20 font-bold tracking-tighter" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> TERMINATE
          </Button>
        </div>
      </div>
    </nav>
  );
};