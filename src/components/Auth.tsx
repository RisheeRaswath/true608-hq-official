import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // THE NUCLEAR REDIRECT: Bypass React Router and force the subfolder
        window.location.replace("/app/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && data.session) {
            toast({ title: "IDENTITY VERIFIED", description: "ACCESS GRANTED. ENTERING MISSION CONTROL..." });
            window.location.replace("/app/dashboard");
        } else {
            toast({ title: "PROTOCOL INITIATED", description: "CHECK YOUR EMAIL TO VERIFY SYSTEM ACCESS." });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // THE NUCLEAR REDIRECT: Prevents jumping back to the HQ Marketing site
        window.location.replace("/app/dashboard");
      }
    } catch (error: any) {
      toast({ title: "SECURITY ALERT", description: error.message.toUpperCase(), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* TACTICAL HEADER */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => window.location.href = "/"} 
            className="px-3 py-2 bg-card border border-[#F97316] rounded text-sm font-medium text-[#F97316] hover:bg-[#F97316] hover:text-black hover:border-[#F97316] transition-colors font-sans flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO HQ
          </button>
        </div>
      </header>

      {/* INTELLIGENCE AUTH HUD */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-10 rounded-none shadow-[0_0_50px_rgba(0,0,0,1)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-none mb-6">
              <Shield className="w-8 h-8 text-[#2563EB]" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
              {isSignUp ? "INITIALIZE" : "AUTHENTICATE"}
            </h1>
            <div className="w-12 h-1 bg-[#2563EB] mx-auto mt-4 mb-2"></div>
            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em]">
              {isSignUp ? "SECURE FIRM REGISTRATION" : "ENCRYPTED VAULT ACCESS"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">PERSONNEL EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <Input
                  type="email"
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-zinc-800 focus:border-[#2563EB] text-white pl-10 h-12 rounded-none transition-all placeholder:text-zinc-800 placeholder:font-black uppercase text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">ACCESS CIPHER</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-zinc-800 focus:border-[#2563EB] text-white pl-10 h-12 rounded-none transition-all placeholder:text-zinc-800 text-xs font-bold"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#2563EB] hover:bg-white text-black font-black h-14 rounded-none transition-all active:scale-[0.98] flex items-center justify-center tracking-[0.2em] text-[11px]"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isSignUp ? "CREATE SECURE ACCOUNT" : "UNLOCK VAULT"
              )}
            </Button>
          </form>

          <div className="mt-10 text-center border-t border-zinc-900 pt-8">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[9px] font-black text-zinc-600 hover:text-[#2563EB] transition-colors uppercase tracking-[0.2em]"
            >
              {isSignUp ? "ALREADY REGISTERED? ACCESS SYSTEM" : "NEW FIRM? INITIALIZE COMPLIANCE ID"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;