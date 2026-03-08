import { motion } from "framer-motion";
import { Clock, UtensilsCrossed } from "lucide-react";
import { KitchenLayout } from "@/components/KitchenLayout";
import { PageHeader } from "@/components/PageHeader";

const allOrders = [
  { id: "#1024", table: "T-05", items: "Grilled Salmon, Caesar Salad", status: "Preparing", time: "12:30 PM", priority: "high" },
  { id: "#1025", table: "T-02", items: "Wagyu Steak, Truffle Fries", status: "Preparing", time: "12:32 PM", priority: "high" },
  { id: "#1023", table: "T-12", items: "Margherita Pizza x2, Tiramisu", status: "Queue", time: "12:28 PM", priority: "medium" },
  { id: "#1021", table: "T-08", items: "Pasta Carbonara", status: "Queue", time: "12:25 PM", priority: "low" },
  { id: "#1026", table: "T-10", items: "Fish & Chips x2", status: "Ready", time: "12:20 PM", priority: "medium" },
  { id: "#1020", table: "T-01", items: "Burger Deluxe, Fries", status: "Completed", time: "12:10 PM", priority: "low" },
];

const statusColors: Record<string, string> = {
  Queue: "bg-warning/10 text-warning",
  Preparing: "bg-info/10 text-info",
  Ready: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

export default function KitchenOrders() {
  return (
    <KitchenLayout>
      <PageHeader title="All Orders" subtitle="Complete order list for kitchen staff" />
      <div className="space-y-3">
        {allOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-elevated p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{order.id} · {order.table}</p>
                <p className="text-xs text-muted-foreground truncate">{order.items}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{order.time}</span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </KitchenLayout>
  );
}
