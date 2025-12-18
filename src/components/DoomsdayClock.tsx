import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

export const DoomsdayClock = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2026-01-01T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-void border border-defcon px-4 py-3 min-w-[70px]"
      >
        <span className="text-3xl font-bold text-defcon text-glow-defcon">
          {value.toString().padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-[10px] text-muted-foreground mt-1 tracking-widest">
        {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-defcon" />
        <span className="text-xs text-muted-foreground tracking-widest">
          MODULE_01
        </span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-defcon animate-pulse" />
        THE DOOMSDAY CLOCK
      </h3>

      <p className="text-xs text-muted-foreground mb-6">
        MANDATORY ASSET TRACKING ENFORCEMENT
      </p>

      {/* Countdown */}
      <div className="flex justify-center gap-2 mb-4">
        <TimeBlock value={timeLeft.days} label="DAYS" />
        <span className="text-defcon text-2xl self-start mt-3">:</span>
        <TimeBlock value={timeLeft.hours} label="HRS" />
        <span className="text-defcon text-2xl self-start mt-3">:</span>
        <TimeBlock value={timeLeft.minutes} label="MIN" />
        <span className="text-defcon text-2xl self-start mt-3">:</span>
        <TimeBlock value={timeLeft.seconds} label="SEC" />
      </div>

      {/* Target Date */}
      <div className="text-center">
        <span className="text-xs text-defcon tracking-widest">
          JAN 01, 2026 • 00:00:00 UTC
        </span>
      </div>
    </motion.div>
  );
};
