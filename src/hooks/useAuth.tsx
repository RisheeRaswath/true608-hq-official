import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) fetchUserRole(session.user.id);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch role from profiles table - always fetch latest to ensure session sync
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Set role if found, otherwise default to 'technician' for security
      if (data && data.role) {
        const normalizedRole = (data.role as string).toLowerCase();
        setRole(normalizedRole);
      } else {
        setRole('technician'); // Default to most restrictive role
      }
    } catch (err) {
      console.error("Role fetch error:", err);
      setRole('technician'); // Default to most restrictive role for security
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    toast({
      title: "Session Ended",
      description: "You have been securely signed out.",
    });
  };

  return { session, user, loading, role, signOut };
};