import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, FileText, LogOut, ExternalLink, Activity, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        const email = session.user.email;
        // Logic: Extract name from email for that personal 'Stark' touch
        setUserEmail(email?.split('@')[0].toUpperCase() || "TECHNICIAN");
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Session Terminated", description: "Secure logout successful." });
    navigate("/");
  };

  if (loading) {
    return (
      // Changed background to pure black
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-white/50 font-mono text-[10px] uppercase tracking-[0.3em]">Syncing Vault...</p>
        </div>
      </div>
    );
  }

  return (
    // Changed main background to pure black
    <div className="min-h-screen bg-black text-white/90 font-sans selection:bg-blue-500/20">
      {/* Official True608 Stealth Navigation */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ---------- LOGO PLACEHOLDER ---------- 
                Replace the 'src' below with your actual logo path. 
                Example: src="/logo.png" 
                Adjust width (w-32) as needed to fit your logo.
            */}
            <img 
              src="/logo.png" 
              alt="True608 Intelligence" 
              className="h-8 w-auto object-contain"
            />
            {/* -------------------------------------- */}
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] border-r border-white/10 pr-6">
              ID: {userEmail}
            </span>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> EXIT
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Personalized Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-2 text-blue-500 mb-4">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Intelligence Online</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-6">
            Welcome, {userEmail}.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed font-light">
            Your firm is provisioned for the <span className="text-white font-medium">2026 HFC reporting cycle</span>. 
            Automated tracking is currently in final calibration for your inventory.
          </p>
        </div>

        {/* Tactical Info Grid - Updated for Black Theme */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="group bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-all duration-500">
            <Shield className="w-6 h-6 text-blue-500 mb-6" />
            <h3 className="text-xl font-bold mb-3 text-white">Priority-1 Queue</h3>
            <p className="text-white/60 leading-relaxed mb-6 text-sm">
              True608 has authorized your credentials for initial activation. 
              Automated compliance kicks in <span className="text-blue-400 font-bold">January 1, 2026</span>.
            </p>
            <div className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase">STATUS: VERIFIED</div>
          </div>

          <div className="group bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-white/30 transition-all duration-500">
            <Clock className="w-6 h-6 text-white/40 mb-6" />
            <h3 className="text-xl font-bold mb-3 text-white">Operational Roadmap</h3>
            <p className="text-white/60 leading-relaxed mb-6 text-sm">
              We are finalizing the 40 CFR Part 84 tracking logic. 
              Expect technical briefings via email from <span className="text-white/80">rishee@true608.com</span>.
            </p>
            <div className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">PHASE: CALIBRATION</div>
          </div>
        </div>

        {/* The Action Vault - Updated for Black Theme */}
        <div className="bg-gradient-to-br from-white/5 to-black border border-white/10 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl shadow-black">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-6 tracking-tight text-white">Secure your 2026 Strategy.</h2>
            <p className="text-white/60 leading-relaxed mb-8">
              The <span className="text-blue-400">Survival Blueprint</span> has been dispatched to your email. 
              Use the button below to access your local copy immediately.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 h-auto font-bold rounded-xl flex items-center gap-2"
              onClick={() => window.open('/blueprint.pdf', '_blank')}
            >
              <FileText className="w-5 h-5" /> ACCESS SURVIVAL BLUEPRINT
            </Button>
          </div>

          <div className="w-full md:w-1/3 aspect-square border border-white/10 bg-black/50 rounded-3xl flex items-center justify-center relative backdrop-blur-sm">
            <div className="text-center p-6">
              <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest mb-2">Encryption Hash</p>
              <p className="text-blue-500 font-mono text-xs tracking-tighter break-all">TRUE608-SESSION-SECURED-{Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Support Footer - Updated for Black Theme */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-6">
            <Mail className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Support: support@true608.com</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <button 
              className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors"
              onClick={() => window.location.href = 'mailto:support@true608.com'}
            >
              CONTACT SUPPORT
            </button>
            <p className="text-[9px] text-white/30 font-mono uppercase tracking-[0.1em]">
              All communications are monitored for compliance quality.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;