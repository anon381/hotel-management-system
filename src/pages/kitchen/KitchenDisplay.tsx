import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, Flame, AlertTriangle, Volume2, VolumeX, Maximize, ChefHat, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface DisplayOrder {
  id: string;
  table: string;
  items: { name: string; qty: number; done: boolean }[];
  status: "queue" | "preparing" | "ready";
  placedAt: number;
  estimatedMin: number;
  priority: "high" | "medium" | "low";
}

const now = Date.now();
const initialOrders: DisplayOrder[] = [
  { id: "#1024", table: "T-05", items: [{ name: "Grilled Salmon", qty: 1, done: false }, { name: "Caesar Salad", qty: 1, done: false }], status: "preparing", placedAt: now - 3 * 60000, estimatedMin: 15, priority: "high" },
  { id: "#1025", table: "T-02", items: [{ name: "Wagyu Steak", qty: 1, done: false }, { name: "Truffle Fries", qty: 1, done: false }], status: "preparing", placedAt: now - 1 * 60000, estimatedMin: 25, priority: "high" },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza", qty: 2, done: false }, { name: "Tiramisu", qty: 1, done: false }], status: "queue", placedAt: now - 5 * 60000, estimatedMin: 20, priority: "medium" },
  { id: "#1021", table: "T-08", items: [{ name: "Pasta Carbonara", qty: 1, done: false }], status: "queue", placedAt: now - 8 * 60000, estimatedMin: 12, priority: "low" },
  { id: "#1026", table: "T-10", items: [{ name: "Fish & Chips", qty: 2, done: true }], status: "ready", placedAt: now - 10 * 60000, estimatedMin: 10, priority: "medium" },
  { id: "#1027", table: "T-03", items: [{ name: "Sushi Platter", qty: 1, done: false }, { name: "Miso Soup", qty: 2, done: true }], status: "preparing", placedAt: now - 7 * 60000, estimatedMin: 25, priority: "medium" },
];

const priorityBorder: Record<string, string> = {
  high: "border-l-4 border-l-destructive",
  medium: "border-l-4 border-l-warning",
  low: "border-l-4 border-l-border",
};

function LiveTimer({ placedAt, estimatedMin }: { placedAt: number; estimatedMin: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Math.floor((Date.now() - placedAt) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [placedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const exceeds = mins >= estimatedMin;
  const pct = Math.min((mins / estimatedMin) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div className={`h-full rounded-full ${exceeds ? "bg-destructive animate-pulse" : pct > 80 ? "bg-warning" : "bg-success"}`} animate={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-mono font-bold whitespace-nowrap ${exceeds ? "text-destructive" : "text-foreground"}`}>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        {exceeds && <AlertTriangle className="inline w-3.5 h-3.5 ml-1" />}
      </span>
    </div>
  );
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<DisplayOrder[]>(initialOrders);
  const [soundOn, setSoundOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleItem = (orderId: string, idx: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const items = o.items.map((it, i) => i === idx ? { ...it, done: !it.done } : it);
      const allDone = items.every(it => it.done);
      return { ...o, items, status: allDone ? "ready" : o.status };
    }));
  };

  const markReady = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "ready", items: o.items.map(it => ({ ...it, done: true })) } : o));
  };

  const dismiss = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const queueOrders = orders.filter(o => o.status === "queue");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready");

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Kitchen Display</h1>
            <p className="text-xs text-muted-foreground">{orders.length} active orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundOn(!soundOn)} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={toggleFullscreen} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "Queue", icon: Clock, list: queueOrders, color: "text-warning", onAction: (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "preparing" } : o)), actionLabel: "Start" },
          { title: "Preparing", icon: Flame, list: preparingOrders, color: "text-primary", onAction: markReady, actionLabel: "Ready" },
          { title: "Ready", icon: Check, list: readyOrders, color: "text-success", onAction: dismiss, actionLabel: "Dismiss" },
        ].map(col => (
          <div key={col.title}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <col.icon className={`w-5 h-5 ${col.color}`} />
              <h2 className="font-display font-bold text-lg">{col.title}</h2>
              <span className="ml-auto text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{col.list.length}</span>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {col.list.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 50 }}
                    className={`rounded-xl bg-card border border-border p-4 shadow-sm ${priorityBorder[order.priority]}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{order.id}</span>
                        <span className="text-sm text-muted-foreground">· {order.table}</span>
                      </div>
                      {order.priority === "high" && <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full animate-pulse">RUSH</span>}
                    </div>

                    <LiveTimer placedAt={order.placedAt} estimatedMin={order.estimatedMin} />

                    <div className="mt-3 space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button onClick={() => toggleItem(order.id, idx)} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${it.done ? "bg-success border-success" : "border-border hover:border-primary"}`}>
                            {it.done && <Check className="w-3 h-3 text-success-foreground" />}
                          </button>
                          <span className={`text-sm ${it.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>{it.qty}x {it.name}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => col.onAction(order.id)}
                      className="mt-3 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
                    >
                      {col.actionLabel}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {col.list.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No orders</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
