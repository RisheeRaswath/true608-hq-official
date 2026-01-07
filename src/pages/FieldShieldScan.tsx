import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import FieldShield from "@/components/FieldShield";
import { useToast } from "@/hooks/use-toast";

const FieldShieldScan = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          window.location.assign("/app");
          return;
        }

        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          setIsTechnician(true);
          setLoading(false);
          return;
        }

        const role = (profile.role || 'tech') as string;
        const normalizedRole = role.toLowerCase();
        
        // CRITICAL: If user is super_admin, redirect to dashboard immediately
        if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
          window.location.assign("/app/dashboard");
          return;
        }

        // If user is NOT a tech/technician, redirect them to dashboard
        if (normalizedRole !== 'tech' && normalizedRole !== 'technician') {
          window.location.assign("/app/dashboard");
          return;
        }

        setIsTechnician(true);
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setIsTechnician(true);
        setLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "SESSION TERMINATED", description: "Secure session ended." });
    window.location.assign("/app");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#F97316] animate-spin" />
          <p className="text-[#F97316] font-black tracking-wide uppercase text-sm">INITIALIZING SCANNER...</p>
        </div>
      </div>
    );
  }

  if (!isTechnician) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#F97316] animate-spin" />
          <p className="text-[#F97316] font-black tracking-wide uppercase text-sm">REDIRECTING...</p>
        </div>
      </div>
    );
  }

  return <FieldShield onBack={undefined} onSignOut={handleSignOut} isTechnician={true} />;
};

export default FieldShieldScan;
