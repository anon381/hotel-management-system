import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, CheckCircle2, Flame, Timer, Check, Minus, Plus, AlertTriangle } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";

interface OrderItem {
  name: string;
  qty: number;
  notes: string;
  done: boolean;
}

interface Order {
  id: string;
  table: string;
  items: OrderItem[];
  priority: "high" | "medium" | "low";
  status: string;
  placedAt: number; // timestamp ms
  estimatedMin: number | null;
}

const now = Date.now();
const initialOrders: Order[] = [
  { id: "#1024", table: "T-05", items: [{ name: "Grilled Salmon", qty: 1, notes: "No lemon", done: false }, { name: "Caesar Salad", qty: 1, notes: "", done: false }], priority: "high", status: "preparing", placedAt: now - 2 * 60000, estimatedMin: 15 },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza", qty: 2, notes: "Extra cheese", done: false }, { name: "Tiramisu", qty: 1, notes: "", done: false }], priority: "medium", status: "queue", placedAt: now - 5 * 60000, estimatedMin: 20 },
  { id: "#1021", table: "T-08", items: [{ name: "Pasta Carbonara", qty: 1, notes: "Al dente", done: false }], priority: "low", status: "queue", placedAt: now - 8 * 60000, estimatedMin: null },
  { id: "#1025", table: "T-02", items: [{ name: "Wagyu Steak", qty: 1, notes: "Medium rare", done: false }, { name: "Truffle Fries", qty: 1, notes: "", done: false }], priority: "high", status: "preparing", placedAt: now - 1 * 60000, estimatedMin: 25 },
  { id: "#1026", table: "T-10", items: [{ name: "Fish & Chips", qty: 2, notes: "", done: true }], priority: "medium", status: "ready", placedAt: now - 10 * 60000, estimatedMin: 10 },
];

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

function ElapsedTimer({ placedAt, estimatedMin }: { placedAt: number; estimatedMin: number | null }) {
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
    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-1 rounded-lg ${
      exceeds ? "bg-destructive/15 text-destructive animate-pulse" : nearLimit ? "bg-warning/15 text-warning" : "bg-muted/50 text-muted-foreground"
    }`}>
      <Clock className="w-3 h-3" />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
      {exceeds && <AlertTriangle className="w-3 h-3" />}
    </div>
  );
}

export default function KitchenDashboard() {
  const [orderList, setOrderList] = useState<Order[]>(initialOrders);

  const updateStatus = useCallback((id: string, newStatus: string) => {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, items: newStatus === "ready" ? o.items.map(it => ({ ...it, done: true })) : o.items } : o));
  }, []);

  const toggleItemDone = useCallback((orderId: string, itemIdx: number) => {
    setOrderList(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItems = o.items.map((it, i) => i === itemIdx ? { ...it, done: !it.done } : it);
      const allDone = newItems.every(it => it.done);
      return { ...o, items: newItems, status: allDone && o.status === "preparing" ? "ready" : o.status };
    }));
  }, []);

  const setEstimatedTime = useCallback((orderId: string, min: number) => {
    setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, estimatedMin: Math.max(0, min) } : o));
  }, []);

  const adjustTime = useCallback((orderId: string, delta: number) => {
    setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, estimatedMin: Math.max(0, (o.estimatedMin || 0) + delta) } : o));
  }, []);

  const queueOrders = orderList.filter(o => o.status === "queue");
  const preparingOrders = orderList.filter(o => o.status === "preparing");
  const readyOrders = orderList.filter(o => o.status === "ready");

  const completedItems = orderList.reduce((sum, o) => sum + o.items.filter(i => i.done).length, 0);
  const totalItems = orderList.reduce((sum, o) => sum + o.items.length, 0);

  return (
    <KitchenLayout>
      <PageHeader title="Kitchen Dashboard" subtitle="Manage incoming orders and preparation." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ChefHat} title="In Queue" value={String(queueOrders.length)} change="Waiting" changeType="neutral" delay={0} />
        <StatCard icon={Flame} title="Preparing" value={String(preparingOrders.length)} change="Active" changeType="positive" delay={0.1} />
        <StatCard icon={CheckCircle2} title="Ready" value={String(readyOrders.length)} change="Pickup" changeType="positive" delay={0.2} />
        <StatCard icon={Timer} title="Items Done" value={`${completedItems}/${totalItems}`} change={`${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}% complete`} changeType="positive" delay={0.3} />
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
                {col.list.map((order) => {
                  const doneCount = order.items.filter(i => i.done).length;
                  const progress = order.items.length > 0 ? (doneCount / order.items.length) * 100 : 0;
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card-elevated p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{order.id}</span>
                          <span className="text-xs text-muted-foreground">· {order.table}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ElapsedTimer placedAt={order.placedAt} estimatedMin={order.estimatedMin} />
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${priorityColors[order.priority]}`}>
                            {order.priority}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {order.status === "preparing" && (
                        <div className="w-full h-1.5 rounded-full bg-muted mb-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}

                      {/* Items with checkboxes */}
                      <div className="space-y-1.5 mb-3">
                        {order.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            {(order.status === "preparing" || order.status === "ready") && (
                              <button
                                onClick={() => toggleItemDone(order.id, i)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  it.done ? "bg-success border-success text-success-foreground" : "border-border hover:border-primary"
                                }`}
                              >
                                {it.done && <Check className="w-3 h-3" />}
                              </button>
                            )}
                            <span className={`flex-1 ${it.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {it.qty}x {it.name}
                            </span>
                            {it.notes && <span className="text-[11px] text-warning italic">{it.notes}</span>}
                          </div>
                        ))}
                      </div>

                      {/* Estimated time editor */}
                      {order.status !== "ready" && (
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                          <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">ETA:</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustTime(order.id, -5)} className="w-5 h-5 rounded bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors">
                              <Minus className="w-3 h-3 text-foreground" />
                            </button>
                            <span className="text-xs font-semibold text-foreground min-w-[32px] text-center">
                              {order.estimatedMin !== null ? `${order.estimatedMin}m` : "—"}
                            </span>
                            <button onClick={() => adjustTime(order.id, 5)} className="w-5 h-5 rounded bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors">
                              <Plus className="w-3 h-3 text-foreground" />
                            </button>
                          </div>
                          {[5, 10, 15, 20].map(t => (
                            <button
                              key={t}
                              onClick={() => setEstimatedTime(order.id, t)}
                              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                                order.estimatedMin === t ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {t}m
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <ElapsedTimer placedAt={order.placedAt} estimatedMin={null} />
                        <div className="flex items-center gap-2">
                          {order.status === "preparing" && doneCount === order.items.length && (
                            <span className="text-[10px] text-success font-semibold animate-pulse">All items done!</span>
                          )}
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
                      </div>
                    </motion.div>
                  );
                })}
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
