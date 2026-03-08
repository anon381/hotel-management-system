import { motion } from "framer-motion";
import { Bell, CheckCircle2, Gift, ShoppingCart } from "lucide-react";
import { CustomerLayout } from "@/components/CustomerLayout";
import { PageHeader } from "@/components/PageHeader";

const notifications = [
  { icon: ShoppingCart, title: "Order #1024 is being prepared", time: "2 min ago", read: false },
  { icon: CheckCircle2, title: "Order #1020 completed", time: "1 hour ago", read: false },
  { icon: Gift, title: "You earned 50 reward points!", time: "3 hours ago", read: true },
  { icon: Bell, title: "New seasonal menu items available", time: "Yesterday", read: true },
  { icon: Gift, title: "Welcome bonus: 200 points added", time: "2 days ago", read: true },
];

export default function CustomerNotifications() {
  return (
    <CustomerLayout>
      <PageHeader title="Notifications" subtitle="Stay updated on your orders and rewards" />
      <div className="space-y-3 max-w-2xl">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`glass-card p-4 flex items-center gap-4 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.time}</p>
            </div>
            {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}
