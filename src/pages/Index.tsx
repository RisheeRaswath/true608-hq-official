import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EPAStatusBar } from "@/components/EPAStatusBar";
import { RiskCalculator } from "@/components/RiskCalculator";
import { TypingText } from "@/components/TypingText";

const Index = () => {
  const navigate = useNavigate();

  const handleAccessTerminal = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background terminal-grid">
      {/* EPA Status Bar */}
      <EPAStatusBar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal border border-border mb-6">
            <span className="w-2 h-2 bg-radioactive rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground tracking-widest">
              SYSTEM STATUS: OPERATIONAL
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tighter">
            <span className="text-radioactive text-glow-radioactive">TRUE608</span>{" "}
            INTELLIGENCE
          </h1>

          <div className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            <TypingText
              text="Military-Grade EPA Compliance Tracking System"
              delay={0.5}
            />
          </div>
        </motion.div>

        {/* Risk Calculator */}
        <RiskCalculator onAccessTerminal={handleAccessTerminal} />

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-radioactive rounded-full" />
              AES-256 ENCRYPTION
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-radioactive rounded-full" />
              SOC 2 COMPLIANT
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-radioactive rounded-full" />
              24/7 MONITORING
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground">
            © 2024 TRUE608 INTELLIGENCE • CLASSIFIED INFRASTRUCTURE •
            UNAUTHORIZED ACCESS PROHIBITED
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
