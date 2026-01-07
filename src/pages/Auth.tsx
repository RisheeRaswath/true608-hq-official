import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const redirectAttempted = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let overrideTimeoutId: NodeJS.Timeout;

    // Show override button after 3 seconds
    overrideTimeoutId = setTimeout(() => {
      if (isMounted && isInitializing) {
        setShowOverride(true);
      }
    }, 3000);

    const checkAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          clearTimeout(overrideTimeoutId);
          if (isMounted) {
            setIsInitializing(false);
            setShowForm(true);
          }
          return;
        }

        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        clearTimeout(overrideTimeoutId);

        if (error || !profile) {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/field-shield/scan');
          }
          return;
        }

        const role = (profile.role || 'tech') as string;
        const normalizedRole = role.toLowerCase();

        if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/dashboard');
          }
        } else {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/field-shield/scan');
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        clearTimeout(overrideTimeoutId);
        if (isMounted) {
          setIsInitializing(false);
          setShowForm(true);
        }
      }
    };

    checkAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        if (isMounted) {
          setIsInitializing(false);
          setShowForm(true);
        }
        return;
      }

      try {
        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/field-shield/scan');
          }
          return;
        }

        const role = (profile.role || 'tech') as string;
        const normalizedRole = role.toLowerCase();

        if (normalizedRole === 'super_admin' || normalizedRole === 'superadmin') {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/dashboard');
          }
        } else {
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            window.location.replace('/app/field-shield/scan');
          }
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        if (!redirectAttempted.current) {
          redirectAttempted.current = true;
          window.location.replace('/app/field-shield/scan');
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearTimeout(overrideTimeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    redirectAttempted.current = false;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { full_name: fullName } } 
        });
        if (error) throw error;
        toast({ title: "ACCOUNT CREATED", description: "CHECK EMAIL FOR ACCESS LINK." });
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast({ title: "SECURITY ALERT", description: err.message.toUpperCase(), variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const handleOverride = () => {
    window.location.replace('/app/dashboard');
  };

  if (isInitializing || !showForm) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#F97316] animate-spin" />
          <p className="text-[#F97316] font-black tracking-wide uppercase text-sm">INITIALIZING VAULT...</p>
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

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-[#F97316]/30">
      <button
        onClick={() => window.location.href = "/"}
        className="absolute top-8 left-8 px-3 py-2 bg-card border border-[#F97316] rounded text-sm font-medium text-[#F97316] hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> RETURN TO HQ
      </button>

      <div className="flex items-center gap-3 mb-8">
        <img 
          src="/logo-shield.PNG" 
          alt="True608" 
          className="h-12 w-auto object-contain" 
        />
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white">
            TRUE<span className="text-[#F97316]">608</span>
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Intelligence</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            {isLogin ? 'OPERATOR LOGIN' : 'CREATE ACCOUNT'}
          </h2>
          <div className="w-12 h-1 bg-[#F97316] mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Full Name</Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-black border-zinc-800 text-white rounded-none h-12"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Personnel Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-zinc-800 text-white rounded-none h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Access Cipher</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black border-zinc-800 text-white rounded-none h-12"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full !bg-[#F97316] !hover:bg-[#F97316] hover:!text-black focus:!bg-[#F97316] focus:!text-black active:!bg-[#F97316] active:!text-black !text-black font-black h-14 rounded-none transition-all tracking-widest disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'PROCESSING...' : isLogin ? 'LOGIN' : 'INITIALIZE'}
          </Button>
        </form>

        <div className="border-t border-zinc-900 pt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-[10px] font-black text-zinc-500 hover:text-[#F97316] uppercase tracking-widest transition-colors"
          >
            {isLogin ? "NEW OPERATOR? REGISTER" : 'EXISTING PERSONNEL? LOGIN'}
          </button>
        </div>
      </div>

      <p className="mt-8 text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
        EPA AIM Act 2026 Compliant • 40 CFR Part 84
      </p>
    </div>
  );
};

export default Auth;
