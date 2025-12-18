import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Users, Cylinder } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface RiskCalculatorProps {
  onAccessTerminal: () => void;
}

export const RiskCalculator = ({ onAccessTerminal }: RiskCalculatorProps) => {
  const [technicians, setTechnicians] = useState([5]);
  const [gasPurchased, setGasPurchased] = useState([500]);
  const [displayedLiability, setDisplayedLiability] = useState(0);

  // Calculate base liability
  const baseLiability = technicians[0] * gasPurchased[0] * 12.5;

  // Aggressive counting animation
  useEffect(() => {
    const target = baseLiability;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(target, increment * step + Math.random() * 1000);
      setDisplayedLiability(Math.floor(current));

      if (step >= steps) {
        setDisplayedLiability(Math.floor(target));
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [baseLiability]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Main Card */}
      <div className="bg-card border border-border p-8 relative overflow-hidden">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-radioactive" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-radioactive" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-radioactive" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-radioactive" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-defcon" />
            <span className="text-xs text-muted-foreground tracking-widest">
              LIABILITY ASSESSMENT MODULE
            </span>
            <AlertTriangle className="w-5 h-5 text-defcon" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
            THE GHOST GAS GAP
          </h1>
          <p className="text-muted-foreground text-sm">
            Calculate your untracked refrigerant liability exposure
          </p>
        </div>

        {/* Sliders */}
        <div className="space-y-8 mb-8">
          {/* Technicians Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-radioactive" />
                <span className="text-sm text-foreground">TECHNICIANS</span>
              </div>
              <span className="text-radioactive font-bold text-lg">
                {technicians[0]}
              </span>
            </div>
            <Slider
              value={technicians}
              onValueChange={setTechnicians}
              max={50}
              min={1}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          {/* Gas Purchased Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cylinder className="w-4 h-4 text-radioactive" />
                <span className="text-sm text-foreground">
                  GAS PURCHASED (lbs/year)
                </span>
              </div>
              <span className="text-radioactive font-bold text-lg">
                {gasPurchased[0].toLocaleString()}
              </span>
            </div>
            <Slider
              value={gasPurchased}
              onValueChange={setGasPurchased}
              max={10000}
              min={100}
              step={100}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100 lbs</span>
              <span>10,000 lbs</span>
            </div>
          </div>
        </div>

        {/* Liability Result */}
        <motion.div
          className="bg-void border border-defcon p-6 mb-6 relative"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(255, 0, 0, 0.3)",
              "0 0 40px rgba(255, 0, 0, 0.5)",
              "0 0 20px rgba(255, 0, 0, 0.3)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-center">
            <span className="text-xs text-muted-foreground tracking-widest block mb-2">
              UNTRACKED LIABILITY
            </span>
            <motion.div
              key={displayedLiability}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-5xl md:text-6xl font-bold text-defcon glitch"
            >
              {formatCurrency(displayedLiability)}
            </motion.div>
            <span className="text-xs text-defcon/70 mt-2 block">
              ANNUAL PENALTY EXPOSURE
            </span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onAccessTerminal}
            className="w-full bg-radioactive text-primary-foreground hover:bg-radioactive/90 font-bold py-6 text-lg glow-radioactive"
          >
            ACCESS TERMINAL →
          </Button>
          <Button
            variant="outline"
            className="w-full border-border text-foreground hover:bg-secondary hover:text-foreground py-4"
          >
            Download Jan 1, 2026 Survival Protocol (PDF)
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
