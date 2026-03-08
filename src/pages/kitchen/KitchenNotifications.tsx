import { motion } from "framer-motion";
import { Bell, ShoppingCart, AlertTriangle, CheckCircle2 } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";

const notifications = [
  { icon: ShoppingCart, title: "New order #1027 received — T-06", time: "Just now", read: false },
  { icon: ShoppingCart, title: "New order #1026 received — T-10", time: "5 min ago", read: false },
  { icon: AlertTriangle, title: "Low stock: Wagyu Beef (2 kg left)", time: "15 min ago", read: false },
  { icon: CheckCircle2, title: "Order #1020 picked up by server", time: "30 min ago", read: true },
  { icon: AlertTriangle, title: "Low stock: Truffle Oil (1 bottle left)", time: "1 hour ago", read: true },
];

export default function KitchenNotifications() {
  return (
    <KitchenLayout>
      <PageHeader title="Notifications" subtitle="Kitchen alerts and updates" />
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card p-4 flex items-start gap-3 overflow-hidden ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm break-words ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
          </motion.div>
        ))}
      </div>
    </KitchenLayout>
  );
}