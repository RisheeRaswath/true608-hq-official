import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Mic, Lock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const JobLogger = () => {
  const [technicianId, setTechnicianId] = useState("");
  const [gasType, setGasType] = useState("");
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate encryption animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsEncrypted(true);
    toast({
      title: "LOG ENCRYPTED",
      description: "Record secured with AES-256 encryption",
    });

    // Reset after showing success
    setTimeout(() => {
      setIsEncrypted(false);
      setTechnicianId("");
      setGasType("");
      setWeight("");
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card border border-border p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-radioactive" />
        <span className="text-xs text-muted-foreground tracking-widest">
          MODULE_02
        </span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
        <Lock className="w-4 h-4 text-radioactive" />
        THE SHIELD
      </h3>

      <p className="text-xs text-muted-foreground mb-6">ENCRYPTED JOB LOGGER</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">TECHNICIAN ID</label>
          <Input
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
            placeholder="TECH-001"
            className="bg-void border-border text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">GAS TYPE</label>
          <Select value={gasType} onValueChange={setGasType} required>
            <SelectTrigger className="bg-void border-border text-foreground">
              <SelectValue placeholder="Select refrigerant" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="r410a">R-410A</SelectItem>
              <SelectItem value="r22">R-22</SelectItem>
              <SelectItem value="r134a">R-134A</SelectItem>
              <SelectItem value="r407c">R-407C</SelectItem>
              <SelectItem value="r32">R-32</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">WEIGHT (lbs)</label>
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.00"
            className="bg-void border-border text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>

        {/* Voice Note Button (Visual Only) */}
        <Button
          type="button"
          variant="outline"
          className="w-full border-border text-muted-foreground hover:text-foreground hover:border-radioactive"
          disabled
        >
          <Mic className="w-4 h-4 mr-2" />
          VOICE NOTE (COMING SOON)
        </Button>

        {/* Submit Button */}
        <motion.div
          animate={isEncrypted ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-6 text-lg font-bold ${
              isEncrypted
                ? "bg-radioactive text-primary-foreground glow-radioactive"
                : "bg-radioactive text-primary-foreground hover:bg-radioactive/90"
            }`}
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4 animate-spin" />
                ENCRYPTING...
              </motion.span>
            ) : isEncrypted ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                ENCRYPTED
              </span>
            ) : (
              "ENCRYPT LOG"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
