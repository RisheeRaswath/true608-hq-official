import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EPAStatusBar } from "@/components/EPAStatusBar";
import { DoomsdayClock } from "@/components/DoomsdayClock";
import { JobLogger } from "@/components/JobLogger";
import { IntelligenceFeed } from "@/components/IntelligenceFeed";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "SESSION TERMINATED",
      description: "You have been securely logged out",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-radioactive text-xl"
        >
          INITIALIZING SYSTEM...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EPAStatusBar />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              <span className="text-radioactive">TRUE608</span>{" "}
              <span className="text-foreground">INTELLIGENCE</span>
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-terminal border border-border text-xs">
              <Shield className="w-3 h-3 text-radioactive" />
              <span className="text-radioactive">CLEARANCE: ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            COMMAND CENTER
          </h2>
          <p className="text-muted-foreground text-sm">
            Real-time compliance monitoring and asset tracking
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Doomsday Clock - Takes full width on mobile */}
          <div className="md:col-span-2 lg:col-span-2">
            <DoomsdayClock />
          </div>

          {/* Intelligence Feed */}
          <div className="row-span-2">
            <IntelligenceFeed />
          </div>

          {/* Job Logger - Most prominent on mobile */}
          <div className="md:col-span-2 lg:col-span-2 order-first md:order-none">
            <JobLogger />
          </div>
        </div>

        {/* System Status Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-terminal border border-border"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-radioactive rounded-full animate-pulse" />
                SYSTEM ONLINE
              </span>
              <span>UPTIME: 99.99%</span>
              <span>LATENCY: 12ms</span>
            </div>
            <span>
              LAST SYNC: {new Date().toLocaleTimeString()} UTC
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
