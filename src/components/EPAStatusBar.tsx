import { motion } from "framer-motion";
import { Zap, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export const EPAStatusBar = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-terminal border-b border-border px-4 py-2"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-radioactive animate-pulse-glow" />
          <span className="text-radioactive font-medium">LIVE EPA SIGNAL:</span>
          <span className="text-muted-foreground">
            MONITORING FEDERAL REGISTER{dots}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-radioactive" />
          <span className="text-radioactive">[CONNECTION ACTIVE]</span>
        </div>
      </div>
    </motion.div>
  );
};
