import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, FileText, LogOut, Activity, Mail, Binary, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // THE TIME ENGINE: Calculates mission milestones relative to today
  const getDynamicDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  };

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
    toast({ title: "TERMINATED", description: "Secure session ended." });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/5 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.4em] font-bold">Initializing HUD</p>
        </div>
      </div>
    );
  }

  const roadmapSteps = [
    { date: "TODAY", title: "FIRM PROVISIONING", desc: "Identity verified. Vault allocated. Encryption hash generated.", status: "complete" },
    { date: getDynamicDate(2), title: "PAYLOAD DELIVERY", desc: "Digital transmission of the 40 CFR Part 84 Survival Protocol.", status: "pending" },
    { date: getDynamicDate(4), title: "ENGINE CALIBRATION", desc: "HFC Allowance sync and technician seat allocation.", status: "pending" },
    { date: "JAN 01", title: "SHIELD ACTIVATION", desc: "1-Click Federal Reporting and Audit Protection goes live.", status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-600/30">
      {/* STEALTH NAV */}
      <nav className="border-b border-white/10 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="TRUE608" className="h-7 w-auto object-contain" />
          <div className="flex items-center gap-8">
            <span className="hidden md:block text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
              ACCESS ID: {userEmail}@608.SECURE
            </span>
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-red-500 font-bold tracking-tighter transition-colors" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> TERMINATE SESSION
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* HEADER: COMMANDING STATUS */}
        <div className="mb-16 border-l-8 border-blue-600 pl-8">
          <div className="flex items-center gap-2 text-blue-500 mb-3">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Operational Status: Active</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-none mb-4">
            COMMAND: {userEmail}
          </h1>
          <p className="text-white/30 font-mono text-xs uppercase tracking-widest">Global Encryption Node: TRUE-608-INTEL-{new Date().getFullYear()}</p>
        </div>

        {/* STATS HUD: DATA-DRIVEN */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {[
            { label: "FEDERAL RISK", val: "$44,539", sub: "DAILY LIABILITY", icon: ShieldAlert, color: "text-red-600" },
            { label: "ENCRYPTION", val: "AES-256", sub: "MILITARY GRADE", icon: Binary, color: "text-blue-600" },
            { label: "ALLOWANCE", val: "LOCKED", sub: "PRIORITY-1 QUEUE", icon: Lock, color: "text-white/20" },
            { label: "HUD VERSION", val: "1.0.8", sub: "SECURE KERNEL", icon: Activity, color: "text-green-600" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-none group hover:border-blue-600/50 transition-all">
                <Icon className={`w-5 h-5 ${item.color} mb-6`} />
                <p className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">{item.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter uppercase">{item.val}</p>
                <p className="text-[9px] text-white/20 font-mono mt-1 font-bold">{item.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ROADMAP: THE MISSION TIMELINE */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="md:col-span-2 bg-white/[0.02] border border-white/10 p-10">
            <h2 className="text-2xl font-black mb-12 flex items-center gap-3 uppercase tracking-tighter border-b border-white/5 pb-6">
              <Clock className="w-6 h-6 text-blue-600" /> OPERATION ROADMAP
            </h2>
            <div className="space-y-12 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-white/10"></div>
              {roadmapSteps.map((step, i) => (
                <div key={i} className="flex gap-10 relative z-10">
                  <div className={`w-6 h-6 rounded-none border-2 flex items-center justify-center bg-black transition-all ${step.status === 'complete' ? 'border-blue-600 bg-blue-600' : 'border-white/10'}`}>
                    {step.status === 'complete' && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black font-mono tracking-[0.3em] ${step.status === 'complete' ? 'text-blue-600' : 'text-white/20'}`}>{step.date}</p>
                    <h4 className={`text-xl font-black mt-1 uppercase ${step.status === 'complete' ? 'text-white' : 'text-white/40'}`}>{step.title}</h4>
                    <p className="text-sm text-white/30 mt-2 max-w-lg leading-relaxed font-medium uppercase tracking-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOUNDER CARD: THE AUTHORITY */}
          <div className="flex flex-col gap-6">
            <div className="bg-blue-600 p-8 flex flex-col justify-between border-t-8 border-white">
              <div>
                <Shield className="w-10 h-10 text-white mb-8" />
                <h3 className="text-3xl font-black text-white mb-4 uppercase leading-none">QUEUE CONFIRMED</h3>
                <p className="text-white/80 text-sm font-bold uppercase tracking-tight">
                  YOUR FIRM IS LOCKED FOR THE JAN 1ST ACTIVATION CYCLE. PUBLIC WAITING LIST BYPASSED.
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest mb-4">PRIMARY CONTACT</p>
                <p className="text-xl font-black text-white uppercase">RISHEE</p>
                <p className="text-[11px] text-white/70 font-bold uppercase tracking-widest mb-6">FOUNDER | COMPLIANCE LEAD</p>
                <button 
                  onClick={() => window.location.href = 'mailto:rishee@true608.com'}
                  className="text-[11px] text-white font-black uppercase underline decoration-2 underline-offset-8 hover:text-black transition-colors"
                >
                  RISHEE@TRUE608.COM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BLUEPRINT SECURE BOX */}
        <div className="bg-white text-black p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">ACCESS THE SURVIVAL PROTOCOL.</h2>
            <p className="text-black/60 font-bold uppercase text-sm mb-10 tracking-tight max-w-md">
              THIS IS YOUR TACTICAL MANUAL FOR MANAGING REFRIGERANT LIABILITIES UNTIL THE SHIELD ACTIVATES ON JAN 01.
            </p>
            <Button 
              className="bg-black text-white hover:bg-blue-600 px-12 py-8 h-auto font-black rounded-none flex items-center gap-4 text-xl tracking-tighter transition-all active:scale-95"
              onClick={() => window.open('/blueprint.pdf', '_blank')}
            >
              <FileText className="w-8 h-8" /> DOWNLOAD PROTOCOL
            </Button>
          </div>
          <div className="hidden lg:block w-72 h-72 border-[16px] border-black/5 flex items-center justify-center">
               <div className="text-center">
                 <p className="text-[10px] font-mono text-black/20 uppercase mb-2 font-bold tracking-[0.3em]">SESSION HASH</p>
                 <p className="text-black font-mono text-xs font-black uppercase">TRU-{Math.random().toString(36).substring(7).toUpperCase()}</p>
               </div>
          </div>
        </div>

        {/* FOOTER: COMMAND CHANNELS */}
        <footer className="mt-24 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-12">
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Internal Security: 608-A</span>
              <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Audit Grade: Gold</span>
            </div>
            <a href="mailto:support@true608.com" className="text-[11px] font-black text-blue-600 hover:text-white transition-colors uppercase tracking-[0.4em] underline decoration-2 underline-offset-8">SUPPORT@TRUE608.COM</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;