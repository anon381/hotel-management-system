import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, Eye, Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";
import { AdminLayout as AppLayout } from "@/components/AdminLayout";
import { PageHeader } from "@/components/PageHeader";

type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Ready" | "Completed" | "Cancelled";

interface Order {
  id: string;
  table: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  time: string;
}

const orders: Order[] = [
  { id: "#1024", table: "T-05", customer: "John D.", items: [{ name: "Wagyu Steak", qty: 1, price: 85 }, { name: "Caesar Salad", qty: 1, price: 16 }], total: 101, status: "Preparing", time: "12:45 PM" },
  { id: "#1023", table: "T-12", customer: "Sarah M.", items: [{ name: "Margherita Pizza", qty: 2, price: 40 }, { name: "Tiramisu", qty: 1, price: 12 }], total: 52, status: "Ready", time: "12:38 PM" },
  { id: "#1022", table: "T-03", customer: "Mike R.", items: [{ name: "Truffle Pasta", qty: 1, price: 45 }, { name: "Mojito", qty: 2, price: 20 }], total: 65, status: "Completed", time: "12:30 PM" },
  { id: "#1021", table: "T-08", customer: "Emma L.", items: [{ name: "Grilled Salmon", qty: 1, price: 45 }], total: 45, status: "Pending", time: "12:50 PM" },
  { id: "#1020", table: "T-01", customer: "Walk-in", items: [{ name: "Burger Deluxe", qty: 2, price: 44 }, { name: "Espresso", qty: 2, price: 8 }], total: 52, status: "Confirmed", time: "12:25 PM" },
  { id: "#1019", table: "T-15", customer: "David K.", items: [{ name: "Pancake Stack", qty: 1, price: 14 }, { name: "Espresso", qty: 1, price: 4 }], total: 18, status: "Completed", time: "11:55 AM" },
  { id: "#1018", table: "T-07", customer: "Lisa W.", items: [{ name: "Spring Rolls", qty: 2, price: 16 }], total: 16, status: "Cancelled", time: "11:48 AM" },
];

const statusConfig: Record<OrderStatus, { color: string; icon: typeof Clock }> = {
  Pending: { color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  Confirmed: { color: "bg-info/10 text-info border-info/20", icon: CheckCircle },
  Preparing: { color: "bg-primary/10 text-primary border-primary/20", icon: ChefHat },
  Ready: { color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  Completed: { color: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
  Cancelled: { color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const statusFilters: OrderStatus[] = ["Pending", "Confirmed", "Preparing", "Ready", "Completed", "Cancelled"];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | OrderStatus>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = activeFilter === "All" ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <AppLayout>
      <PageHeader
        title="Order Management"
        subtitle="Track and manage all restaurant orders"
        actions={
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="gradient-warm text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Order
          </motion.button>
        }
      />

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter("All")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === "All" ? "gradient-warm text-primary-foreground shadow-md" : "bg-card border border-border text-foreground"}`}
        >All ({orders.length})</motion.button>
        {statusFilters.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setActiveFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === s ? "gradient-warm text-primary-foreground shadow-md" : "bg-card border border-border text-foreground"}`}
            >{s} ({count})</motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order list */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((order) => {
              const cfg = statusConfig[order.status];
              const SIcon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`glass-card p-4 cursor-pointer transition-all border-l-4 ${selectedOrder?.id === order.id ? "ring-2 ring-primary/30" : ""} ${cfg.color.split(" ").find(c => c.startsWith("border-"))}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-foreground">{order.id}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{order.table}</span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.color}`}>
                      <SIcon className="w-3 h-3" /> {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{order.time} · {order.customer}</span>
                    <span className="font-semibold text-foreground">${order.total}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card-elevated p-5 sticky top-8"
              >
                <h3 className="font-display font-bold text-xl text-foreground mb-1">Order {selectedOrder.id}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selectedOrder.table} · {selectedOrder.customer}</p>

                <div className="space-y-3 mb-4">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.qty}x {item.name}</span>
                      <span className="text-muted-foreground">${item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 mb-4">
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>${selectedOrder.total}</span>
                  </div>
                </div>

                {/* Status flow */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Flow</p>
                  <div className="flex gap-1">
                    {statusFilters.slice(0, 5).map((s) => {
                      const isActive = statusFilters.indexOf(selectedOrder.status) >= statusFilters.indexOf(s);
                      return (
                        <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${isActive ? "gradient-warm" : "bg-muted"}`} />
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{selectedOrder.status}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <motion.button whileTap={{ scale: 0.95 }} className="py-2 rounded-lg bg-success/10 text-success text-sm font-semibold">
                    Advance
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} className="py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-semibold">
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 text-center"
              >
                <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Select an order to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
