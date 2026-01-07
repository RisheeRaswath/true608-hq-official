import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight mb-6">
          The Only Verified Legal Defense for HVAC Inventory
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          General software manages your schedule. True608 manages your freedom.
          Ensure 40 CFR Part 84 compliance before the audit hits.
        </p>
        
        <Button
          size="lg"
          asChild
          className="bg-[#FF4F00] hover:bg-[#E65100] text-white text-lg px-8 py-8 font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(255,79,0,0.3)] transition-all transform hover:-translate-y-1"
        >
          <a href="/app">
            Initialize Federal Compliance Scan
            <Lock className="w-5 h-5 ml-2" />
          </a>
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;