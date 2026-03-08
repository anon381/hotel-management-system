import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Clock, AlertCircle, CheckCircle, Flame, Timer } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

type KitchenStatus = "Pending" | "Preparing" | "Ready";

interface KitchenOrder {
  id: string;
  table: string;
  items: { name: string; qty: number; special?: string }[];
  status: KitchenStatus;
  priority: "normal" | "rush";
  timeElapsed: string;
  orderedAt: string;
}

const kitchenOrders: KitchenOrder[] = [
  { id: "#1024", table: "T-05", items: [{ name: "Wagyu Steak", qty: 1, special: "Medium rare" }, { name: "Caesar Salad", qty: 1 }], status: "Preparing", priority: "rush", timeElapsed: "8m", orderedAt: "12:45 PM" },
  { id: "#1021", table: "T-08", items: [{ name: "Grilled Salmon", qty: 1, special: "No capers" }], status: "Pending", priority: "normal", timeElapsed: "2m", orderedAt: "12:50 PM" },
  { id: "#1023", table: "T-12", items: [{ name: "Margherita Pizza", qty: 2 }, { name: "Tiramisu", qty: 1 }], status: "Ready", priority: "normal", timeElapsed: "15m", orderedAt: "12:38 PM" },
  { id: "#1025", table: "T-10", items: [{ name: "Burger Deluxe", qty: 1 }, { name: "Spring Rolls", qty: 2 }], status: "Preparing", priority: "normal", timeElapsed: "5m", orderedAt: "12:47 PM" },
  { id: "#1026", table: "T-02", items: [{ name: "Truffle Pasta", qty: 2, special: "Extra truffle" }], status: "Pending", priority: "rush", timeElapsed: "1m", orderedAt: "12:51 PM" },
  { id: "#1027", table: "T-14", items: [{ name: "Pancake Stack", qty: 3 }, { name: "Espresso", qty: 3 }], status: "Ready", priority: "normal", timeElapsed: "18m", orderedAt: "12:34 PM" },
];

const columns: { status: KitchenStatus; label: string; color: string; icon: typeof Clock }[] = [
  { status: "Pending", label: "Queue", color: "border-warning/50", icon: Clock },
  { status: "Preparing", label: "In Progress", color: "border-primary/50", icon: ChefHat },
  { status: "Ready", label: "Ready to Serve", color: "border-success/50", icon: CheckCircle },
];

export default function KitchenPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Kitchen Dashboard"
        subtitle="Real-time order tracking for kitchen staff"
        actions={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="w-4 h-4" />
            <span>Avg. prep: <strong className="text-foreground">12 min</strong></span>
          </div>
        }
      />

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const ColIcon = col.icon;
          const items = kitchenOrders.filter((o) => o.status === col.status);
          return (
            <motion.div
              key={col.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 ${col.color} bg-card/50 p-4`}
            >
              <div className="flex items-center gap-2 mb-4">
                <ColIcon className="w-5 h-5 text-foreground" />
                <h2 className="font-display font-semibold text-foreground">{col.label}</h2>
                <span className="ml-auto bg-muted text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      className="glass-card-elevated p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-foreground text-sm">{order.id}</span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{order.table}</span>
                        </div>
                        {order.priority === "rush" && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="flex items-center gap-1 text-destructive text-xs font-bold"
                          >
                            <Flame className="w-3.5 h-3.5" /> RUSH
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-1.5 mb-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {item.qty}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              {item.special && (
                                <p className="text-[11px] text-warning flex items-center gap-1">
                                  <AlertCircle className="w-2.5 h-2.5" /> {item.special}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {order.timeElapsed} ago
                        </span>
                        {col.status === "Pending" && (
                          <motion.button whileTap={{ scale: 0.9 }}
                            className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-lg">
                            Start
                          </motion.button>
                        )}
                        {col.status === "Preparing" && (
                          <motion.button whileTap={{ scale: 0.9 }}
                            className="text-xs font-semibold bg-success/10 text-success px-3 py-1 rounded-lg">
                            Done
                          </motion.button>
                        )}
                        {col.status === "Ready" && (
                          <motion.button whileTap={{ scale: 0.9 }}
                            className="text-xs font-semibold bg-accent/10 text-accent px-3 py-1 rounded-lg">
                            Served
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
