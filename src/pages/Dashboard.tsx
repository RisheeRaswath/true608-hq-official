import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Clock, FileText, ChevronRight, LogOut, ExternalLink } from "lucide-react";
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium tracking-tight">Accessing Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* High-Authority Top Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">608</div>
            <span className="font-bold tracking-tight text-lg text-slate-900">TRUE<span className="text-blue-600">608</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200 pr-6">
              Authenticated: {userEmail}
            </span>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 font-medium" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Welcome Header */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Welcome, {userEmail}.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Your firm is now registered for the 2026 HFC reporting cycle. 
            The True608 Intelligence engine is currently calibrating for your specific inventory requirements.
          </p>
        </div>

        {/* The Priority Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="group bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Shield className="w-5 h-5 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 underline decoration-blue-500/30">Priority-1 Queue Active</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              You are among the first firms authorized to use The Shield's automated compliance layer. 
              Full system activation is scheduled for January 1st, 2026.
            </p>
            <div className="flex items-center text-sm font-bold text-blue-600 tracking-tight cursor-default uppercase">
              Status: Verified <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          <div className="group bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors">
              <Clock className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 underline decoration-slate-500/30">The Roadmap</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Our specialists are currently finalizing the 40 CFR Part 84 reporting logic. 
              You will receive a sequence of briefings over the next 10 days to prepare your fleet.
            </p>
            <div className="flex items-center text-sm font-bold text-slate-400 tracking-tight cursor-default uppercase">
              Next Briefing: Dec 24 <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* The Action/Hope Area */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              Secure Transmission
            </div>
            <h2 className="text-3xl font-bold mb-6 tracking-tight">Prepare your 2026 Compliance Strategy.</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              While the Shield engine initializes, ensure your technicians have reviewed the Manual Survival Protocol. 
              This document outlines the liability risks you've already mitigated by joining True608.
            </p>
            <Button 
              className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 h-auto font-bold rounded-xl flex items-center gap-2"
              onClick={() => window.open('/blueprint.pdf', '_blank')}
            >
              <FileText className="w-5 h-5" /> Download Survival Protocol
            </Button>
          </div>
          <div className="w-full md:w-1/3 aspect-square border border-slate-800 rounded-2xl flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
            <div className="text-center">
              <p className="text-slate-500 font-mono text-[10px] uppercase mb-2">Internal Encryption Key</p>
              <p className="text-blue-500 font-mono text-xs">TRU-608-AUTH-SECURE</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm mb-6">Confidentiality Notice: Information on this dashboard is for authorized True608 Intelligence personnel only.</p>
          <button className="text-xs font-bold text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center mx-auto gap-2" onClick={() => window.location.href = 'mailto:hq@true608.com'}>
            Technical Support <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;