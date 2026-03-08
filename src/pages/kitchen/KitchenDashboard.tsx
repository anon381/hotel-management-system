import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, AlertTriangle, CheckCircle2, Flame, Timer } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

const orders = [
  { id: "#1024", table: "T-05", items: [{ name: "Grilled Salmon", qty: 1, notes: "No lemon" }, { name: "Caesar Salad", qty: 1, notes: "" }], priority: "high", status: "preparing", time: "2 min ago" },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza", qty: 2, notes: "Extra cheese" }, { name: "Tiramisu", qty: 1, notes: "" }], priority: "medium", status: "queue", time: "5 min ago" },
  { id: "#1021", table: "T-08", items: [{ name: "Pasta Carbonara", qty: 1, notes: "Al dente" }], priority: "low", status: "queue", time: "8 min ago" },
  { id: "#1025", table: "T-02", items: [{ name: "Wagyu Steak", qty: 1, notes: "Medium rare" }, { name: "Truffle Fries", qty: 1, notes: "" }], priority: "high", status: "preparing", time: "1 min ago" },
  { id: "#1026", table: "T-10", items: [{ name: "Fish & Chips", qty: 2, notes: "" }], priority: "medium", status: "ready", time: "10 min ago" },
];

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  queue: { label: "In Queue", color: "bg-warning/10 text-warning" },
  preparing: { label: "Preparing", color: "bg-info/10 text-info" },
  ready: { label: "Ready", color: "bg-success/10 text-success" },
};

export default function KitchenDashboard() {
  const [orderList, setOrderList] = useState(orders);

  const updateStatus = (id: string, newStatus: string) => {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const queueOrders = orderList.filter(o => o.status === "queue");
  const preparingOrders = orderList.filter(o => o.status === "preparing");
  const readyOrders = orderList.filter(o => o.status === "ready");

  return (
    <KitchenLayout>
      <PageHeader title="Kitchen Dashboard" subtitle="Manage incoming orders and preparation." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ChefHat} title="In Queue" value={String(queueOrders.length)} change="Waiting" changeType="neutral" delay={0} />
        <StatCard icon={Flame} title="Preparing" value={String(preparingOrders.length)} change="Active" changeType="positive" delay={0.1} />
        <StatCard icon={CheckCircle2} title="Ready" value={String(readyOrders.length)} change="Pickup" changeType="positive" delay={0.2} />
        <StatCard icon={Timer} title="Avg. Prep Time" value="~12m" change="On track" changeType="neutral" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Queue", icon: Clock, list: queueOrders, nextStatus: "preparing", nextLabel: "Start Preparing" },
          { title: "Preparing", icon: Flame, list: preparingOrders, nextStatus: "ready", nextLabel: "Mark Ready" },
          { title: "Ready for Pickup", icon: CheckCircle2, list: readyOrders, nextStatus: null, nextLabel: null },
        ].map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-4">
              <col.icon className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg text-foreground">{col.title}</h2>
              <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{col.list.length}</span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {col.list.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card-elevated p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{order.id}</span>
                        <span className="text-xs text-muted-foreground">· {order.table}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityColors[order.priority]}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{it.qty}x {it.name}</span>
                          {it.notes && <span className="text-[11px] text-warning italic">{it.notes}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{order.time}</span>
                      {col.nextStatus && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateStatus(order.id, col.nextStatus!)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
                        >
                          {col.nextLabel}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {col.list.length === 0 && (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">No orders</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </KitchenLayout>
  );
}
