import { motion } from "framer-motion";
import { Bell, ShoppingCart, ChefHat, Package, CreditCard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

interface Notification {
  id: number;
  type: "order" | "kitchen" | "inventory" | "payment";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  { id: 1, type: "order", title: "New Order #1028", message: "Table T-05 placed a new order — 3 items, $68.00", time: "Just now", read: false },
  { id: 2, type: "kitchen", title: "Order #1023 Ready", message: "Margherita Pizza and Tiramisu are ready to serve", time: "2 min ago", read: false },
  { id: 3, type: "inventory", title: "Low Stock Alert", message: "Wagyu Beef is critically low (2 kg remaining)", time: "10 min ago", read: false },
  { id: 4, type: "payment", title: "Payment Received", message: "TXN-001 — $65.00 via Card for Order #1022", time: "15 min ago", read: true },
  { id: 5, type: "order", title: "Order #1021 Confirmed", message: "Emma L. at Table T-08 — Grilled Salmon", time: "20 min ago", read: true },
  { id: 6, type: "inventory", title: "Fresh Basil Out of Stock", message: "Reorder required — last supplier: Herb Garden Co.", time: "30 min ago", read: true },
  { id: 7, type: "kitchen", title: "Rush Order #1026", message: "Table T-02 marked as RUSH — Truffle Pasta x2", time: "35 min ago", read: true },
  { id: 8, type: "payment", title: "Refund Processed", message: "TXN-005 — $34.00 refunded for Order #1015", time: "1 hour ago", read: true },
];

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  order: { icon: ShoppingCart, color: "bg-primary/10 text-primary" },
  kitchen: { icon: ChefHat, color: "bg-success/10 text-success" },
  inventory: { icon: Package, color: "bg-warning/10 text-warning" },
  payment: { icon: CreditCard, color: "bg-info/10 text-info" },
};

export default function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notifications`}
        actions={
          <motion.button whileTap={{ scale: 0.95 }} className="text-sm text-primary font-semibold hover:underline">
            Mark All Read
          </motion.button>
        }
      />

      <div className="max-w-3xl space-y-3">
        {notifications.map((notif, i) => {
          const cfg = typeConfig[notif.type];
          const NIcon = cfg.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
              className={`glass-card p-4 flex items-start gap-4 cursor-pointer transition-all ${!notif.read ? "border-l-4 border-l-primary" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                <NIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>{notif.title}</h3>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">{notif.time}</span>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
