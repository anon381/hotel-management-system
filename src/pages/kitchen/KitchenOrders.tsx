import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UtensilsCrossed, Check, ChefHat, CheckCircle2, Filter } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";

interface KitchenOrder {
  id: string;
  table: string;
  items: { name: string; done: boolean }[];
  status: "Queue" | "Preparing" | "Ready" | "Completed";
  time: string;
  priority: string;
}

const initialOrders: KitchenOrder[] = [
  { id: "#1024", table: "T-05", items: [{ name: "Grilled Salmon", done: false }, { name: "Caesar Salad", done: false }], status: "Preparing", time: "12:30 PM", priority: "high" },
  { id: "#1025", table: "T-02", items: [{ name: "Wagyu Steak", done: false }, { name: "Truffle Fries", done: false }], status: "Preparing", time: "12:32 PM", priority: "high" },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza x2", done: false }, { name: "Tiramisu", done: false }], status: "Queue", time: "12:28 PM", priority: "medium" },
  { id: "#1021", table: "T-08", items: [{ name: "Pasta Carbonara", done: false }], status: "Queue", time: "12:25 PM", priority: "low" },
  { id: "#1026", table: "T-10", items: [{ name: "Fish & Chips x2", done: true }], status: "Ready", time: "12:20 PM", priority: "medium" },
  { id: "#1020", table: "T-01", items: [{ name: "Burger Deluxe", done: true }, { name: "Fries", done: true }], status: "Completed", time: "12:10 PM", priority: "low" },
];

const statusColors: Record<string, string> = {
  Queue: "bg-warning/10 text-warning",
  Preparing: "bg-info/10 text-info",
  Ready: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

const statusOrder: KitchenOrder["status"][] = ["Queue", "Preparing", "Ready", "Completed"];

export default function KitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const toggleItemDone = (orderId: string, itemIdx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItems = o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
      return { ...o, items: newItems };
    }));
  };

  const advanceStatus = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const idx = statusOrder.indexOf(o.status);
      if (idx < statusOrder.length - 1) {
        const next = statusOrder[idx + 1];
        return { ...o, status: next, items: next === "Completed" ? o.items.map(it => ({ ...it, done: true })) : o.items };
      }
      return o;
    }));
  };

  const markAllDone = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map(it => ({ ...it, done: true })), status: "Ready" };
    }));
  };

  const filtered = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <KitchenLayout>
      <PageHeader title="All Orders" subtitle="Complete order list — mark items done, advance status" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {["All", ...statusOrder].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((order, i) => {
            const doneCount = order.items.filter(it => it.done).length;
            const allDone = doneCount === order.items.length;
            const nextStatus = statusOrder[statusOrder.indexOf(order.status) + 1];
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-elevated p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Order info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-foreground">{order.id} · {order.table}</p>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                        {order.priority === "high" && (
                          <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">RUSH</span>
                        )}
                      </div>

                      {/* Items with checkboxes */}
                      <div className="space-y-1.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              onClick={() => toggleItemDone(order.id, idx)}
                              disabled={order.status === "Completed"}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                it.done
                                  ? "bg-success border-success text-success-foreground"
                                  : "border-border hover:border-primary"
                              } disabled:opacity-50`}
                            >
                              {it.done && <Check className="w-3 h-3" />}
                            </button>
                            <span className={`text-sm ${it.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {it.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Progress */}
                      {order.status !== "Completed" && order.items.length > 1 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-[120px]">
                            <motion.div
                              className="h-full rounded-full bg-primary"
                              animate={{ width: `${(doneCount / order.items.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{doneCount}/{order.items.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{order.time}
                    </span>
                    <div className="flex items-center gap-2">
                      {order.status !== "Completed" && order.status !== "Ready" && !allDone && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => markAllDone(order.id)}
                          className="text-[11px] font-semibold bg-success/10 text-success px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> All Done
                        </motion.button>
                      )}
                      {nextStatus && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => advanceStatus(order.id)}
                          className="text-[11px] font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-lg flex items-center gap-1"
                        >
                          <ChefHat className="w-3 h-3" /> → {nextStatus}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </KitchenLayout>
  );
}
