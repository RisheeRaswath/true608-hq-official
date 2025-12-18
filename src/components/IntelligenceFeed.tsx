import { motion } from "framer-motion";
import { Radio, AlertCircle, TrendingUp, FileWarning } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "regulatory",
    icon: FileWarning,
    title: "EPA R-410A Phase Down: Step 2 Initiated",
    timestamp: "2 hours ago",
    severity: "high",
  },
  {
    id: 2,
    type: "market",
    icon: TrendingUp,
    title: "Price Alert: R-22 up 4.5% in Midwest Market",
    timestamp: "6 hours ago",
    severity: "medium",
  },
  {
    id: 3,
    type: "enforcement",
    icon: AlertCircle,
    title: "Enforcement Update: Residential Audits Increased in FL/TX",
    timestamp: "1 day ago",
    severity: "critical",
  },
];

const severityColors = {
  critical: "border-defcon text-defcon",
  high: "border-warning text-warning",
  medium: "border-radioactive text-radioactive",
};

export const IntelligenceFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-4 h-4 text-signal animate-pulse" />
        <span className="text-xs text-muted-foreground tracking-widest">
          MODULE_03
        </span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
        <Radio className="w-4 h-4 text-signal" />
        INTELLIGENCE FEED
      </h3>

      <p className="text-xs text-muted-foreground mb-6">
        REAL-TIME REGULATORY MONITORING
      </p>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          const colorClass =
            severityColors[alert.severity as keyof typeof severityColors];

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`bg-void border-l-2 ${colorClass.split(" ")[0]} p-4`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-4 h-4 mt-0.5 ${colorClass.split(" ")[1]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-tight">
                    {alert.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 bg-radioactive rounded-full animate-pulse" />
        <span>LIVE MONITORING ACTIVE</span>
      </div>
    </motion.div>
  );
};
