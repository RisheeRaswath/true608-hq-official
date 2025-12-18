import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Mail, ArrowRight, Shield, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [technicians, setTechnicians] = useState("");
  const [refrigerant, setRefrigerant] = useState("");
  const [email, setEmail] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [liability, setLiability] = useState(0);
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicians || !refrigerant) return;
    
    const calc = Number(technicians) * Number(refrigerant) * 26.73;
    setLiability(Math.floor(calc));
    setIsCalculated(true);
  };

  const handleReveal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsRevealed(true);
    toast({
      title: "Report Unlocked",
      description: "Your liability assessment is now visible.",
    });
  };

  const handleDownloadChecklist = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to receive the checklist.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Checklist Sent",
      description: "Check your inbox for the 2026 Audit Checklist PDF.",
    });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-semibold text-foreground tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">True608 Intelligence</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">
            EPA Compliance Standard 2026
          </span>
        </div>
      </header>

      {/* Countdown Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Mandatory Enforcement Begins In:</span>
            </div>
            <div className="flex items-center gap-6">
              <TimeBlock value={timeLeft.days} label="Days" />
              <span className="text-muted-foreground text-xl">:</span>
              <TimeBlock value={timeLeft.hours} label="Hours" />
              <span className="text-muted-foreground text-xl">:</span>
              <TimeBlock value={timeLeft.minutes} label="Min" />
              <span className="text-muted-foreground text-xl">:</span>
              <TimeBlock value={timeLeft.seconds} label="Sec" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Risk Assessment Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
                Calculate Your EPA Liability Risk
              </h1>
              <p className="text-muted-foreground">
                Enter your fleet details to estimate potential exposure under the AIM Act.
              </p>
            </div>

            {/* Risk Form */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
              <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Number of Technicians
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      value={technicians}
                      onChange={(e) => setTechnicians(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Annual Refrigerant Purchase (lbs)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={refrigerant}
                      onChange={(e) => setRefrigerant(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!technicians || !refrigerant}
                >
                  Calculate Liability
                </Button>
              </form>

              {/* Result Section */}
              {isCalculated && (
                <div className="mt-8 pt-8 border-t border-border">
                  {!isRevealed ? (
                    <div className="space-y-4">
                      <div className="relative bg-secondary rounded-lg p-8 text-center">
                        <div className="text-4xl font-bold text-muted-foreground blur-md select-none">
                          {formatCurrency(liability)}
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 rounded-lg">
                          <Lock className="w-6 h-6 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Enter your email to view your Liability Report
                          </p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleReveal} className="flex gap-3">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-secondary border-border flex-1"
                        />
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                          Reveal Report
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        Estimated Annual Liability
                      </p>
                      <div className="text-5xl md:text-6xl font-bold text-destructive">
                        {formatCurrency(liability)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Based on current EPA penalty structures under 40 CFR Part 84
                      </p>
                      <Button 
                        onClick={() => navigate("/auth")}
                        className="mt-4 bg-primary hover:bg-primary/90"
                      >
                        Start Tracking Compliance
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Lead Magnet Section */}
          <section>
            <div className="bg-card border border-border rounded-lg p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Download the 2026 Audit Checklist
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    The official manual worksheet for 40 CFR Part 84 compliance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!email && (
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary border-border flex-1"
                      />
                    )}
                    <Button 
                      onClick={handleDownloadChecklist}
                      variant="outline"
                      className="border-border hover:bg-secondary"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send PDF to Email
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 True608 Intelligence</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Enterprise Compliance Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                256-bit Encryption
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
