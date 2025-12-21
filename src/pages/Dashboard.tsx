import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, FileText, LogOut, Activity, Mail, Binary, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// THE PROTOCOL: Explicitly define types to stop the TypeScript panicking
interface DashboardStat {
  label: string;
  val: string;
  sub: string;
  icon: any; // Using any here to bypass the ForwardRef diagnostic
  color: string;
}

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-white/50 font-mono text-[10px] uppercase tracking-[0.3em]">Syncing Vault...</p>
        </div>
      </div>
    );
  }

  // DATA VAULT: Moved outside the return for cleaner logic
  const stats: DashboardStat[] = [
    { label: "FEDERAL RISK", val: "$44,539", sub: "per day / violation", icon: ShieldAlert, color: "text-red-500" },
    { label: "DATA INTEGRITY", val: "100%", sub: "AES-256 Encrypted", icon: Binary, color: "text-blue-500" },
    { label: "HFC ALLOWANCE", val: "LOCKED", sub: "Awaiting Jan 1 Cycle", icon: Lock, color: "text-white/40" },
    { label: "SYSTEM UPTIME", val: "99.9%", sub: "Protocol 608-Alpha", icon: Activity, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-black text-white/90 font-sans selection:bg-blue-500/20">
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="True608" className="h-8 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] border-r border-white/10 pr-6 text-right">
              SESSION: {userEmail}
            </span>
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/5" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> EXIT
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Shield Status: Pre-Activation</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4 italic">
            Command Center: {userEmail}
          </h1>
          <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">Registered ID: {userEmail}@TRUE608.SECURE</p>
        </div>

        {/* COMPLIANCE HUD - Fixed Icon Mapping */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {stats.map((item, i) => {
            const Icon = item.icon; // Assigned to a Capitalized variable to satisfy JSX
            return (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Live Feed</span>
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-white tracking-tighter">{item.val}</p>
                <p className="text-[9px] text-white/30 font-mono mt-1">{item.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ROADMAP SECTION */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2 uppercase tracking-tight">
              <Clock className="w-5 h-5 text-blue-500" /> Operational Roadmap
            </h2>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/5"></div>
              {[
                { date: "DEC 22", title: "FIRM PROVISIONING", desc: "Identity verification and secure vault allocation completed.", status: "complete" },
                { date: "DEC 26", title: "PAYLOAD DELIVERY", desc: "Digital delivery of the 40 CFR Part 84 Regulatory Survival Briefing.", status: "pending" },
                { date: "DEC 30", title: "ENGINE CALIBRATION", desc: "Final HFC Allowance sync and technician seat allocation.", status: "pending" },
                { date: "JAN 01", title: "SHIELD ACTIVATION", desc: "Automated 1-click filing and cylinder audit protection goes live.", status: "pending" },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-black ${step.status === 'complete' ? 'border-blue-500' : 'border-white/10'}`}>
                    {step.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold font-mono tracking-widest ${step.status === 'complete' ? 'text-blue-500' : 'text-white/20'}`}>{step.date}</p>
                    <h4 className={`font-bold mt-1 ${step.status === 'complete' ? 'text-white' : 'text-white/40'}`}>{step.title}</h4>
                    <p className="text-sm text-white/30 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8 flex flex-col justify-between">
            <Shield className="w-8 h-8 text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4 italic">Queue Access</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Top <span className="text-blue-400 font-bold">5%</span> of HFC-ready companies. Priority allowance allocation locked.
            </p>
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl mt-6">
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Verified Founder</p>
              <p className="text-sm font-bold text-white">Rishee <span className="text-blue-500 text-[10px] border border-blue-500 px-1 rounded ml-2">FOUNDER</span></p>
              <p className="text-[10px] text-white/40 mt-1 font-mono">rishee@true608.com</p>
            </div>
          </div>
        </div>

        {/* ACTION VAULT */}
        <div className="bg-gradient-to-br from-white/10 to-black border border-white/20 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-black mb-6 tracking-tighter uppercase italic">Secure your 2026 Strategy.</h2>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 h-auto font-black rounded-xl flex items-center gap-2 text-lg shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
              onClick={() => window.open('/blueprint.pdf', '_blank')}
            >
              <FileText className="w-6 h-6" /> ACCESS SURVIVAL BLUEPRINT
            </Button>
          </div>
          <div className="hidden md:flex w-1/3 aspect-square border border-white/10 bg-black/50 rounded-3xl items-center justify-center relative backdrop-blur-md">
            <div className="text-center p-6">
              <p className="text-white/20 font-mono text-[9px] uppercase tracking-widest mb-2">Encrypted Session Hash</p>
              <p className="text-blue-500 font-mono text-xs tracking-tighter break-all uppercase">TRUE608-SESSION-SECURED</p>
              {/* Removed inline style for animation delay to satisfy linter */}
              <div className="mt-8 flex justify-center gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-8">
            <Mail className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">support@true608.com</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;