import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="stat-card group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            changeType === "positive" ? "bg-success/10 text-success" :
            changeType === "negative" ? "bg-destructive/10 text-destructive" :
            "bg-muted text-muted-foreground"
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
    </motion.div>
  );
}
