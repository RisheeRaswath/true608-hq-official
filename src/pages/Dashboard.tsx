import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Radar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FieldShield from "@/components/FieldShield";
import ControlTower from "@/components/ControlTower";

type ViewMode = "selection" | "field" | "tower";

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("selection");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let overrideTimeoutId: NodeJS.Timeout;

    // Show override button after 3 seconds
    overrideTimeoutId = setTimeout(() => {
      if (isMounted && loading) {
        setShowOverride(true);
      }
    }, 3000);

    const checkUserAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          clearTimeout(overrideTimeoutId);
          window.location.replace("/app");
          return;
        }

        setUserEmail(session.user.email?.split("@")[0].toUpperCase() || "OPERATOR");

        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        clearTimeout(overrideTimeoutId);

        if (error) {
          console.error("Profile fetch error:", error);
          const role = (profile?.role || 'tech') as string;
          const normalizedRole = role.toLowerCase();
          if (normalizedRole !== 'super_admin' && normalizedRole !== 'superadmin') {
            window.location.replace("/app/field-shield/scan");
          } else {
            if (isMounted) {
              setUserRole(normalizedRole);
              setLoading(false);
            }
          }
          return;
        }

        if (!profile) {
          window.location.replace("/app/field-shield/scan");
          return;
        }

        const role = (profile.role || 'tech') as string;
        const normalizedRole = role.toLowerCase();

        // CRITICAL: super_admin ALWAYS gets dashboard access - NO REDIRECTS
        if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
          if (isMounted) {
            setUserRole(normalizedRole);
            setLoading(false);
          }
          return;
        }

        // If tech/technician, redirect to scan page
        if (normalizedRole === 'tech' || normalizedRole === 'technician') {
          window.location.replace("/app/field-shield/scan");
          return;
        }

        // admin and ceo can access dashboard
        const allowedRoles = ['admin', 'ceo'];
        if (allowedRoles.includes(normalizedRole)) {
          if (isMounted) {
            setUserRole(normalizedRole);
            setLoading(false);
          }
          return;
        }

        // Unknown role - redirect to scan
        window.location.replace("/app/field-shield/scan");
      } catch (err) {
        console.error("Auth check error:", err);
        clearTimeout(overrideTimeoutId);
        if (userRole === 'super_admin' || userRole === 'superadmin') {
          if (isMounted) {
            setLoading(false);
          }
        } else {
          window.location.replace("/app");
        }
      }
    };

    checkUserAndRole();

    return () => {
      isMounted = false;
      clearTimeout(overrideTimeoutId);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "TERMINATED", description: "Secure session ended." });
    window.location.replace("/");
  };

  const handleOverride = () => {
    window.location.replace('/app/dashboard');
  };

  // Show professional loading state with override button
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#F97316] animate-spin" />
          <p className="text-[#F97316] font-black tracking-wide uppercase text-sm">INITIALIZING CONTROL TOWER...</p>
        </div>
        
        {showOverride && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-8">
            <button
              onClick={handleOverride}
              className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black font-black text-2xl uppercase tracking-widest py-6 px-12 rounded-none border-4 border-black shadow-2xl transition-all hover:scale-105 active:scale-100"
            >
              OVERRIDE: ENTER CONTROL TOWER
            </button>
            <p className="text-white text-sm mt-4 opacity-75">Database response delayed. Force entry activated.</p>
          </div>
        )}
      </div>
    );
  }

  // super_admin, admin, and ceo can access dashboard - NO REDIRECTS
  const allowedRoles = ['admin', 'ceo', 'super_admin', 'superadmin'];
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#F97316] animate-spin" />
          <p className="text-[#F97316] font-black tracking-wide uppercase text-sm">VERIFYING ACCESS...</p>
        </div>
      </div>
    );
  }

  // Show selection cards
  if (viewMode === "selection") {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#F97316]/30">
        {/* FEDERAL COMPLIANCE VAULT HEADER */}
        <nav className="border-b border-white/10 bg-black p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-shield.PNG" 
              alt="True608" 
              className="h-10 w-auto object-contain" 
            />
            <h1 className="text-xl font-black tracking-wide text-white">True608 FEDERAL COMPLIANCE VAULT</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans"
          >
            EXIT VAULT
          </button>
        </nav>

        {/* SELECTION CARDS */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-12 border-l-8 border-[#F97316] pl-8">
            <p className="text-[#F97316] text-[10px] font-black uppercase tracking-[0.4em] mb-2">System Status: Active</p>
            <h1 className="text-5xl font-black tracking-wide uppercase">OPERATOR: {userEmail}</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* FIELD-SHIELD CARD */}
            <button
              onClick={() => setViewMode("field")}
              className="bg-zinc-950 border-2 border-[#F97316]/30 hover:border-[#F97316] p-12 text-left transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-[#F97316]/20 border-2 border-[#F97316]/40">
                  <Wrench className="w-12 h-12 text-[#F97316]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-wide uppercase text-white group-hover:text-[#F97316] transition-colors">
                    FIELD-SHIELD
                  </h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mt-1">
                    Mobile Compliance Scanner
                  </p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm">
                Log refrigerant usage in the field with GPS coordinates, timestamps, and scale photos. Federal compliance logging for technicians.
              </p>
            </button>

            {/* CONTROL TOWER CARD */}
            <button
              onClick={() => setViewMode("tower")}
              className="bg-zinc-950 border-2 border-[#F97316]/30 hover:border-[#F97316] p-12 text-left transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-[#F97316]/20 border-2 border-[#F97316]/40">
                  <Radar className="w-12 h-12 text-[#F97316]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-wide uppercase text-white group-hover:text-[#F97316] transition-colors">
                    CONTROL TOWER
                  </h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mt-1">
                    Fleet Intelligence Hub
                  </p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm">
                View compliance logs, fleet assets, generate EPA audit binders, and monitor federal compliance status across your entire operation.
              </p>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Show FieldShield or ControlTower based on selection
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#F97316]/30">
      <nav className="border-b border-white/10 bg-black p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/logo-shield.PNG" 
            alt="True608" 
            className="h-8 w-auto object-contain" 
          />
          <h1 className="text-xl font-black tracking-wide text-white">True608 FEDERAL COMPLIANCE VAULT</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("selection")}
            className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:border-[#F97316]/50 transition-colors font-sans"
          >
            ← BACK TO SELECTION
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-card border border-border rounded text-sm font-medium text-muted-foreground hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans"
          >
            EXIT VAULT
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {viewMode === "field" && <FieldShield onBack={() => setViewMode("selection")} />}
        {viewMode === "tower" && <ControlTower onBack={() => setViewMode("selection")} />}
      </main>
    </div>
  );
};

export default Dashboard;
