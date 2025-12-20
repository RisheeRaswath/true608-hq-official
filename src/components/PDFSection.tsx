import { useState } from "react";
import { FileText, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const PDFSection = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPDF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.from('leads').insert([{ email: email }]);
      if (error) throw error;

      toast({ title: "Protocol Initiated", description: "Downloading blueprint..." });

      const link = document.createElement("a");
      link.href = "/blueprint.pdf";
      link.download = "True608_Survival_Protocol_2026.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDialogOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Capture Failed:", error);
      toast({ title: "Connection Error", description: "Downloading anyway...", variant: "destructive" });
      const link = document.createElement("a");
      link.href = "/blueprint.pdf";
      link.download = "True608_Survival_Protocol_2026.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="compliance-manual" className="py-16 md:py-24 bg-slate-950 border-y border-red-900/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-red-800/50 rounded-2xl p-6 md:p-12 shadow-[0_0_50px_rgba(220,38,38,0.15)] text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 font-mono text-[10px] sm:text-xs mb-6 sm:mb-8">
              <ShieldAlert className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>FEDERAL COMPLIANCE WARNING</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              The Manual <br className="sm:hidden" /> "Hard Way" Protocol
            </h2>
            
            <p className="text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8">
              For firms choosing not to automate: Download the official <span className="text-slate-200 font-semibold">40 CFR Part 84 Survival Blueprint</span>.
            </p>

            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 sm:p-4 mb-8 sm:mb-10 max-w-lg mx-auto">
              <p className="text-red-400 font-bold text-xs sm:text-base flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                Liability: $44,539/day fine potential.
              </p>
            </div>

            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 font-bold py-6 sm:py-8 px-4 sm:px-10 text-sm sm:text-lg rounded-xl transition-all hover:scale-[1.02]"
              onClick={() => setIsDialogOpen(true)}
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-red-600 shrink-0" />
              <span className="truncate">DOWNLOAD SURVIVAL PDF</span>
            </Button>

            <p className="text-[10px] text-slate-500 mt-6 font-mono tracking-wide uppercase">
              Est. manual labor time: 4-6 hours/month
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] max-w-md bg-slate-900 border border-red-900/50 text-white p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Secure Protocol
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Enter email for the 2026 Audit Worksheet.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDownloadPDF} className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="technician@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-sm"
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6"
              disabled={isLoading}
            >
              {isLoading ? "Securing Data..." : "Send PDF to Email"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PDFSection;