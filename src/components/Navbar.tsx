import { Link, useLocation } from "react-router-dom";
import { LogIn, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    } else if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
        
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer hover:opacity-80 transition-opacity group"
        >
          <img 
            src="/logo.png" 
            alt="True608 HQ" 
            className="h-7 w-auto sm:h-9 object-contain group-hover:scale-105 transition-transform" 
          />
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none">
            True608
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <button onClick={() => scrollToSection("liability-audit")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Liability Audit</button>
            <button onClick={() => scrollToSection("compliance-manual")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Manual</button>
            <button 
              onClick={() => scrollToSection("investment-tiers")} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Investment Tiers
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground px-2 sm:px-3 text-xs sm:text-sm">
              <a href="./app/index.html">
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Login
              </a>
            </Button>

            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 px-2 sm:px-4 text-xs sm:text-sm font-bold">
              <a href="./app/index.html">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Get Protected</span>
                <span className="xs:hidden">Join</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;