import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EPAStatusBar } from "@/components/EPAStatusBar";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "ERROR",
        description: "Email address required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setIsSent(true);
      toast({
        title: "ACCESS LINK TRANSMITTED",
        description: "Check your email for the secure access link",
      });
    } catch (error: any) {
      toast({
        title: "TRANSMISSION FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background terminal-grid">
      <EPAStatusBar />

      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-terminal border border-border mb-6"
            >
              <Terminal className="w-4 h-4 text-radioactive" />
              <span className="text-xs text-muted-foreground tracking-widest">
                SECURE ACCESS TERMINAL
              </span>
            </motion.div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              ACCESS TERMINAL
            </h1>
            <p className="text-muted-foreground text-sm">
              Authenticate with Magic Link encryption
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-card border border-border p-8 relative">
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-radioactive" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-radioactive" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-radioactive" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-radioactive" />

            {!isSent ? (
              <form onSubmit={handleMagicLink} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    SECURE EMAIL ADDRESS
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@company.com"
                    className="bg-void border-border text-foreground placeholder:text-muted-foreground h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-radioactive text-primary-foreground hover:bg-radioactive/90 font-bold py-6 text-lg glow-radioactive"
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 animate-spin" />
                      AUTHENTICATING...
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ACCESS TERMINAL
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                  <Lock className="w-3 h-3" />
                  <span>END-TO-END ENCRYPTED</span>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-radioactive/20 border border-radioactive rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-radioactive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  CHECK YOUR INBOX
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  We've sent a secure access link to
                  <br />
                  <span className="text-radioactive">{email}</span>
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Try different email
                </Button>
              </motion.div>
            )}
          </div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-terminal border border-border"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-bold text-foreground mb-1">
                  SECURITY NOTICE
                </p>
                <p>
                  This system is for authorized personnel only. All access
                  attempts are logged and monitored. Unauthorized access is
                  prohibited under 18 U.S.C. § 1030.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
