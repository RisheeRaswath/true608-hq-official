import Navbar from "@/components/Navbar";
import DoomsdayBanner from "@/components/DoomsdayBanner";
import HeroSection from "@/components/HeroSection";
import RiskCalculator from "@/components/RiskCalculator";
import PDFSection from "@/components/PDFSection";
import PricingChoice from "@/components/PricingChoice";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background selection:bg-blue-600/30">
      <Navbar />
      <DoomsdayBanner />
      <main>
        {/* PHASE 1: THE HOOK */}
        <HeroSection />

        {/* PHASE 2: THE VISUAL PROOF (NEW HUD REVEAL) */}
        <section className="bg-black py-12 md:py-24 relative overflow-hidden border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              
              {/* THE GLOWING TACTICAL FRAME */}
              <div className="relative rounded-none border border-white/10 bg-zinc-900 p-2 shadow-[0_0_100px_rgba(37,99,235,0.12)] group transition-all duration-700 hover:shadow-[0_0_120px_rgba(37,99,235,0.2)]">
                
                {/* HUD STATUS BAR */}
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-white/5 mb-1">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/40"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                  </div>
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] font-black">
                    TRUE608_TERMINAL_V1.0.9
                  </div>
                </div>

                <div className="relative overflow-hidden border border-white/5 bg-black">
                  {/* YOUR SCREENSHOT LOADS HERE */}
                  <img 
                    src="/dashboard-preview.png" 
                    alt="True608 Compliance OS Dashboard" 
                    className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity duration-700 grayscale-[30%] group-hover:grayscale-0"
                  />
                  
                  {/* THE RADAR SCANNER EFFECT */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-blue-500/10 to-transparent h-[15%] w-full animate-scan opacity-40"></div>
                </div>
              </div>

              {/* TACTICAL SUB-SPECS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                {[
                  { label: "SECURITY", val: "AES-256 GCM" },
                  { label: "REGULATION", val: "40 CFR PART 84" },
                  { label: "INFRASTRUCTURE", val: "SUPABASE/VITE" },
                  { label: "DEPLOYMENT", val: "READY_FOR_JAN_01" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-4 group hover:border-blue-500/30 transition-all">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">{item.label}</p>
                    <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PHASE 3: THE CALCULATION OF DEBT */}
        <RiskCalculator />

        {/* PHASE 4: THE SURVIVAL BAIT */}
        <PDFSection />

        {/* PHASE 5: THE TRANSACTION */}
        <PricingChoice />

        {/* PHASE 6: INTEL CLARIFICATION */}
        <FAQSection />
      </main>
      <Footer />

      {/* TACTICAL ANIMATION ENGINE */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;