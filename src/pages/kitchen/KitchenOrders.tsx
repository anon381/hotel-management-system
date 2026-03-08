import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UtensilsCrossed, Check, ChefHat, CheckCircle2, Filter, AlertTriangle } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";

interface KitchenOrder {
  id: string;
  table: string;
  items: { name: string; done: boolean }[];
  status: "Queue" | "Preparing" | "Ready" | "Completed";
  placedAt: number;
  estimatedMin: number | null;
  priority: string;
}

const now = Date.now();
const initialOrders: KitchenOrder[] = [
  { id: "#1024", table: "T-05", items: [{ name: "Grilled Salmon", done: false }, { name: "Caesar Salad", done: false }], status: "Preparing", placedAt: now - 3 * 60000, estimatedMin: 15, priority: "high" },
  { id: "#1025", table: "T-02", items: [{ name: "Wagyu Steak", done: false }, { name: "Truffle Fries", done: false }], status: "Preparing", placedAt: now - 1 * 60000, estimatedMin: 25, priority: "high" },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza x2", done: false }, { name: "Tiramisu", done: false }], status: "Queue", placedAt: now - 5 * 60000, estimatedMin: 20, priority: "medium" },
  { id: "#1021", table: "T-08", items: [{ name: "Pasta Carbonara", done: false }], status: "Queue", placedAt: now - 8 * 60000, estimatedMin: null, priority: "low" },
  { id: "#1026", table: "T-10", items: [{ name: "Fish & Chips x2", done: true }], status: "Ready", placedAt: now - 10 * 60000, estimatedMin: 10, priority: "medium" },
  { id: "#1020", table: "T-01", items: [{ name: "Burger Deluxe", done: true }, { name: "Fries", done: true }], status: "Completed", placedAt: now - 15 * 60000, estimatedMin: 12, priority: "low" },
];

const statusColors: Record<string, string> = {
  Queue: "bg-warning/10 text-warning",
  Preparing: "bg-info/10 text-info",
  Ready: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

const statusOrder: KitchenOrder["status"][] = ["Queue", "Preparing", "Ready", "Completed"];

function ElapsedBadge({ placedAt, estimatedMin }: { placedAt: number; estimatedMin: number | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - placedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [placedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const exceeds = estimatedMin !== null && mins >= estimatedMin;
  const nearLimit = estimatedMin !== null && mins >= estimatedMin * 0.8 && !exceeds;

  return (
    <span className={`text-xs font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg whitespace-nowrap ${
      exceeds ? "bg-destructive/15 text-destructive animate-pulse" : nearLimit ? "bg-warning/15 text-warning" : "text-muted-foreground"
    }`}>
      <Clock className="w-3 h-3 flex-shrink-0" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      {exceeds && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
    </span>
  );
}

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

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                className="glass-card-elevated p-4 overflow-hidden"
              >
                <div className="flex flex-col gap-3">
                  {/* Top: order info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">{order.id} · {order.table}</p>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusColors[order.status]}`}>{order.status}</span>
                        {order.priority === "high" && (
                          <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded whitespace-nowrap">RUSH</span>
                        )}
                        <ElapsedBadge placedAt={order.placedAt} estimatedMin={order.estimatedMin} />
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 min-w-0">
                            <button
                              onClick={() => toggleItemDone(order.id, idx)}
                              disabled={order.status === "Completed"}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                it.done ? "bg-success border-success text-success-foreground" : "border-border hover:border-primary"
                              } disabled:opacity-50`}
                            >
                              {it.done && <Check className="w-3 h-3" />}
                            </button>
                            <span className={`text-sm truncate ${it.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {it.name}
                            </span>
                          </div>
                        ))}
                      </div>

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

                  {/* Bottom: actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                    {order.estimatedMin !== null && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">ETA: {order.estimatedMin}m</span>
                    )}
                    <div className="flex items-center gap-2 ml-auto flex-wrap">
                      {order.status !== "Completed" && order.status !== "Ready" && !allDone && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => markAllDone(order.id)}
                          className="text-[11px] font-semibold bg-success/10 text-success px-2.5 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> All Done
                        </motion.button>
                      )}
                      {nextStatus && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => advanceStatus(order.id)}
                          className="text-[11px] font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap"
                        >
                          <ChefHat className="w-3 h-3 flex-shrink-0" /> → {nextStatus}
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